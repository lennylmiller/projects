# Quick Start Guide

## Installation

```bash
# Clone or navigate to the project
cd cashflow-analysis

# Install dependencies (optional, for dev tools)
npm install
```

## Running Tests

```bash
npm test
```

Expected output:
```
✓ Test 1: Basic calculator initialization
✓ Test 2: Period date generation
✓ Test 3: Single scenario calculation
✓ Test 4: Actual transaction override
✓ Test 5: Multiple scenarios calculation
✓ Test 6: Scenario comparison utilities
✓ Test 7: CONFIG formula evaluation
✓ Test 8: Transaction frequency patterns

=== All tests completed ===
```

## Using the Calculator

### Basic Example

```javascript
import { CashflowCalculator } from './src/core/calculator.js';
import {
  TransactionTemplate,
  Scenario,
  ActualTransaction
} from './src/core/data-model.js';

// 1. Define transaction templates
const templates = [
  new TransactionTemplate({
    id: 'payroll',
    name: 'Payroll',
    type: 'income',
    amount: 4159.99,
    frequency: 'bi-weekly',
    startDate: '2025-01-01'
  }),
  new TransactionTemplate({
    id: 'mortgage',
    name: 'Mortgage',
    type: 'expense',
    amount: 1500,
    frequency: 'monthly',
    startDate: '2025-01-01'
  })
];

// 2. Define a scenario
const scenario = new Scenario({
  id: 'baseline',
  name: 'Baseline',
  enabled_transactions: ['payroll', 'mortgage'],
  config: {}
});

// 3. Create calculator
const calculator = new CashflowCalculator(templates, []);

// 4. Calculate scenario
const snapshots = calculator.calculateScenario(
  scenario,
  '2025-01-01',
  '2025-03-31',
  2000 // initial balance
);

// 5. View results
console.log('Period Snapshots:');
snapshots.forEach(snapshot => {
  console.log(`${snapshot.date}: $${snapshot.ending_balance.toFixed(2)}`);
});
```

### Using Sample Data

```javascript
import { templates, scenarios, actuals, settings } from './sample-data.js';
import { CashflowCalculator, ScenarioComparison } from './src/core/calculator.js';

// Initialize calculator with sample data
const calculator = new CashflowCalculator(templates, actuals);

// Calculate all scenarios
const results = calculator.calculateMultipleScenarios(
  scenarios,
  settings.dateRange.startDate,
  settings.dateRange.endDate,
  settings.initialBalance
);

// Compare scenarios
const comparison = ScenarioComparison.compareEndingBalances(results);
console.log('Scenario Comparison:', comparison);

// Find max divergence
const divergence = ScenarioComparison.findMaxDivergence(results);
console.log('Max Divergence:', divergence);

// Get summaries
const summaries = ScenarioComparison.calculateSummaries(results);
summaries.forEach((summary, scenarioId) => {
  console.log(`\n${scenarioId}:`);
  console.log(`  Total Income: $${summary.totalIncome.toFixed(2)}`);
  console.log(`  Total Expenses: $${summary.totalExpenses.toFixed(2)}`);
  console.log(`  Net Change: $${summary.netChange.toFixed(2)}`);
  console.log(`  Ending Balance: $${summary.endingBalance.toFixed(2)}`);
});
```

## Common Use Cases

### 1. Adding Actual Transactions

```javascript
// As transactions occur, add them as actuals
calculator.addActual(new ActualTransaction({
  date: '2025-01-15',
  template_id: 'payroll',
  amount: 5000, // Different from template
  notes: 'Bonus included'
}));

// Recalculate scenarios
const updatedResults = calculator.calculateMultipleScenarios(
  scenarios,
  startDate,
  endDate,
  initialBalance
);
```

### 2. Creating a New Scenario

```javascript
const newScenario = new Scenario({
  id: 'aggressive_savings',
  name: 'Aggressive Savings',
  enabled_transactions: [
    'payroll',
    'mortgage'
    // Removed discretionary expenses
  ],
  config: {
    Mortgage_Paid_Month: '2025-02-01' // Earlier payoff
  },
  color: '#8B5CF6'
});

scenarios.push(newScenario);
```

### 3. Using Formulas

```javascript
const mortgageTemplate = new TransactionTemplate({
  id: 'mortgage',
  name: 'Mortgage',
  type: 'expense',
  amount: { formula: 'CONFIG.Monthly_Mortgage_Payment' },
  frequency: 'monthly',
  startDate: '2025-01-01',
  endsOn: { formula: 'CONFIG.Mortgage_Paid_Month' }
});

const scenario = new Scenario({
  id: 'test',
  name: 'Test',
  enabled_transactions: ['mortgage'],
  config: {
    Monthly_Mortgage_Payment: 1500,
    Mortgage_Paid_Month: '2025-03-01'
  }
});
```

### 4. One-Time Transactions

```javascript
const houseSale = new TransactionTemplate({
  id: 'house_sale',
  name: 'House Sale',
  type: 'income',
  amount: 300000,
  frequency: 'one-time',
  startDate: '2025-02-15',
  isRecurring: false
});
```

## Project Structure

```
cashflow-analysis/
├── src/
│   └── core/
│       ├── data-model.js        # Data structures
│       ├── calculator.js        # Calculation engine
│       ├── rules-engine.js      # Formula evaluation
│       └── __tests__/
│           └── calculator.test.js
├── docs/
│   ├── data-schema.md           # JSON schemas
│   └── calculation-algorithm.md # Algorithms
├── sample-data.js               # Example data
├── package.json
├── README.md
└── QUICK_START.md              # This file
```

## Key Concepts

### Transaction Templates
Reusable patterns for income and expenses. Define once, use in multiple scenarios.

### Scenarios
What-if configurations. Enable/disable transactions and set CONFIG values.

### Actual Transactions
Historical data that overrides projections. Lock in reality as time passes.

### Period Snapshots
Calculated results for each date. Shows starting balance, transactions, ending balance.

### CONFIG Variables
Parameterize scenarios. Reference in formulas for flexibility.

## Supported Frequencies

- **monthly**: 1st and 15th of each month
- **bi-weekly**: Every 14 days from start date
- **weekly**: Every 7 days from start date
- **quarterly**: Every 3 months from start date
- **one-time**: Single occurrence on start date

## Documentation

- **[README.md](README.md)** - Project overview
- **[data-schema.md](docs/data-schema.md)** - Complete JSON schemas
- **[calculation-algorithm.md](docs/calculation-algorithm.md)** - Detailed algorithms
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was built

## Next Steps

1. **Explore Sample Data**: Review `sample-data.js` for examples
2. **Run Tests**: `npm test` to see everything working
3. **Build Your Scenarios**: Create templates and scenarios for your situation
4. **Phase 2**: Build web UI (React app with charts)
5. **Phase 3**: Google Sheets integration

## Troubleshooting

### Tests Failing
```bash
# Make sure you're in the project directory
cd cashflow-analysis

# Run tests
npm test
```

### Import Errors
This project uses ES modules. Make sure:
- Node.js version 14+ (supports ES modules)
- `package.json` has `"type": "module"`
- Import statements use `.js` extension

### Date Issues
All dates use ISO format (YYYY-MM-DD). The system handles timezones automatically.

## Getting Help

1. Check documentation in `docs/` folder
2. Review sample data in `sample-data.js`
3. Look at test examples in `src/core/__tests__/calculator.test.js`
4. Read implementation details in `IMPLEMENTATION_SUMMARY.md`

## Development

### Adding New Frequency Types
Edit `src/core/rules-engine.js`:
- Add case in `shouldTransactionOccur()`
- Add generator in `src/core/data-model.js` DateUtils

### Extending Formula System
Edit `src/core/rules-engine.js`:
- Enhance `evaluateFormula()` for custom functions
- Add helpers in `FormulaHelpers` class

### Adding Transaction Dependencies
Edit `src/core/rules-engine.js`:
- Implement logic in `resolveDependencies()`
