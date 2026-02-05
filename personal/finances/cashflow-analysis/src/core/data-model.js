/**
 * Data Model - Transaction Templates, Scenarios, Actuals, and Period Snapshots
 *
 * This module defines the core data structures for the cashflow analysis engine.
 * All JSON schemas with validation rules are documented in /docs/data-schema.md
 */

/**
 * Transaction Template
 * Defines a reusable income or expense pattern
 */
export class TransactionTemplate {
  constructor({
    id,
    name,
    type,
    amount,
    frequency,
    startDate = null,
    endDate = null,
    endsOn = null,
    isRecurring = true,
    category = null
  }) {
    this.id = id;
    this.name = name;
    this.type = type; // 'income' or 'expense'
    this.amount = amount; // number or { formula: string }
    this.frequency = frequency; // 'monthly', 'bi-weekly', 'weekly', 'quarterly', 'one-time'
    this.startDate = startDate;
    this.endDate = endDate;
    this.endsOn = endsOn; // Can be date or { formula: string }
    this.isRecurring = isRecurring;
    this.category = category;
  }

  /**
   * Validate the transaction template
   */
  validate() {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('Transaction template must have a valid id');
    }
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Transaction template must have a valid name');
    }
    if (!['income', 'expense'].includes(this.type)) {
      throw new Error('Transaction type must be "income" or "expense"');
    }
    if (typeof this.amount !== 'number' &&
        (typeof this.amount !== 'object' || !this.amount.formula)) {
      throw new Error('Amount must be a number or formula object');
    }
    const validFrequencies = ['monthly', 'bi-weekly', 'weekly', 'quarterly', 'one-time', 'custom'];
    if (!validFrequencies.includes(this.frequency)) {
      throw new Error(`Frequency must be one of: ${validFrequencies.join(', ')}`);
    }
    return true;
  }
}

/**
 * Scenario Definition
 * Defines a what-if scenario with enabled transactions and CONFIG values
 */
export class Scenario {
  constructor({
    id,
    name,
    enabled_transactions = [],
    config = {},
    color = '#3B82F6',
    description = '',
    basedOn = null
  }) {
    this.id = id;
    this.name = name;
    this.enabled_transactions = enabled_transactions; // Array of template IDs
    this.config = config; // Key-value pairs for CONFIG variables
    this.color = color; // For chart visualization
    this.description = description;
    this.basedOn = basedOn; // Optional: scenario inheritance
  }

  /**
   * Validate the scenario
   */
  validate() {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('Scenario must have a valid id');
    }
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Scenario must have a valid name');
    }
    if (!Array.isArray(this.enabled_transactions)) {
      throw new Error('enabled_transactions must be an array');
    }
    if (typeof this.config !== 'object' || this.config === null) {
      throw new Error('config must be an object');
    }
    return true;
  }

  /**
   * Check if a transaction template is enabled in this scenario
   */
  isTransactionEnabled(templateId) {
    return this.enabled_transactions.includes(templateId);
  }

  /**
   * Get a CONFIG value
   */
  getConfig(key, defaultValue = null) {
    return this.config.hasOwnProperty(key) ? this.config[key] : defaultValue;
  }
}

/**
 * Actual Transaction
 * Represents a historical, locked-in transaction that overrides projections
 */
export class ActualTransaction {
  constructor({
    id = null,
    date,
    template_id,
    amount,
    isActual = true,
    notes = '',
    createdAt = null
  }) {
    this.id = id || `actual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.date = date; // ISO date string
    this.template_id = template_id;
    this.amount = amount;
    this.isActual = isActual;
    this.notes = notes;
    this.createdAt = createdAt || new Date().toISOString();
  }

  /**
   * Validate the actual transaction
   */
  validate() {
    if (!this.date) {
      throw new Error('Actual transaction must have a date');
    }
    if (!this.template_id) {
      throw new Error('Actual transaction must have a template_id');
    }
    if (typeof this.amount !== 'number') {
      throw new Error('Actual transaction amount must be a number');
    }
    return true;
  }
}

/**
 * Transaction Instance
 * A calculated transaction for a specific date (actual or projected)
 */
export class TransactionInstance {
  constructor({
    template_id,
    name,
    type,
    amount,
    isActual = false,
    notes = '',
    category = null
  }) {
    this.template_id = template_id;
    this.name = name;
    this.type = type;
    this.amount = amount;
    this.isActual = isActual;
    this.notes = notes;
    this.category = category;
  }
}

/**
 * Period Snapshot
 * Calculated cashflow state for a specific date and scenario
 */
export class PeriodSnapshot {
  constructor({
    scenario_id,
    date,
    starting_balance,
    transactions = [],
    ending_balance,
    metadata = {}
  }) {
    this.scenario_id = scenario_id;
    this.date = date; // ISO date string
    this.starting_balance = starting_balance;
    this.transactions = transactions; // Array of TransactionInstance
    this.ending_balance = ending_balance;
    this.metadata = metadata;
  }

  /**
   * Calculate total income for this period
   */
  getTotalIncome() {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Calculate total expenses for this period
   */
  getTotalExpenses() {
    return this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  /**
   * Calculate net change (income - expenses)
   */
  getNetChange() {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  /**
   * Validate the period snapshot
   */
  validate() {
    if (!this.scenario_id) {
      throw new Error('Period snapshot must have a scenario_id');
    }
    if (!this.date) {
      throw new Error('Period snapshot must have a date');
    }
    if (typeof this.starting_balance !== 'number') {
      throw new Error('starting_balance must be a number');
    }
    if (typeof this.ending_balance !== 'number') {
      throw new Error('ending_balance must be a number');
    }
    if (!Array.isArray(this.transactions)) {
      throw new Error('transactions must be an array');
    }
    return true;
  }
}

/**
 * Date utilities for period calculation
 */
export class DateUtils {
  /**
   * Parse date string to Date object
   * Uses noon UTC to avoid timezone issues with date-only strings
   */
  static parseDate(dateStr) {
    if (dateStr instanceof Date) return dateStr;

    // For ISO date strings (YYYY-MM-DD), add time to avoid timezone issues
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Parse as noon UTC to avoid timezone boundary issues
      return new Date(dateStr + 'T12:00:00Z');
    }

    return new Date(dateStr);
  }

  /**
   * Format date as ISO string (YYYY-MM-DD)
   */
  static formatDate(date) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * Compare two dates
   * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
   */
  static compareDates(date1, date2) {
    const d1 = this.parseDate(date1);
    const d2 = this.parseDate(date2);
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  }

  /**
   * Check if date is within range
   */
  static isDateInRange(date, startDate, endDate) {
    const d = this.parseDate(date);
    const start = startDate ? this.parseDate(startDate) : null;
    const end = endDate ? this.parseDate(endDate) : null;

    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  }

  /**
   * Generate bi-weekly dates from start date
   */
  static generateBiWeeklyDates(startDate, endDate) {
    const dates = [];
    let current = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setDate(current.getDate() + 14);
    }

    return dates;
  }

  /**
   * Generate monthly dates (1st and 15th of each month)
   */
  static generateMonthlyDates(startDate, endDate, daysOfMonth = [1, 15]) {
    const dates = [];
    let current = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    while (current <= end) {
      for (const day of daysOfMonth) {
        const date = new Date(current.getFullYear(), current.getMonth(), day);
        if (date >= this.parseDate(startDate) && date <= end) {
          dates.push(this.formatDate(date));
        }
      }
      current.setMonth(current.getMonth() + 1);
    }

    return dates.sort();
  }

  /**
   * Generate period dates (combination of transaction frequencies)
   */
  static generatePeriodDates(startDate, endDate, templates) {
    const dateSet = new Set();

    // Add dates based on all template frequencies
    templates.forEach(template => {
      let templateDates = [];

      switch (template.frequency) {
        case 'bi-weekly':
          templateDates = this.generateBiWeeklyDates(
            template.startDate || startDate,
            endDate
          );
          break;
        case 'monthly':
          templateDates = this.generateMonthlyDates(
            template.startDate || startDate,
            endDate,
            [1, 15] // Default to 1st and 15th
          );
          break;
        case 'weekly':
          templateDates = this.generateWeeklyDates(
            template.startDate || startDate,
            endDate
          );
          break;
        case 'quarterly':
          templateDates = this.generateQuarterlyDates(
            template.startDate || startDate,
            endDate
          );
          break;
        case 'one-time':
          if (template.startDate) {
            templateDates = [this.formatDate(template.startDate)];
          }
          break;
      }

      templateDates.forEach(date => dateSet.add(date));
    });

    // Convert to sorted array
    return Array.from(dateSet).sort();
  }

  /**
   * Generate weekly dates
   */
  static generateWeeklyDates(startDate, endDate) {
    const dates = [];
    let current = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setDate(current.getDate() + 7);
    }

    return dates;
  }

  /**
   * Generate quarterly dates
   */
  static generateQuarterlyDates(startDate, endDate) {
    const dates = [];
    let current = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setMonth(current.getMonth() + 3);
    }

    return dates;
  }
}

export default {
  TransactionTemplate,
  Scenario,
  ActualTransaction,
  TransactionInstance,
  PeriodSnapshot,
  DateUtils
};
