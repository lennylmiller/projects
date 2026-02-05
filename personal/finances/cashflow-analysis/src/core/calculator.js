/**
 * Calculator - Core Cashflow Calculation Engine
 *
 * Takes transaction templates, scenarios, and actuals as input
 * Outputs period snapshots for each scenario
 */

import {
  TransactionInstance,
  PeriodSnapshot,
  DateUtils
} from './data-model.js';
import { RulesEngine } from './rules-engine.js';

/**
 * Cashflow Calculator
 * Main engine for calculating period snapshots across scenarios
 */
export class CashflowCalculator {
  constructor(templates = [], actuals = []) {
    this.templates = templates;
    this.actuals = actuals;

    // Index actuals by date and template_id for fast lookup
    this.actualsIndex = this.buildActualsIndex(actuals);
  }

  /**
   * Build an index of actuals for fast lookup
   * @param {Array<ActualTransaction>} actuals
   * @returns {Map} Map of "date:template_id" -> ActualTransaction
   */
  buildActualsIndex(actuals) {
    const index = new Map();
    actuals.forEach(actual => {
      const key = `${actual.date}:${actual.template_id}`;
      index.set(key, actual);
    });
    return index;
  }

  /**
   * Get actual transaction if it exists
   * @param {string} date
   * @param {string} templateId
   * @returns {ActualTransaction|null}
   */
  getActual(date, templateId) {
    const key = `${date}:${templateId}`;
    return this.actualsIndex.get(key) || null;
  }

  /**
   * Calculate all period snapshots for a scenario
   * @param {Scenario} scenario
   * @param {string} startDate - ISO date string
   * @param {string} endDate - ISO date string
   * @param {number} initialBalance - Starting balance
   * @returns {Array<PeriodSnapshot>} Array of period snapshots
   */
  calculateScenario(scenario, startDate, endDate, initialBalance = 0) {
    // Create rules engine for this scenario
    const rulesEngine = new RulesEngine(scenario);

    // Generate period dates based on all transaction frequencies
    const periodDates = this.generatePeriodDates(startDate, endDate);

    // Calculate snapshots for each period
    const snapshots = [];
    let currentBalance = initialBalance;

    for (const date of periodDates) {
      const snapshot = this.calculatePeriod(
        scenario,
        rulesEngine,
        date,
        currentBalance
      );

      snapshots.push(snapshot);
      currentBalance = snapshot.ending_balance;
    }

    return snapshots;
  }

  /**
   * Calculate a single period snapshot
   * @param {Scenario} scenario
   * @param {RulesEngine} rulesEngine
   * @param {string} date - ISO date string
   * @param {number} startingBalance
   * @returns {PeriodSnapshot}
   */
  calculatePeriod(scenario, rulesEngine, date, startingBalance) {
    // Get active templates for this date
    const activeTemplates = rulesEngine.applyConditionalRules(this.templates, date);

    // Resolve dependencies
    const resolvedTemplates = rulesEngine.resolveDependencies(activeTemplates, date);

    // Calculate transactions for this period
    const transactions = [];
    let balance = startingBalance;

    for (const template of resolvedTemplates) {
      // Check if there's an actual for this transaction
      const actual = this.getActual(date, template.id);

      let transactionInstance;

      if (actual) {
        // Use actual value
        transactionInstance = new TransactionInstance({
          template_id: template.id,
          name: template.name,
          type: template.type,
          amount: actual.amount,
          isActual: true,
          notes: actual.notes,
          category: template.category
        });
      } else {
        // Calculate projected value
        const amount = rulesEngine.calculateAmount(template, date);

        transactionInstance = new TransactionInstance({
          template_id: template.id,
          name: template.name,
          type: template.type,
          amount: amount,
          isActual: false,
          notes: '',
          category: template.category
        });
      }

      transactions.push(transactionInstance);
      balance += transactionInstance.amount;
    }

    // Create period snapshot
    const snapshot = new PeriodSnapshot({
      scenario_id: scenario.id,
      date: date,
      starting_balance: startingBalance,
      transactions: transactions,
      ending_balance: balance,
      metadata: {
        calculatedAt: new Date().toISOString()
      }
    });

    return snapshot;
  }

  /**
   * Generate period dates based on all transaction frequencies
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Array<string>} Sorted array of ISO date strings
   */
  generatePeriodDates(startDate, endDate) {
    return DateUtils.generatePeriodDates(startDate, endDate, this.templates);
  }

  /**
   * Calculate multiple scenarios in parallel
   * @param {Array<Scenario>} scenarios
   * @param {string} startDate
   * @param {string} endDate
   * @param {number} initialBalance
   * @returns {Map<string, Array<PeriodSnapshot>>} Map of scenario_id -> snapshots
   */
  calculateMultipleScenarios(scenarios, startDate, endDate, initialBalance = 0) {
    const results = new Map();

    for (const scenario of scenarios) {
      const snapshots = this.calculateScenario(
        scenario,
        startDate,
        endDate,
        initialBalance
      );
      results.set(scenario.id, snapshots);
    }

    return results;
  }

  /**
   * Add a new actual transaction
   * @param {ActualTransaction} actual
   */
  addActual(actual) {
    this.actuals.push(actual);
    const key = `${actual.date}:${actual.template_id}`;
    this.actualsIndex.set(key, actual);
  }

  /**
   * Remove an actual transaction
   * @param {string} date
   * @param {string} templateId
   */
  removeActual(date, templateId) {
    const key = `${date}:${templateId}`;
    this.actualsIndex.delete(key);
    this.actuals = this.actuals.filter(
      a => !(a.date === date && a.template_id === templateId)
    );
  }

  /**
   * Get all actuals for a specific date
   * @param {string} date
   * @returns {Array<ActualTransaction>}
   */
  getActualsForDate(date) {
    return this.actuals.filter(a => a.date === date);
  }

  /**
   * Get all actuals for a date range
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Array<ActualTransaction>}
   */
  getActualsForRange(startDate, endDate) {
    return this.actuals.filter(a => {
      return DateUtils.isDateInRange(a.date, startDate, endDate);
    });
  }

  /**
   * Update templates
   * @param {Array<TransactionTemplate>} templates
   */
  setTemplates(templates) {
    this.templates = templates;
  }

  /**
   * Get all templates
   * @returns {Array<TransactionTemplate>}
   */
  getTemplates() {
    return this.templates;
  }

  /**
   * Get a specific template by id
   * @param {string} templateId
   * @returns {TransactionTemplate|null}
   */
  getTemplate(templateId) {
    return this.templates.find(t => t.id === templateId) || null;
  }
}

/**
 * Comparison utilities for analyzing scenarios
 */
export class ScenarioComparison {
  /**
   * Compare ending balances across scenarios
   * @param {Map<string, Array<PeriodSnapshot>>} scenarioResults
   * @returns {Array} Comparison data
   */
  static compareEndingBalances(scenarioResults) {
    const comparison = [];

    // Get all dates (assume all scenarios have same dates)
    const firstScenario = scenarioResults.values().next().value;
    if (!firstScenario) return comparison;

    const dates = firstScenario.map(s => s.date);

    for (const date of dates) {
      const dataPoint = { date };

      scenarioResults.forEach((snapshots, scenarioId) => {
        const snapshot = snapshots.find(s => s.date === date);
        if (snapshot) {
          dataPoint[scenarioId] = snapshot.ending_balance;
        }
      });

      comparison.push(dataPoint);
    }

    return comparison;
  }

  /**
   * Find the date when scenarios diverge the most
   * @param {Map<string, Array<PeriodSnapshot>>} scenarioResults
   * @returns {object} Date and max difference
   */
  static findMaxDivergence(scenarioResults) {
    const comparison = this.compareEndingBalances(scenarioResults);
    let maxDiff = 0;
    let maxDate = null;
    let maxBalances = null;

    for (const dataPoint of comparison) {
      const balances = Object.values(dataPoint).filter(v => typeof v === 'number');
      const min = Math.min(...balances);
      const max = Math.max(...balances);
      const diff = max - min;

      if (diff > maxDiff) {
        maxDiff = diff;
        maxDate = dataPoint.date;
        maxBalances = { ...dataPoint };
      }
    }

    return {
      date: maxDate,
      difference: maxDiff,
      balances: maxBalances
    };
  }

  /**
   * Calculate total income and expenses per scenario
   * @param {Map<string, Array<PeriodSnapshot>>} scenarioResults
   * @returns {Map<string, object>} Summary per scenario
   */
  static calculateSummaries(scenarioResults) {
    const summaries = new Map();

    scenarioResults.forEach((snapshots, scenarioId) => {
      let totalIncome = 0;
      let totalExpenses = 0;
      let actualIncome = 0;
      let actualExpenses = 0;
      let projectedIncome = 0;
      let projectedExpenses = 0;

      snapshots.forEach(snapshot => {
        snapshot.transactions.forEach(transaction => {
          if (transaction.type === 'income') {
            totalIncome += transaction.amount;
            if (transaction.isActual) {
              actualIncome += transaction.amount;
            } else {
              projectedIncome += transaction.amount;
            }
          } else {
            const absAmount = Math.abs(transaction.amount);
            totalExpenses += absAmount;
            if (transaction.isActual) {
              actualExpenses += absAmount;
            } else {
              projectedExpenses += absAmount;
            }
          }
        });
      });

      summaries.set(scenarioId, {
        totalIncome,
        totalExpenses,
        netChange: totalIncome - totalExpenses,
        actualIncome,
        actualExpenses,
        projectedIncome,
        projectedExpenses,
        startingBalance: snapshots[0]?.starting_balance || 0,
        endingBalance: snapshots[snapshots.length - 1]?.ending_balance || 0
      });
    });

    return summaries;
  }
}

export default {
  CashflowCalculator,
  ScenarioComparison
};
