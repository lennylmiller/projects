/**
 * Sample Data - Example transaction templates and scenarios
 *
 * This file demonstrates how to set up a complete cashflow analysis
 * matching the original Google Sheets structure.
 */

import {
  TransactionTemplate,
  Scenario,
  ActualTransaction
} from './src/core/data-model.js';

/**
 * Transaction Templates
 * Based on the original Google Sheets templates
 */
export const templates = [
  // Income - Primary Job
  new TransactionTemplate({
    id: 'payroll',
    name: 'Payroll',
    type: 'income',
    amount: 4159.99,
    frequency: 'bi-weekly',
    startDate: '2024-12-15',
    category: 'income'
  }),

  // Income - Second Job (Optional)
  new TransactionTemplate({
    id: 'plexis',
    name: 'Plexis (Second Job)',
    type: 'income',
    amount: 2200,
    frequency: 'bi-weekly',
    startDate: '2025-01-01',
    category: 'income'
  }),

  // Income - Disability
  new TransactionTemplate({
    id: 'disability',
    name: 'Disability Payment',
    type: 'income',
    amount: 356.88,
    frequency: 'monthly',
    startDate: '2025-01-01',
    category: 'income'
  }),

  // Housing - Mortgage
  new TransactionTemplate({
    id: 'mortgage',
    name: 'Mortgage Payment',
    type: 'expense',
    amount: { formula: 'CONFIG.Monthly_Mortgage_Payment' },
    frequency: 'monthly',
    startDate: '2024-12-01',
    endsOn: { formula: 'CONFIG.Mortgage_Paid_Month' },
    category: 'housing'
  }),

  // Housing - RV Park
  new TransactionTemplate({
    id: 'rv_park',
    name: 'RV Park Fee',
    type: 'expense',
    amount: 900,
    frequency: 'monthly',
    startDate: '2024-12-01',
    category: 'housing'
  }),

  // One-time - House Sale
  new TransactionTemplate({
    id: 'house_sale',
    name: 'House Sale Proceeds',
    type: 'income',
    amount: { formula: 'CONFIG.House_Sale_Amount' },
    frequency: 'one-time',
    startDate: '2025-02-15',
    isRecurring: false,
    category: 'windfall'
  }),

  // Utilities
  new TransactionTemplate({
    id: 'utilities',
    name: 'Utilities (Electric, Water, Internet)',
    type: 'expense',
    amount: 250,
    frequency: 'monthly',
    startDate: '2025-01-01',
    category: 'utilities'
  }),

  // Transportation
  new TransactionTemplate({
    id: 'gas',
    name: 'Gas',
    type: 'expense',
    amount: 200,
    frequency: 'bi-weekly',
    startDate: '2025-01-01',
    category: 'transportation'
  }),

  // Food
  new TransactionTemplate({
    id: 'groceries',
    name: 'Groceries',
    type: 'expense',
    amount: 400,
    frequency: 'bi-weekly',
    startDate: '2025-01-01',
    category: 'food'
  }),

  // Insurance
  new TransactionTemplate({
    id: 'insurance',
    name: 'Insurance (Auto, Health)',
    type: 'expense',
    amount: 450,
    frequency: 'monthly',
    startDate: '2025-01-01',
    category: 'insurance'
  })
];

/**
 * Scenarios
 * Different what-if configurations
 */
export const scenarios = [
  // Baseline: Current plan
  new Scenario({
    id: 'baseline',
    name: 'Baseline (Current Plan)',
    description: 'Current financial situation with primary income and existing expenses',
    enabled_transactions: [
      'payroll',
      'disability',
      'mortgage',
      'rv_park',
      'utilities',
      'gas',
      'groceries',
      'insurance'
    ],
    config: {
      Mortgage_Paid_Month: '2025-03-01',
      Monthly_Mortgage_Payment: 1500,
      House_Sale_Amount: 0
    },
    color: '#3B82F6' // Blue
  }),

  // With Second Job: Adding Plexis income
  new Scenario({
    id: 'with_second_job',
    name: 'With Second Job',
    description: 'Adding Plexis income allows earlier mortgage payoff',
    enabled_transactions: [
      'payroll',
      'plexis',  // Added
      'disability',
      'mortgage',
      'rv_park',
      'utilities',
      'gas',
      'groceries',
      'insurance'
    ],
    config: {
      Mortgage_Paid_Month: '2025-02-01',  // Earlier payoff
      Monthly_Mortgage_Payment: 1500,
      House_Sale_Amount: 0
    },
    color: '#10B981' // Green
  }),

  // House Sold: Major one-time income
  new Scenario({
    id: 'house_sold',
    name: 'House Sold February',
    description: 'Selling house eliminates mortgage and provides lump sum',
    enabled_transactions: [
      'payroll',
      'disability',
      'house_sale',  // Added
      // 'mortgage' removed - paid off with sale proceeds
      'rv_park',
      'utilities',
      'gas',
      'groceries',
      'insurance'
    ],
    config: {
      Mortgage_Paid_Month: '2025-02-15',  // Paid off at sale
      Monthly_Mortgage_Payment: 0,
      House_Sale_Amount: 300000
    },
    color: '#F59E0B' // Orange
  }),

  // Conservative: Reduced expenses
  new Scenario({
    id: 'conservative',
    name: 'Conservative (Reduced Spending)',
    description: 'Cutting discretionary spending to build emergency fund faster',
    enabled_transactions: [
      'payroll',
      'disability',
      'mortgage',
      'rv_park',
      'utilities',
      'insurance'
      // Removed: gas (minimize driving), groceries (reduced budget)
    ],
    config: {
      Mortgage_Paid_Month: '2025-03-01',
      Monthly_Mortgage_Payment: 1500,
      House_Sale_Amount: 0
    },
    color: '#8B5CF6' // Purple
  }),

  // Optimistic: Best case scenario
  new Scenario({
    id: 'optimistic',
    name: 'Optimistic (All Income)',
    description: 'Second job + house sale + current income',
    enabled_transactions: [
      'payroll',
      'plexis',
      'disability',
      'house_sale',
      // No mortgage after house sale
      'rv_park',
      'utilities',
      'gas',
      'groceries',
      'insurance'
    ],
    config: {
      Mortgage_Paid_Month: '2025-02-15',
      Monthly_Mortgage_Payment: 0,
      House_Sale_Amount: 300000
    },
    color: '#EC4899' // Pink
  })
];

/**
 * Sample Actual Transactions
 * Examples of locked-in historical data
 */
export const actuals = [
  // January actuals
  new ActualTransaction({
    date: '2025-01-01',
    template_id: 'payroll',
    amount: 4159.99,
    notes: 'First paycheck 2025'
  }),

  new ActualTransaction({
    date: '2025-01-01',
    template_id: 'rv_park',
    amount: -850,  // Got discount
    notes: 'Negotiated discount for early payment'
  }),

  new ActualTransaction({
    date: '2025-01-15',
    template_id: 'payroll',
    amount: 5000,  // Bonus!
    notes: 'Regular pay + year-end bonus'
  }),

  new ActualTransaction({
    date: '2025-01-15',
    template_id: 'mortgage',
    amount: -1500,
    notes: 'Regular mortgage payment'
  }),

  new ActualTransaction({
    date: '2025-01-15',
    template_id: 'disability',
    amount: 356.88,
    notes: 'Monthly disability payment'
  })
];

/**
 * Settings
 * Global configuration for the analysis
 */
export const settings = {
  dateRange: {
    startDate: '2024-12-15',
    endDate: '2025-12-31'
  },
  initialBalance: 2359.78,  // Starting balance from spreadsheet
  currency: 'USD',
  locale: 'en-US'
};

/**
 * Helper function to run analysis
 */
export function runAnalysis() {
  const { CashflowCalculator, ScenarioComparison } = await import('./src/core/calculator.js');

  const calculator = new CashflowCalculator(templates, actuals);

  // Calculate all scenarios
  const results = calculator.calculateMultipleScenarios(
    scenarios,
    settings.dateRange.startDate,
    settings.dateRange.endDate,
    settings.initialBalance
  );

  // Generate comparison data
  const comparison = ScenarioComparison.compareEndingBalances(results);
  const divergence = ScenarioComparison.findMaxDivergence(results);
  const summaries = ScenarioComparison.calculateSummaries(results);

  return {
    results,
    comparison,
    divergence,
    summaries
  };
}

// Export for use in tests or web app
export default {
  templates,
  scenarios,
  actuals,
  settings,
  runAnalysis
};
