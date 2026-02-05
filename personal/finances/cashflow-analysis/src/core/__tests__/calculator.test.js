/**
 * Calculator Tests
 * Test suite for the cashflow calculation engine
 */

import { CashflowCalculator, ScenarioComparison } from '../calculator.js';
import {
  TransactionTemplate,
  Scenario,
  ActualTransaction,
  DateUtils
} from '../data-model.js';

/**
 * Test data setup
 */
function createTestTemplates() {
  return [
    new TransactionTemplate({
      id: 'payroll',
      name: 'Payroll',
      type: 'income',
      amount: 4159.99,
      frequency: 'bi-weekly',
      startDate: '2025-01-01'
    }),
    new TransactionTemplate({
      id: 'plexis',
      name: 'Plexis (Second Job)',
      type: 'income',
      amount: 2200,
      frequency: 'bi-weekly',
      startDate: '2025-01-01'
    }),
    new TransactionTemplate({
      id: 'mortgage',
      name: 'Mortgage',
      type: 'expense',
      amount: { formula: 'CONFIG.Monthly_Mortgage_Payment' },
      frequency: 'monthly',
      startDate: '2025-01-01',
      endsOn: { formula: 'CONFIG.Mortgage_Paid_Month' }
    }),
    new TransactionTemplate({
      id: 'rv_park',
      name: 'RV Park',
      type: 'expense',
      amount: 900,
      frequency: 'monthly',
      startDate: '2025-01-01'
    }),
    new TransactionTemplate({
      id: 'disability',
      name: 'Disability',
      type: 'income',
      amount: 356.88,
      frequency: 'monthly',
      startDate: '2025-01-01'
    })
  ];
}

function createBaselineScenario() {
  return new Scenario({
    id: 'baseline',
    name: 'Baseline',
    enabled_transactions: ['payroll', 'mortgage', 'rv_park', 'disability'],
    config: {
      Mortgage_Paid_Month: '2025-03-01',
      Monthly_Mortgage_Payment: 1500
    },
    color: '#3B82F6'
  });
}

function createSecondJobScenario() {
  return new Scenario({
    id: 'with_second_job',
    name: 'With Second Job',
    enabled_transactions: ['payroll', 'plexis', 'mortgage', 'rv_park', 'disability'],
    config: {
      Mortgage_Paid_Month: '2025-02-01',
      Monthly_Mortgage_Payment: 1500
    },
    color: '#10B981'
  });
}

function createHouseSoldScenario() {
  return new Scenario({
    id: 'house_sold',
    name: 'House Sold Feb',
    enabled_transactions: ['payroll', 'rv_park', 'disability'],
    config: {
      Mortgage_Paid_Month: '2025-02-01',
      Monthly_Mortgage_Payment: 0
    },
    color: '#F59E0B'
  });
}

/**
 * Test Suite
 */

// Test: Basic calculator initialization
console.log('Test 1: Basic calculator initialization');
try {
  const templates = createTestTemplates();
  const calculator = new CashflowCalculator(templates, []);

  console.assert(calculator.templates.length === 5, 'Should have 5 templates');
  console.assert(calculator.actuals.length === 0, 'Should have 0 actuals');
  console.log('✓ Test 1 passed');
} catch (error) {
  console.error('✗ Test 1 failed:', error.message);
}

// Test: Period date generation
console.log('\nTest 2: Period date generation');
try {
  const templates = createTestTemplates();
  const calculator = new CashflowCalculator(templates, []);

  const dates = calculator.generatePeriodDates('2025-01-01', '2025-01-31');

  console.assert(dates.length > 0, 'Should generate dates');
  console.assert(dates.includes('2025-01-01'), 'Should include start date');
  console.assert(dates.includes('2025-01-15'), 'Should include 15th (monthly)');

  console.log(`Generated ${dates.length} period dates:`, dates.slice(0, 5));
  console.log('✓ Test 2 passed');
} catch (error) {
  console.error('✗ Test 2 failed:', error.message);
}

// Test: Single scenario calculation
console.log('\nTest 3: Single scenario calculation');
try {
  const templates = createTestTemplates();
  const calculator = new CashflowCalculator(templates, []);
  const scenario = createBaselineScenario();

  const snapshots = calculator.calculateScenario(
    scenario,
    '2025-01-01',
    '2025-01-31',
    2359.78 // Initial balance from spreadsheet
  );

  console.assert(snapshots.length > 0, 'Should generate snapshots');
  console.assert(snapshots[0].scenario_id === 'baseline', 'Should have correct scenario_id');
  console.assert(snapshots[0].starting_balance === 2359.78, 'Should have correct starting balance');

  // Check that balance changes
  const lastSnapshot = snapshots[snapshots.length - 1];
  console.assert(
    lastSnapshot.ending_balance !== snapshots[0].starting_balance,
    'Balance should change'
  );

  console.log(`Calculated ${snapshots.length} period snapshots`);
  console.log('First period:', {
    date: snapshots[0].date,
    starting: snapshots[0].starting_balance,
    ending: snapshots[0].ending_balance,
    transactions: snapshots[0].transactions.length
  });
  console.log('✓ Test 3 passed');
} catch (error) {
  console.error('✗ Test 3 failed:', error.message);
}

// Test: Actual transaction override
console.log('\nTest 4: Actual transaction override');
try {
  const templates = createTestTemplates();
  const actual = new ActualTransaction({
    date: '2025-01-15',
    template_id: 'payroll',
    amount: 5000, // Different from template amount
    notes: 'Bonus included'
  });

  const calculator = new CashflowCalculator(templates, [actual]);
  const scenario = createBaselineScenario();

  const snapshots = calculator.calculateScenario(
    scenario,
    '2025-01-01',
    '2025-01-31',
    2359.78
  );

  // Find the snapshot for Jan 15
  const jan15Snapshot = snapshots.find(s => s.date === '2025-01-15');
  console.assert(jan15Snapshot !== undefined, 'Should have Jan 15 snapshot');

  // Find the payroll transaction
  const payrollTransaction = jan15Snapshot.transactions.find(t => t.template_id === 'payroll');
  console.assert(payrollTransaction !== undefined, 'Should have payroll transaction');
  console.assert(payrollTransaction.isActual === true, 'Should be marked as actual');
  console.assert(payrollTransaction.amount === 5000, 'Should use actual amount');

  console.log('Payroll transaction:', {
    date: jan15Snapshot.date,
    amount: payrollTransaction.amount,
    isActual: payrollTransaction.isActual,
    notes: payrollTransaction.notes
  });
  console.log('✓ Test 4 passed');
} catch (error) {
  console.error('✗ Test 4 failed:', error.message);
}

// Test: Multiple scenarios calculation
console.log('\nTest 5: Multiple scenarios calculation');
try {
  const templates = createTestTemplates();
  const calculator = new CashflowCalculator(templates, []);

  const scenarios = [
    createBaselineScenario(),
    createSecondJobScenario(),
    createHouseSoldScenario()
  ];

  const results = calculator.calculateMultipleScenarios(
    scenarios,
    '2025-01-01',
    '2025-02-28',
    2359.78
  );

  console.assert(results.size === 3, 'Should have 3 scenario results');
  console.assert(results.has('baseline'), 'Should have baseline scenario');
  console.assert(results.has('with_second_job'), 'Should have second job scenario');
  console.assert(results.has('house_sold'), 'Should have house sold scenario');

  // Compare ending balances
  const baselineSnapshots = results.get('baseline');
  const secondJobSnapshots = results.get('with_second_job');

  const baselineEnding = baselineSnapshots[baselineSnapshots.length - 1].ending_balance;
  const secondJobEnding = secondJobSnapshots[secondJobSnapshots.length - 1].ending_balance;

  console.log('Ending balances:');
  console.log('  Baseline:', baselineEnding.toFixed(2));
  console.log('  With Second Job:', secondJobEnding.toFixed(2));
  console.log('  Difference:', (secondJobEnding - baselineEnding).toFixed(2));

  // Second job scenario should have higher balance
  console.assert(
    secondJobEnding > baselineEnding,
    'Second job scenario should have higher ending balance'
  );

  console.log('✓ Test 5 passed');
} catch (error) {
  console.error('✗ Test 5 failed:', error.message);
}

// Test: Scenario comparison utilities
console.log('\nTest 6: Scenario comparison utilities');
try {
  const templates = createTestTemplates();
  const calculator = new CashflowCalculator(templates, []);

  const scenarios = [
    createBaselineScenario(),
    createSecondJobScenario()
  ];

  const results = calculator.calculateMultipleScenarios(
    scenarios,
    '2025-01-01',
    '2025-02-28',
    2359.78
  );

  // Test comparison data
  const comparison = ScenarioComparison.compareEndingBalances(results);
  console.assert(comparison.length > 0, 'Should have comparison data');
  console.assert(comparison[0].hasOwnProperty('date'), 'Should have date field');
  console.assert(comparison[0].hasOwnProperty('baseline'), 'Should have baseline data');

  // Test max divergence
  const divergence = ScenarioComparison.findMaxDivergence(results);
  console.assert(divergence.date !== null, 'Should find max divergence date');
  console.assert(divergence.difference > 0, 'Should have positive difference');

  console.log('Max divergence:', {
    date: divergence.date,
    difference: divergence.difference.toFixed(2)
  });

  // Test summaries
  const summaries = ScenarioComparison.calculateSummaries(results);
  console.assert(summaries.size === 2, 'Should have 2 summaries');

  const baselineSummary = summaries.get('baseline');
  console.log('Baseline summary:', {
    totalIncome: baselineSummary.totalIncome.toFixed(2),
    totalExpenses: baselineSummary.totalExpenses.toFixed(2),
    netChange: baselineSummary.netChange.toFixed(2)
  });

  console.log('✓ Test 6 passed');
} catch (error) {
  console.error('✗ Test 6 failed:', error.message);
}

// Test: CONFIG formula evaluation
console.log('\nTest 7: CONFIG formula evaluation');
try {
  const templates = [
    new TransactionTemplate({
      id: 'mortgage',
      name: 'Mortgage',
      type: 'expense',
      amount: { formula: 'CONFIG.Monthly_Mortgage_Payment' },
      frequency: 'monthly',
      startDate: '2025-01-01',
      endsOn: { formula: 'CONFIG.Mortgage_Paid_Month' }
    })
  ];

  const scenario = new Scenario({
    id: 'test',
    name: 'Test',
    enabled_transactions: ['mortgage'],
    config: {
      Monthly_Mortgage_Payment: 1500,
      Mortgage_Paid_Month: '2025-03-01'
    }
  });

  const calculator = new CashflowCalculator(templates, []);
  const snapshots = calculator.calculateScenario(
    scenario,
    '2025-01-01',
    '2025-03-15',
    0
  );

  console.log('Snapshots:', snapshots.map(s => ({ date: s.date, txs: s.transactions.map(t => t.name) })));

  // Find any snapshot with a mortgage (since Jan 1 might not be included)
  const snapshotWithMortgage = snapshots.find(s =>
    s.transactions.some(t => t.template_id === 'mortgage')
  );
  console.assert(snapshotWithMortgage !== undefined, 'Should have at least one mortgage transaction');

  const mortgageTransaction = snapshotWithMortgage.transactions.find(t => t.template_id === 'mortgage');
  console.assert(mortgageTransaction.amount === -1500, 'Should use CONFIG value');

  // Check that mortgage ends after March 1
  const mar15Snapshot = snapshots.find(s => s.date === '2025-03-15');
  const mortgageAfterEnd = mar15Snapshot?.transactions.find(t => t.template_id === 'mortgage');

  console.assert(mortgageAfterEnd === undefined, 'Mortgage should end after March 1');

  console.log('Mortgage transaction:', {
    date: snapshotWithMortgage.date,
    amount: mortgageTransaction.amount,
    endsOn: '2025-03-01'
  });
  console.log('✓ Test 7 passed');
} catch (error) {
  console.error('✗ Test 7 failed:', error.message);
}

// Test: Transaction frequency patterns
console.log('\nTest 8: Transaction frequency patterns');
try {
  const templates = [
    new TransactionTemplate({
      id: 'weekly',
      name: 'Weekly Expense',
      type: 'expense',
      amount: 100,
      frequency: 'weekly',
      startDate: '2025-01-01'
    }),
    new TransactionTemplate({
      id: 'quarterly',
      name: 'Quarterly Income',
      type: 'income',
      amount: 1000,
      frequency: 'quarterly',
      startDate: '2025-01-01'
    }),
    new TransactionTemplate({
      id: 'one_time',
      name: 'One-time Bonus',
      type: 'income',
      amount: 5000,
      frequency: 'one-time',
      startDate: '2025-01-15'
    })
  ];

  const scenario = new Scenario({
    id: 'test',
    name: 'Test',
    enabled_transactions: ['weekly', 'quarterly', 'one_time'],
    config: {}
  });

  const calculator = new CashflowCalculator(templates, []);
  const snapshots = calculator.calculateScenario(
    scenario,
    '2025-01-01',
    '2025-04-30',
    0
  );

  // Count weekly occurrences
  let weeklyCount = 0;
  snapshots.forEach(snapshot => {
    if (snapshot.transactions.some(t => t.template_id === 'weekly')) {
      weeklyCount++;
    }
  });

  console.log(`Weekly transactions: ${weeklyCount}`);

  // Check quarterly
  const quarterlySnapshots = snapshots.filter(s =>
    s.transactions.some(t => t.template_id === 'quarterly')
  );
  console.log(`Quarterly transactions: ${quarterlySnapshots.length}`);
  console.log('Quarterly dates:', quarterlySnapshots.map(s => s.date));

  // Check one-time
  const oneTimeSnapshots = snapshots.filter(s =>
    s.transactions.some(t => t.template_id === 'one_time')
  );
  console.assert(oneTimeSnapshots.length === 1, 'One-time should occur once');
  console.assert(oneTimeSnapshots[0].date === '2025-01-15', 'One-time should occur on correct date');

  console.log('✓ Test 8 passed');
} catch (error) {
  console.error('✗ Test 8 failed:', error.message);
}

console.log('\n=== All tests completed ===');

export default {
  createTestTemplates,
  createBaselineScenario,
  createSecondJobScenario,
  createHouseSoldScenario
};
