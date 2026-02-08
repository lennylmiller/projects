import { TransactionTemplate } from '../models/TransactionTemplate';
import { Scenario } from '../models/Scenario';
import { ActualTransaction } from '../models/ActualTransaction';
import { PeriodSnapshot } from '../models/PeriodSnapshot';
import { TransactionInstance } from '../types';
import { RulesEngine } from './RulesEngine';
import { DateUtils } from './DateUtils';

/**
 * Cashflow Calculator
 * Main engine for calculating period snapshots across scenarios
 */
export class CashflowCalculator {
  private templates: TransactionTemplate[];
  private actuals: ActualTransaction[];
  private actualsIndex: Map<string, ActualTransaction>;

  constructor(templates: TransactionTemplate[] = [], actuals: ActualTransaction[] = []) {
    this.templates = templates;
    this.actuals = actuals;
    this.actualsIndex = this.buildActualsIndex(actuals);
  }

  /**
   * Build an index of actuals for fast lookup (O(1))
   */
  private buildActualsIndex(actuals: ActualTransaction[]): Map<string, ActualTransaction> {
    const index = new Map<string, ActualTransaction>();
    actuals.forEach(actual => {
      const key = `${actual.date}:${actual.template_id}`;
      index.set(key, actual);
    });
    return index;
  }

  /**
   * Get actual transaction if it exists
   */
  getActual(date: string, templateId: string): ActualTransaction | null {
    const key = `${date}:${templateId}`;
    return this.actualsIndex.get(key) || null;
  }

  /**
   * Calculate all period snapshots for a scenario
   */
  calculateScenario(
    scenario: Scenario,
    startDate: string,
    endDate: string,
    initialBalance: number = 0
  ): PeriodSnapshot[] {
    // Create rules engine for this scenario
    const rulesEngine = new RulesEngine(scenario.config);

    // Generate period dates based on all transaction frequencies
    const periodDates = this.generatePeriodDates(startDate, endDate);

    // Calculate snapshots for each period
    const snapshots: PeriodSnapshot[] = [];
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
   */
  private calculatePeriod(
    scenario: Scenario,
    rulesEngine: RulesEngine,
    date: string,
    startingBalance: number
  ): PeriodSnapshot {
    // Get active templates for this date
    const activeTemplates = rulesEngine.applyConditionalRules(
      this.templates,
      date,
      scenario
    );

    // Calculate transactions for this period
    const transactions: TransactionInstance[] = [];
    let balance = startingBalance;

    for (const template of activeTemplates) {
      // Check if there's an actual for this transaction
      const actual = this.getActual(date, template.id);

      let transactionInstance: TransactionInstance;

      if (actual) {
        // Use actual value
        transactionInstance = {
          template_id: template.id,
          name: template.name,
          amount: actual.amount,
          isActual: true,
          note: actual.note,
          reference: actual.reference,
          groupingTag: template.category || undefined,
          subTags: template.tags
        };
      } else {
        // Calculate projected value
        const amount = rulesEngine.calculateAmount(template, date);

        transactionInstance = {
          template_id: template.id,
          name: template.name,
          amount: amount,
          isActual: false,
          groupingTag: template.category || undefined,
          subTags: template.tags
        };
      }

      transactions.push(transactionInstance);
      balance += transactionInstance.amount;
    }

    // Create period snapshot
    return new PeriodSnapshot({
      scenario_id: scenario.id,
      date: date,
      starting_balance: startingBalance,
      transactions: transactions,
      ending_balance: balance
    });
  }

  /**
   * Generate period dates based on all transaction frequencies
   */
  generatePeriodDates(startDate: string, endDate: string): string[] {
    return DateUtils.generatePeriodDates(startDate, endDate, this.templates);
  }

  /**
   * Calculate multiple scenarios
   */
  calculateMultipleScenarios(
    scenarios: Scenario[],
    startDate: string,
    endDate: string,
    initialBalance: number = 0
  ): Map<string, PeriodSnapshot[]> {
    const results = new Map<string, PeriodSnapshot[]>();

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
   */
  addActual(actual: ActualTransaction): void {
    this.actuals.push(actual);
    const key = `${actual.date}:${actual.template_id}`;
    this.actualsIndex.set(key, actual);
  }

  /**
   * Remove an actual transaction
   */
  removeActual(date: string, templateId: string): void {
    const key = `${date}:${templateId}`;
    this.actualsIndex.delete(key);
    this.actuals = this.actuals.filter(
      a => !(a.date === date && a.template_id === templateId)
    );
  }

  /**
   * Get all actuals for a specific date
   */
  getActualsForDate(date: string): ActualTransaction[] {
    return this.actuals.filter(a => a.date === date);
  }

  /**
   * Get all actuals for a date range
   */
  getActualsForRange(startDate: string, endDate: string): ActualTransaction[] {
    return this.actuals.filter(a => {
      return DateUtils.isDateInRange(a.date, startDate, endDate);
    });
  }

  /**
   * Update templates
   */
  setTemplates(templates: TransactionTemplate[]): void {
    this.templates = templates;
  }

  /**
   * Get all templates
   */
  getTemplates(): TransactionTemplate[] {
    return this.templates;
  }

  /**
   * Get a specific template by id
   */
  getTemplate(templateId: string): TransactionTemplate | null {
    return this.templates.find(t => t.id === templateId) || null;
  }
}

/**
 * Comparison utilities for analyzing scenarios
 */
export class ScenarioComparison {
  /**
   * Compare ending balances across scenarios
   */
  static compareEndingBalances(
    scenarioResults: Map<string, PeriodSnapshot[]>
  ): Array<Record<string, string | number>> {
    const comparison: Array<Record<string, string | number>> = [];

    // Get all dates (assume all scenarios have same dates)
    const firstScenario = scenarioResults.values().next().value;
    if (!firstScenario) return comparison;

    const dates = firstScenario.map((s: PeriodSnapshot) => s.date);

    for (const date of dates) {
      const dataPoint: Record<string, string | number> = { date };

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
   */
  static findMaxDivergence(
    scenarioResults: Map<string, PeriodSnapshot[]>
  ): {
    date: string | null;
    difference: number;
    balances: Record<string, any> | null;
  } {
    const comparison = this.compareEndingBalances(scenarioResults);
    let maxDiff = 0;
    let maxDate: string | null = null;
    let maxBalances: Record<string, any> | null = null;

    for (const dataPoint of comparison) {
      const balances = Object.values(dataPoint).filter(v => typeof v === 'number') as number[];
      const min = Math.min(...balances);
      const max = Math.max(...balances);
      const diff = max - min;

      if (diff > maxDiff) {
        maxDiff = diff;
        maxDate = dataPoint.date as string;
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
   */
  static calculateSummaries(
    scenarioResults: Map<string, PeriodSnapshot[]>
  ): Map<string, {
    totalIncome: number;
    totalExpenses: number;
    netChange: number;
    actualIncome: number;
    actualExpenses: number;
    projectedIncome: number;
    projectedExpenses: number;
    startingBalance: number;
    endingBalance: number;
  }> {
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
          if (transaction.amount > 0) {
            // Income
            totalIncome += transaction.amount;
            if (transaction.isActual) {
              actualIncome += transaction.amount;
            } else {
              projectedIncome += transaction.amount;
            }
          } else {
            // Expense
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
