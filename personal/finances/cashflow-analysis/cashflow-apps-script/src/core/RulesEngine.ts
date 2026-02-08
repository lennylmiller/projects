import { Scenario } from '../models/Scenario';
import { TransactionTemplate } from '../models/TransactionTemplate';
import { DateUtils } from './DateUtils';

/**
 * Rules Engine
 * Evaluates formulas and applies conditional logic for transaction calculations
 */
export class RulesEngine {
  private config: Record<string, any>;

  constructor(config: Record<string, any> = {}) {
    this.config = config;
  }

  /**
   * Evaluate a value that might be a formula
   */
  evaluateValue(
    value: number | { formula: string; context?: Record<string, any> },
    context: Record<string, any> = {}
  ): number {
    // If it's already a number, return it
    if (typeof value === 'number') {
      return value;
    }

    // If it's a formula object
    if (typeof value === 'object' && 'formula' in value) {
      const fullContext = { ...context, ...(value.context || {}) };
      return this.evaluateFormula(value.formula, fullContext);
    }

    // Default to 0 if invalid
    Logger.log('Invalid value type: ' + JSON.stringify(value));
    return 0;
  }

  /**
   * Evaluate a formula string
   */
  evaluateFormula(formula: string, context: Record<string, any> = {}): number {
    try {
      // Replace CONFIG references with actual values
      let processedFormula = formula;

      // Handle CONFIG.variable_name references
      const configPattern = /CONFIG\.(\w+)/g;
      processedFormula = processedFormula.replace(configPattern, (_match, varName) => {
        const value = this.config[varName];
        if (value === undefined) {
          Logger.log(`CONFIG variable not found: ${varName}`);
          return 'null';
        }
        // If it's a string (like a date), wrap in quotes
        if (typeof value === 'string') {
          return `"${value}"`;
        }
        return String(value);
      });

      // Handle context variable references
      Object.keys(context).forEach(key => {
        const pattern = new RegExp(`\\b${key}\\b`, 'g');
        const value = context[key];
        if (typeof value === 'string') {
          processedFormula = processedFormula.replace(pattern, `"${value}"`);
        } else {
          processedFormula = processedFormula.replace(pattern, String(value));
        }
      });

      // Safely evaluate the formula (Apps Script V8 runtime supports eval)
      const result = eval(processedFormula);
      return Number(result);

    } catch (error: any) {
      Logger.log(`Error evaluating formula: ${formula}`);
      Logger.log(error);
      throw new Error(`Formula evaluation failed: ${formula} - ${error.message}`);
    }
  }

  /**
   * Check if a transaction should be active on a given date
   */
  isTransactionActive(template: TransactionTemplate, date: string): boolean {
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
    if (template.endsOn) {
      let endDate: Date;
      if (typeof template.endsOn === 'object' && 'formula' in template.endsOn) {
        const evaluatedDate = this.evaluateFormula(template.endsOn.formula, { date });
        endDate = DateUtils.parseDate(String(evaluatedDate));
      } else {
        endDate = DateUtils.parseDate(template.endsOn);
      }

      // Use > instead of >= so that transaction is active up to (but not including) the end date
      if (currentDate > endDate) {
        return false;
      }
    }

    // One-time transactions only occur on their start date
    if (template.frequency === 'once' && template.startDate) {
      const startDate = DateUtils.parseDate(template.startDate);
      return DateUtils.formatDate(currentDate) === DateUtils.formatDate(startDate);
    }

    return true;
  }

  /**
   * Check if a transaction should occur on a specific date based on frequency
   */
  shouldTransactionOccur(template: TransactionTemplate, date: string): boolean {
    // First check if transaction is active
    if (!this.isTransactionActive(template, date)) {
      return false;
    }

    const currentDate = DateUtils.parseDate(date);
    const day = currentDate.getDate();

    // Check frequency-specific rules
    switch (template.frequency) {
      case 'once':
        // Already handled in isTransactionActive
        return true;

      case 'monthly':
        // Occurs on 1st and 15th of each month by default
        return day === 1 || day === 15;

      case 'bi-weekly':
        // Occurs every 14 days from start date
        if (!template.startDate) return false;
        const startDate = DateUtils.parseDate(template.startDate);
        const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff % 14 === 0;

      case 'weekly':
        // Occurs every 7 days from start date
        if (!template.startDate) return false;
        const weekStartDate = DateUtils.parseDate(template.startDate);
        const weekDaysDiff = Math.floor((currentDate.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24));
        return weekDaysDiff >= 0 && weekDaysDiff % 7 === 0;

      case 'quarterly':
        // Occurs every 3 months from start date
        if (!template.startDate) return false;
        const quarterStartDate = DateUtils.parseDate(template.startDate);
        const monthsDiff = (currentDate.getFullYear() - quarterStartDate.getFullYear()) * 12 +
                          (currentDate.getMonth() - quarterStartDate.getMonth());
        return monthsDiff >= 0 && monthsDiff % 3 === 0 &&
               currentDate.getDate() === quarterStartDate.getDate();

      case 'yearly':
        // Occurs every year on the same month/day
        if (!template.startDate) return false;
        const yearlyStartDate = DateUtils.parseDate(template.startDate);
        const yearsDiff = currentDate.getFullYear() - yearlyStartDate.getFullYear();
        return yearsDiff >= 0 &&
               currentDate.getMonth() === yearlyStartDate.getMonth() &&
               currentDate.getDate() === yearlyStartDate.getDate();

      default:
        Logger.log(`Unknown frequency: ${template.frequency}`);
        return false;
    }
  }

  /**
   * Calculate the transaction amount for a specific date
   */
  calculateAmount(
    template: TransactionTemplate,
    date: string,
    context: Record<string, any> = {}
  ): number {
    const amount = this.evaluateValue(template.amount, { ...context, date });

    // Expenses should be negative
    if (template.type === 'expense' && amount > 0) {
      return -amount;
    }

    return amount;
  }

  /**
   * Apply conditional rules (e.g., transaction dependencies)
   */
  applyConditionalRules(
    templates: TransactionTemplate[],
    date: string,
    scenario: Scenario
  ): TransactionTemplate[] {
    const activeTemplates: TransactionTemplate[] = [];

    for (const template of templates) {
      // Check if enabled in scenario
      if (!scenario.isTransactionEnabled(template.id)) {
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
   * Get all CONFIG variables
   */
  getConfig(): Record<string, any> {
    return { ...this.config };
  }

  /**
   * Get a specific CONFIG variable
   */
  getConfigValue<T = any>(key: string, defaultValue: T | null = null): T | null {
    return this.config.hasOwnProperty(key) ? this.config[key] : defaultValue;
  }

  /**
   * Set a CONFIG variable
   */
  setConfigValue(key: string, value: any): void {
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
   */
  static linearGrowth(base: number, rate: number, periods: number): number {
    return base + (rate * periods);
  }

  /**
   * Percentage increase
   */
  static percentageIncrease(amount: number, percentage: number): number {
    return amount * (1 + percentage / 100);
  }

  /**
   * Conditional amount based on date comparison
   */
  static conditionalByDate(
    date: string,
    thresholdDate: string,
    beforeAmount: number,
    afterAmount: number
  ): number {
    const currentDate = DateUtils.parseDate(date);
    const threshold = DateUtils.parseDate(thresholdDate);
    return currentDate < threshold ? beforeAmount : afterAmount;
  }
}
