# Cashflow Analysis Engine

A multi-scenario cashflow planning system with dual renderers (Web SPA + Google Sheets integration).

## Overview

This system enables **parallel what-if scenario analysis** for financial planning. Unlike traditional spreadsheets that show only one scenario at a time, this engine calculates multiple scenarios simultaneously and visualizes them side-by-side.

### Key Features

- **Multi-Scenario Planning**: Define unlimited scenarios (Baseline, With Second Job, House Sold Early, etc.)
- **Actual vs Projected**: Lock in actual transactions as time passes, while maintaining projections for future dates
- **Flexible Transaction Templates**: Define recurring income and expenses with formulas and conditional logic
- **CONFIG Variables**: Parameterize scenarios with reusable configuration values
- **Dual Output**: Same calculation engine powers both web UI and Google Sheets
- **Visual Comparison**: Stacked multi-line charts show all scenarios simultaneously

## Project Status

**Phase 1: COMPLETE** ✅
- Core data model (transaction templates, scenarios, actuals, period snapshots)
- Calculation engine with formula evaluation
- Rules engine with conditional logic
- Comprehensive test suite (all tests passing)
- Documentation (data schema, calculation algorithms)

**Phase 2: TODO** 🚧
- Web SPA with React
- Multi-scenario chart visualization
- Scenario CRUD interface
- Actual transaction entry UI

**Phase 3: TODO** 📋
- Google Sheets integration via Apps Script
- Automated scenario generation
- CSV import for bank transactions

## Quick Start

### Running Tests

```bash
npm test
```

### Project Structure

```
/src
  /core
    data-model.js        # JSON schemas and data classes
    calculator.js        # Main calculation engine
    rules-engine.js      # Formula evaluation and conditional logic
    /__tests__
      calculator.test.js # Comprehensive test suite

/docs
  data-schema.md         # Complete data model documentation
  calculation-algorithm.md  # Pseudocode and algorithms
```

## Core Concepts

### 1. Transaction Templates

Define reusable income/expense patterns:

```javascript
{
  id: "payroll",
  name: "Payroll",
  type: "income",
  amount: 4159.99,
  frequency: "bi-weekly",
  startDate: "2025-01-01"
}
```

Supports:
- Fixed amounts or formulas (referencing CONFIG)
- Frequencies: monthly, bi-weekly, weekly, quarterly, one-time
- Start/end dates (including formula-based end dates)
- Categories for reporting

### 2. Scenarios

What-if configurations with enabled transactions and CONFIG values:

```javascript
{
  id: "with_second_job",
  name: "With Second Job",
  enabled_transactions: ["payroll", "plexis", "mortgage"],
  config: {
    Mortgage_Paid_Month: "2025-02-01",
    Monthly_Mortgage_Payment: 1500
  },
  color: "#10B981"
}
```

Each scenario independently:
- Enables/disables specific transactions
- Sets CONFIG variables for formulas
- Produces its own set of period snapshots

### 3. Actual Transactions

Lock in historical data as it occurs:

```javascript
{
  date: "2025-01-15",
  template_id: "payroll",
  amount: 5000,  // Different from template
  isActual: true,
  notes: "Bonus included"
}
```

**Override Logic**: If actual exists for (date, template_id), use actual amount; otherwise calculate projected amount.

### 4. Period Snapshots

Calculated results for each date:

```javascript
{
  scenario_id: "baseline",
  date: "2025-01-15",
  starting_balance: 2359.78,
  transactions: [
    { template_id: "payroll", amount: 4159.99, isActual: true },
    { template_id: "mortgage", amount: -1500, isActual: false }
  ],
  ending_balance: 5019.77
}
```

## Calculation Flow

```
Input: Templates + Scenario + Actuals + Date Range + Initial Balance
  ↓
1. Generate period dates (union of all transaction frequencies)
  ↓
2. For each period date:
   a. Filter templates (enabled in scenario + active on date)
   b. Check for actual override
   c. Calculate amount (evaluate formulas with CONFIG)
   d. Update running balance
  ↓
Output: Array of Period Snapshots
```

## Formula System

### CONFIG References

```javascript
// Template with formula
{
  amount: { formula: "CONFIG.Monthly_Mortgage_Payment" }
}

// Scenario CONFIG
{
  config: {
    Monthly_Mortgage_Payment: 1500
  }
}

// Evaluated to: 1500
```

### Conditional Formulas

```javascript
{
  amount: {
    formula: "date < CONFIG.Mortgage_Paid_Month ? 1500 : 0"
  }
}
```

### Date-Based End Conditions

```javascript
{
  endsOn: { formula: "CONFIG.Mortgage_Paid_Month" }
}
```

## Testing

The test suite includes:

1. **Basic Initialization**: Template and calculator setup
2. **Period Date Generation**: Verify all frequencies work correctly
3. **Single Scenario Calculation**: End-to-end scenario processing
4. **Actual Override**: Verify actuals replace projections
5. **Multiple Scenarios**: Parallel scenario calculation
6. **Scenario Comparison**: Divergence analysis and summaries
7. **CONFIG Formula Evaluation**: Formula parsing and execution
8. **Transaction Frequencies**: Weekly, quarterly, one-time patterns

Run tests:
```bash
npm test
```

All tests passing ✅

## Data Model Details

### Supported Frequencies

- **monthly**: Occurs on 1st and 15th of each month
- **bi-weekly**: Every 14 days from start date
- **weekly**: Every 7 days from start date
- **quarterly**: Every 3 months from start date
- **one-time**: Single occurrence on start date
- **custom**: (extensible for future patterns)

### Transaction Types

- **income**: Positive amounts (added to balance)
- **expense**: Negative amounts (subtracted from balance)

### Date Handling

All dates use ISO 8601 format (YYYY-MM-DD). The system automatically handles timezone issues by parsing dates at noon UTC to avoid boundary problems.

## Documentation

- **[Data Schema](docs/data-schema.md)**: Complete JSON schemas with validation rules
- **[Calculation Algorithm](docs/calculation-algorithm.md)**: Detailed pseudocode and flow diagrams

## Example Use Cases

### Scenario 1: Baseline
- Current income and expenses
- Mortgage payment until March 2025
- Shows projected path with no changes

### Scenario 2: With Second Job
- Adds additional income stream (Plexis)
- Mortgage paid off earlier (February instead of March)
- Shows financial improvement from extra income

### Scenario 3: House Sold
- One-time income from house sale
- Mortgage ends immediately
- Removes housing expense
- Shows cash position after major transaction

### Comparison View

All three scenarios plotted on same chart:
- X-axis: Time (Jan-1, Jan-15, Feb-1, ...)
- Y-axis: Account balance
- Three colored lines showing each scenario's trajectory
- Clear visualization of which path performs best

## Architecture Principles

1. **Data-First**: Core data model drives everything
2. **Pure Calculation Engine**: No UI dependencies in core
3. **Actual Override**: Historical data always takes precedence
4. **Scenario Isolation**: Each scenario calculates independently
5. **Formula Flexibility**: CONFIG system allows parameterization
6. **Testable**: Comprehensive test coverage of core logic

## Performance

- **Time Complexity**: O(S × P × T) where:
  - S = scenarios
  - P = periods
  - T = transactions per period
- **Example**: 3 scenarios × 26 periods × 5 transactions = 390 calculations
- **Optimization**: Actuals indexed by (date, template_id) for O(1) lookup

## Next Steps

### Phase 2: Web SPA

1. Set up React + Vite project
2. Create components:
   - ScenarioManager (CRUD scenarios)
   - MultiScenarioChart (Chart.js visualization)
   - ActualEntry (form for entering actuals)
   - TemplateEditor (manage transaction templates)
3. Hook up calculation engine
4. Add data persistence (localStorage or cloud)

### Phase 3: Google Sheets Integration

1. Port calculation engine to Google Apps Script
2. Create "Scenarios" tab for defining scenarios
3. Generate period tabs per scenario
4. Update Diagram tab with multi-series chart
5. Custom menu for recalculation

## Contributing

This is a personal finance tool. Feel free to adapt for your own use.

## License

MIT

## Author

Cashflow Analysis Engine - Built with Claude Code
