# Documentation Index

This directory contains comprehensive documentation for the cashflow analysis project, with a focus on mapping the existing Google Sheets implementation to the new data model.

## Documentation Overview

### Main Mapping Documentation

1. **[google-sheets-mapping.md](./google-sheets-mapping.md)** - **START HERE**
   - Visual guide showing how Google Sheets maps to the new data model
   - Annotated examples with side-by-side comparisons
   - Explains the two meanings of "x" markers (templates vs actuals)
   - Complete walkthrough of all major components

2. **[field-mapping-table.md](./field-mapping-table.md)**
   - Comprehensive field-by-field reference table
   - Exact cell locations in Google Sheets
   - Corresponding data model paths
   - Validation rules and common pitfalls

3. **[extract-from-sheets.md](./extract-from-sheets.md)**
   - Step-by-step code examples for data extraction
   - Complete migration script with Google Sheets API
   - Validation functions to ensure data integrity
   - Troubleshooting guide for common issues

4. **[architecture-comparison.md](./architecture-comparison.md)**
   - High-level comparison of old vs new architecture
   - Visual diagrams showing data flow
   - Scenario comparison examples
   - Benefits and trade-offs analysis

## Quick Navigation

### By Task

| What do you want to do? | Read this document |
|-------------------------|-------------------|
| Understand the overall mapping | [google-sheets-mapping.md](./google-sheets-mapping.md) |
| Look up a specific field | [field-mapping-table.md](./field-mapping-table.md) |
| Extract data from Google Sheets | [extract-from-sheets.md](./extract-from-sheets.md) |
| Understand architectural differences | [architecture-comparison.md](./architecture-comparison.md) |

### By Role

| Your Role | Start Here |
|-----------|-----------|
| **Developer** implementing the new system | [google-sheets-mapping.md](./google-sheets-mapping.md) → [field-mapping-table.md](./field-mapping-table.md) |
| **Data Engineer** migrating the data | [extract-from-sheets.md](./extract-from-sheets.md) → [field-mapping-table.md](./field-mapping-table.md) |
| **Architect** evaluating the approach | [architecture-comparison.md](./architecture-comparison.md) → [google-sheets-mapping.md](./google-sheets-mapping.md) |
| **User** wanting to understand changes | [architecture-comparison.md](./architecture-comparison.md) |

## Key Concepts

### The "x" Marker Has Two Meanings

This is critical to understand:

1. **In the template section (rows 22+):**
   - `x` = template is ENABLED in this scenario
   - No `x` = template is DISABLED

2. **In the transaction section (rows 3-9):**
   - `x` = ACTUAL transaction (manually entered)
   - No `x` = PROJECTED transaction (formula-calculated)

See [google-sheets-mapping.md#actual-vs-projected-transactions](./google-sheets-mapping.md#actual-vs-projected-transactions) for details.

### One CONFIG → Many Scenarios

**Old System (Google Sheets):**
- One CONFIG tab affects all calculations
- To compare scenarios: change CONFIG, note results, change back

**New System:**
- Define multiple scenarios upfront
- Each scenario has its own config
- Calculator processes all scenarios simultaneously
- Compare results on multi-line chart

See [architecture-comparison.md#configuration-management](./architecture-comparison.md#configuration-management) for details.

### Templates Defined Once, Referenced Many Times

**Old System (Google Sheets):**
- Templates repeated in every period tab (rows 22+)
- Changing a template requires updating all tabs

**New System:**
- Templates defined once in master list
- Scenarios reference templates by ID
- Enable/disable per scenario using `enabled_transactions` array

See [google-sheets-mapping.md#transaction-templates-mapping](./google-sheets-mapping.md#transaction-templates-mapping) for details.

## Data Model Quick Reference

### Core Types

```typescript
// Templates: Master list of all possible transactions
TransactionTemplate {
  id: string;                // e.g., "mortgage"
  name: string;              // e.g., "Mortgage"
  type: 'income' | 'expense';
  amount: number | {formula: string};
  frequency: 'monthly' | 'bi-weekly' | ...;
}

// Scenarios: Different "what-if" configurations
Scenario {
  id: string;                // e.g., "baseline"
  name: string;              // e.g., "Baseline Scenario"
  config: {                  // CONFIG tab values
    [key: string]: any;
  };
  enabled_transactions: string[]; // Template IDs (the "x" markers)
}

// Actuals: Historical transactions that actually occurred
ActualTransaction {
  id: string;
  date: string;              // ISO format
  template_id: string;       // Which template
  amount: number;            // What was actually paid/received
}

// Snapshots: Calculated state at each period
PeriodSnapshot {
  scenario_id: string;       // Which scenario
  date: string;              // Period date
  starting_balance: number;  // From previous period
  transactions: TransactionInstance[];
  ending_balance: number;    // Calculated
}
```

## Directory Structure

```
docs/
├── README.md                        # This file
├── google-sheets-mapping.md         # Main mapping guide
├── field-mapping-table.md           # Field reference table
├── extract-from-sheets.md           # Migration code
├── architecture-comparison.md       # Architecture overview
└── images/                          # Screenshots and diagrams
    ├── config-tab-annotated.png     # (future)
    ├── period-tab-annotated.png     # (future)
    └── templates-annotated.png      # (future)
```

## Migration Workflow

### Recommended Steps

1. **Read the mapping documentation**
   - [google-sheets-mapping.md](./google-sheets-mapping.md)
   - Understand how each element maps

2. **Set up Google Sheets API access**
   - Follow [extract-from-sheets.md#setup-google-sheets-api-access](./extract-from-sheets.md#setup-google-sheets-api-access)

3. **Extract your data**
   - Run the migration script from [extract-from-sheets.md](./extract-from-sheets.md)
   - Review extracted data in `data/migrated/`

4. **Validate the extraction**
   - Use validation functions to check data integrity
   - Compare results with Google Sheets

5. **Create additional scenarios**
   - Copy `scenarios.json`
   - Modify config values to create "what-if" scenarios

6. **Run the calculator**
   - Process all scenarios
   - Compare results on multi-scenario chart

7. **Verify accuracy**
   - Baseline scenario should match Google Sheets
   - Additional scenarios show alternative futures

## Common Questions

### Q: Why separate actuals from projections?

**A:** In Google Sheets, both are mixed in the same rows (distinguished by "x" marker). Separating them:
- Makes historical data easier to query
- Prevents accidental overwriting of actuals
- Allows projections to be regenerated without losing history

See [architecture-comparison.md#actual-vs-projected-transactions](./architecture-comparison.md#actual-vs-projected-transactions)

### Q: How do I add a new transaction type?

**Old way (Google Sheets):**
1. Add row to templates section in EVERY period tab
2. Update formulas to include new transaction

**New way:**
1. Add one entry to `transaction_templates.json`
2. Add template ID to scenario's `enabled_transactions` array

See [google-sheets-mapping.md#transaction-templates-mapping](./google-sheets-mapping.md#transaction-templates-mapping)

### Q: How do I compare two different mortgage payoff dates?

**Old way (Google Sheets):**
1. Note current ending balance
2. Change `CONFIG!B1` to new date
3. Wait for recalculation
4. Note new ending balance
5. Manually compare
6. Change back (or lose original scenario)

**New way:**
1. Define scenario A: `Mortgage_Paid_Month: "Mar-1"`
2. Define scenario B: `Mortgage_Paid_Month: "Jan-1"`
3. Run calculator (processes both)
4. View both lines on chart (immediate comparison)

See [architecture-comparison.md#scenario-comparison-example](./architecture-comparison.md#scenario-comparison-example)

### Q: Can I still use Google Sheets?

**A:** Yes! The new system can:
- Import data from Google Sheets (one-time or periodic)
- Export results back to Google Sheets (for viewing)
- Run alongside Google Sheets (gradual migration)

The goal is not to replace Google Sheets entirely, but to provide:
- Better scenario comparison
- Automated calculations
- Version control
- Programmatic access

## Validation Checklist

When migrating data, ensure:

- [ ] All CONFIG values extracted correctly
- [ ] Template IDs are consistent (lowercase with underscores)
- [ ] All "x" marked templates appear in `enabled_transactions`
- [ ] Starting balance of period N = ending balance of period N-1
- [ ] All actual transactions have `isActual: true`
- [ ] All projected transactions have `isActual: false`
- [ ] Expense amounts are negative, income amounts are positive
- [ ] Dates are in ISO format (YYYY-MM-DD)
- [ ] Transactions sum to correct ending balance

See [extract-from-sheets.md#validation](./extract-from-sheets.md#validation) for automated validation functions.

## Need Help?

### Troubleshooting

See [extract-from-sheets.md#troubleshooting](./extract-from-sheets.md#troubleshooting) for common issues and solutions.

### Finding Specific Information

Use the search functionality in your editor:

- **Search for a field name** (e.g., "Mortgage_Paid_Month") to find all references
- **Search for "Example"** to find code examples
- **Search for your specific tab name** (e.g., "Start Dec-15") to see how it's handled

### Additional Documentation

See the main project README for:
- Project overview
- Installation instructions
- API documentation
- Development guidelines

## Contributing to Documentation

When adding new documentation:

1. **Update this index** with links to new files
2. **Cross-reference** related sections
3. **Include examples** showing both old and new approaches
4. **Use consistent formatting** (see existing docs)
5. **Add validation rules** when describing data structures

---

## Document Versions

| Document | Last Updated | Version |
|----------|-------------|---------|
| google-sheets-mapping.md | 2026-02-04 | 1.0 |
| field-mapping-table.md | 2026-02-04 | 1.0 |
| extract-from-sheets.md | 2026-02-04 | 1.0 |
| architecture-comparison.md | 2026-02-04 | 1.0 |

---

**Next Steps:** Start with [google-sheets-mapping.md](./google-sheets-mapping.md) to understand the complete mapping from Google Sheets to the new data model.
