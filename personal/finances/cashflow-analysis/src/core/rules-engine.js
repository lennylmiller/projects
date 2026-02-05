/**
 * Rules Engine - Formula Evaluation and Conditional Logic
 *
 * Handles:
 * - CONFIG variable evaluation
 * - Formula parsing and execution
 * - Date-based conditional logic
 * - Transaction dependencies
 */

import { DateUtils } from './data-model.js';

/**
 * Rules Engine
 * Evaluates formulas and applies conditional logic for transaction calculations
 */
export class RulesEngine {
  constructor(scenario) {
    this.scenario = scenario;
    this.config = scenario.config;
  }

  /**
   * Evaluate a value that might be a formula
   * @param {number|object} value - Number or { formula: string }
   * @param {object} context - Additional context for formula evaluation
   * @returns {number} Evaluated value
   */
  evaluateValue(value, context = {}) {
    // If it's already a number, return it
    if (typeof value === 'number') {
      return value;
    }

    // If it's a formula object
    if (typeof value === 'object' && value.formula) {
      return this.evaluateFormula(value.formula, context);
    }

    // Default to 0 if invalid
    console.warn('Invalid value type:', value);
    return 0;
  }

  /**
   * Evaluate a formula string
   * @param {string} formula - Formula string (e.g., "CONFIG.Monthly_Mortgage_Payment")
   * @param {object} context - Additional variables available in formula
   * @returns {number|string|Date} Evaluated result
   */
  evaluateFormula(formula, context = {}) {
    try {
      // Replace CONFIG references with actual values
      let processedFormula = formula;

      // Handle CONFIG.variable_name references
      const configPattern = /CONFIG\.(\w+)/g;
      processedFormula = processedFormula.replace(configPattern, (match, varName) => {
        const value = this.config[varName];
        if (value === undefined) {
          console.warn(`CONFIG variable not found: ${varName}`);
          return 'null';
        }
        // If it's a string (like a date), wrap in quotes
        if (typeof value === 'string') {
          return `"${value}"`;
        }
        return value;
      });

      // Handle context variable references
      Object.keys(context).forEach(key => {
        const pattern = new RegExp(`\\b${key}\\b`, 'g');
        const value = context[key];
        if (typeof value === 'string') {
          processedFormula = processedFormula.replace(pattern, `"${value}"`);
        } else {
          processedFormula = processedFormula.replace(pattern, value);
        }
      });

      // Safely evaluate the formula
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${processedFormula}`)();
      return result;
    } catch (error) {
      console.error(`Error evaluating formula: ${formula}`, error);
      throw new Error(`Formula evaluation failed: ${formula} - ${error.message}`);
    }
  }

  /**
   * Check if a transaction should be active on a given date
   * @param {TransactionTemplate} template
   * @param {string} date - ISO date string
   * @returns {boolean}
   */
  isTransactionActive(template, date) {
    const currentDate = DateUtils.parseDate(date);

    // Check start date
    if (template.startDate) {
      const startDate = DateUtils.parseDate(template.startDate);
      if (currentDate < startDate) {
        return false;
      }
    }

    // Check end date
    if (template.endDate) {
      const endDate = DateUtils.parseDate(template.endDate);
      if (currentDate > endDate) {
        return false;
      }
    }

    // Check endsOn (can be a formula)
    // Note: Transaction should stop AFTER the endDate, not ON the endDate
    if (template.endsOn) {
      let endDate;
      if (typeof template.endsOn === 'object' && template.endsOn.formula) {
        const evaluatedDate = this.evaluateFormula(template.endsOn.formula, { date });
        endDate = DateUtils.parseDate(evaluatedDate);
      } else {
        endDate = DateUtils.parseDate(template.endsOn);
      }

      // Use > instead of >= so that transaction is active up to (but not including) the end date
      if (currentDate > endDate) {
        return false;
      }
    }

    // One-time transactions only occur on their start date
    if (template.frequency === 'one-time' && template.startDate) {
      const startDate = DateUtils.parseDate(template.startDate);
      return DateUtils.formatDate(currentDate) === DateUtils.formatDate(startDate);
    }

    return true;
  }

  /**
   * Check if a transaction should occur on a specific date based on frequency
   * @param {TransactionTemplate} template
   * @param {string} date - ISO date string
   * @returns {boolean}
   */
  shouldTransactionOccur(template, date) {
    // First check if transaction is active
    if (!this.isTransactionActive(template, date)) {
      return false;
    }

    const currentDate = DateUtils.parseDate(date);
    const day = currentDate.getDate();

    // Check frequency-specific rules
    switch (template.frequency) {
      case 'one-time':
        // Already handled in isTransactionActive
        return true;

      case 'monthly':
        // Occurs on 1st and 15th of each month by default
        return day === 1 || day === 15;

      case 'bi-weekly':
        // Occurs every 14 days from start date
        if (!template.startDate) return false;
        const startDate = DateUtils.parseDate(template.startDate);
        const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff % 14 === 0;

      case 'weekly':
        // Occurs every 7 days from start date
        if (!template.startDate) return false;
        const weekStartDate = DateUtils.parseDate(template.startDate);
        const weekDaysDiff = Math.floor((currentDate - weekStartDate) / (1000 * 60 * 60 * 24));
        return weekDaysDiff >= 0 && weekDaysDiff % 7 === 0;

      case 'quarterly':
        // Occurs every 3 months from start date
        if (!template.startDate) return false;
        const quarterStartDate = DateUtils.parseDate(template.startDate);
        const monthsDiff = (currentDate.getFullYear() - quarterStartDate.getFullYear()) * 12 +
                          (currentDate.getMonth() - quarterStartDate.getMonth());
        return monthsDiff >= 0 && monthsDiff % 3 === 0 &&
               currentDate.getDate() === quarterStartDate.getDate();

      case 'custom':
        // Custom frequency requires additional logic (could be extended)
        return false;

      default:
        console.warn(`Unknown frequency: ${template.frequency}`);
        return false;
    }
  }

  /**
   * Calculate the transaction amount for a specific date
   * @param {TransactionTemplate} template
   * @param {string} date - ISO date string
   * @param {object} context - Additional context
   * @returns {number}
   */
  calculateAmount(template, date, context = {}) {
    const amount = this.evaluateValue(template.amount, { ...context, date });

    // Expenses should be negative
    if (template.type === 'expense' && amount > 0) {
      return -amount;
    }

    return amount;
  }

  /**
   * Apply conditional rules (e.g., transaction dependencies)
   * @param {Array} templates - All transaction templates
   * @param {string} date - Current date
   * @returns {Array} Filtered templates that should be active
   */
  applyConditionalRules(templates, date) {
    const activeTemplates = [];

    for (const template of templates) {
      // Check if enabled in scenario
      if (!this.scenario.isTransactionEnabled(template.id)) {
        continue;
      }

      // Check if should occur on this date
      if (!this.shouldTransactionOccur(template, date)) {
        continue;
      }

      activeTemplates.push(template);
    }

    return activeTemplates;
  }

  /**
   * Resolve transaction dependencies
   * Example: If house is sold, automatically disable mortgage
   * @param {Array} templates - Active templates for this period
   * @param {string} date - Current date
   * @param {object} context - Additional context (e.g., previous transactions)
   * @returns {Array} Templates after dependency resolution
   */
  resolveDependencies(templates, date, context = {}) {
    // This is a placeholder for advanced dependency logic
    // Can be extended to handle:
    // - One transaction triggering another
    // - One transaction disabling another
    // - Progressive calculations based on previous periods

    // Example: If "house_sale" occurred, disable "mortgage"
    const houseSaleOccurred = templates.some(t => t.id === 'house_sale');
    if (houseSaleOccurred) {
      return templates.filter(t => t.id !== 'mortgage');
    }

    return templates;
  }

  /**
   * Get all CONFIG variables
   * @returns {object} CONFIG variables
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Get a specific CONFIG variable
   * @param {string} key - Variable name
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Variable value
   */
  getConfigValue(key, defaultValue = null) {
    return this.config.hasOwnProperty(key) ? this.config[key] : defaultValue;
  }

  /**
   * Set a CONFIG variable (for testing/debugging)
   * @param {string} key - Variable name
   * @param {*} value - Variable value
   */
  setConfigValue(key, value) {
    this.config[key] = value;
  }
}

/**
 * Formula Helper Functions
 * Common formulas that can be used in templates
 */
export class FormulaHelpers {
  /**
   * Linear growth formula
   * @param {number} base - Base amount
   * @param {number} rate - Growth rate per period
   * @param {number} periods - Number of periods
   * @returns {number}
   */
  static linearGrowth(base, rate, periods) {
    return base + (rate * periods);
  }

  /**
   * Percentage increase
   * @param {number} amount - Base amount
   * @param {number} percentage - Percentage increase
   * @returns {number}
   */
  static percentageIncrease(amount, percentage) {
    return amount * (1 + percentage / 100);
  }

  /**
   * Conditional amount based on date comparison
   * @param {string} date - Current date
   * @param {string} thresholdDate - Threshold date
   * @param {number} beforeAmount - Amount if before threshold
   * @param {number} afterAmount - Amount if after threshold
   * @returns {number}
   */
  static conditionalByDate(date, thresholdDate, beforeAmount, afterAmount) {
    const currentDate = DateUtils.parseDate(date);
    const threshold = DateUtils.parseDate(thresholdDate);
    return currentDate < threshold ? beforeAmount : afterAmount;
  }
}

export default {
  RulesEngine,
  FormulaHelpers
};
