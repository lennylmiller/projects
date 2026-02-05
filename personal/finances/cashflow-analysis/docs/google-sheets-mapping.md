# Google Sheets to Data Model Mapping

This document shows how the existing Google Sheets cashflow tracker maps to the new data model architecture.

## Table of Contents

1. [Overview](#overview)
2. [CONFIG Tab Mapping](#config-tab-mapping)
3. [Transaction Templates Mapping](#transaction-templates-mapping)
4. [Period Tab Structure](#period-tab-structure)
5. [Actual vs Projected Transactions](#actual-vs-projected-transactions)
6. [Multi-Period View](#multi-period-view)
7. [Diagram Chart Evolution](#diagram-chart-evolution)

---

## Overview

The Google Sheets implementation uses a single workbook with multiple tabs to track cash flow over time. The new system separates concerns into distinct data models that support multiple scenarios and easier comparison.

### Key Architectural Changes

| Aspect | Google Sheets | New System |
|--------|---------------|------------|
| Scenarios | One at a time | Multiple in parallel |
| Comparison | Manual (change & re-calculate) | Automatic (all calculated together) |
| Templates | Per-period enable/disable | Defined once, referenced by scenarios |
| Actuals | "x" marker in same rows | Separate ActualTransaction objects |
| Visualization | Single line chart | Multi-scenario overlay |

---

## CONFIG Tab Mapping

### Google Sheets: CONFIG Tab

The CONFIG tab stores configuration values as key-value pairs:

```
A                           B
Mortgage_Paid_Month         Mar-1
Monthly_Mortgage_Payment    1500
```

**Location:** CONFIG tab, columns A-B

### New Model: Scenario.config

Maps to the `config` field within each Scenario:

```typescript
interface Scenario {
  id: string;
  name: string;
  config: {
    Mortgage_Paid_Month: string;      // "2025-03-01" (ISO format)
    Monthly_Mortgage_Payment: number; // 1500
    [key: string]: any;                // Additional config values
  };
  enabled_transactions: string[];
}
```

**Example:**

```json
{
  "id": "baseline",
  "name": "Baseline Scenario",
  "config": {
    "Mortgage_Paid_Month": "2025-03-01",
    "Monthly_Mortgage_Payment": 1500
  },
  "enabled_transactions": ["plexis", "mortgage", "rv_park"]
}
```

### Key Differences

- **Old:** One CONFIG affects all calculations
- **New:** Each scenario has its own config values
- **Benefit:** Compare different mortgage payoff dates side-by-side without changing values

---

## Transaction Templates Mapping

### Google Sheets: Template Section (Rows 22+)

At the bottom of each period tab, templates are listed:

```
A    B          C
     x X
x    Plexis
x    Mortgage
x    RV Park    900
     Insurance  100
```

- **"x" in column A:** Template is ENABLED
- **No "x":** Template is DISABLED
- **Column B:** Template name
- **Column C:** Amount (if fixed)

**Location:** Each period tab, rows 22 and below

### New Model: TransactionTemplate

Templates are defined once and referenced by scenarios:

```typescript
interface TransactionTemplate {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: 'income' | 'expense';    // Transaction type
  amount: number | {             // Fixed amount or formula
    formula: string;
    context?: Record<string, any>;
  };
  frequency: 'once' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;            // When template becomes active
  endDate?: string;              // When template ends
  recurrenceRules?: {
    dayOfMonth?: number;
    weekOfMonth?: number;
    dayOfWeek?: number;
  };
}
```

**Example:**

```json
[
  {
    "id": "plexis",
    "name": "Plexis",
    "type": "income",
    "amount": 2200,
    "frequency": "bi-weekly"
  },
  {
    "id": "mortgage",
    "name": "Mortgage",
    "type": "expense",
    "amount": {
      "formula": "CONFIG.Monthly_Mortgage_Payment"
    },
    "frequency": "monthly",
    "recurrenceRules": {
      "dayOfMonth": 1
    }
  },
  {
    "id": "rv_park",
    "name": "RV Park",
    "type": "expense",
    "amount": 900,
    "frequency": "monthly"
  }
]
```

### Scenario's enabled_transactions

The "x" markers in Google Sheets map to the `enabled_transactions` array:

```json
{
  "id": "baseline",
  "enabled_transactions": ["plexis", "mortgage", "rv_park"]
  // "insurance" is NOT included (no "x" marker)
}
```

### Key Differences

- **Old:** Enable/disable per period (templates repeated in each tab)
- **New:** Enable/disable per scenario (templates defined once)
- **Benefit:** Change which transactions are active without editing multiple tabs

---

## Period Tab Structure

### Google Sheets: Period Tab Layout

Each period tab (e.g., "Start Dec-15") has this structure:

```
Row 1:  Starter Balance                     $3,073.86

Rows 3-9: TRANSACTIONS
A    B              C          D           F
x    RV Park        635.10     $2,438.76   https://amazon.com/...
x    Groceries      200.00     $2,238.76
     Mortgage       1500.00    $738.76
x    Fuel           80.00      $658.76

Row 11: Special entries (e.g., "Liquidated")

Row 16: Ending Balance                      $2,359.78

Rows 22+: TEMPLATES (see previous section)
```

**Key Elements:**
- **Row 1, Column D:** Starting balance for this period
- **Rows 3-9:** Actual and projected transactions
  - Column A: "x" = actual transaction (manually entered)
  - Column B: Transaction name
  - Column C: Amount
  - Column D: Running balance after this transaction
  - Column F: Optional reference links
- **Row 16, Column D:** Ending balance (becomes next period's starting balance)

### New Model: PeriodSnapshot

Each period tab maps to a `PeriodSnapshot` object:

```typescript
interface PeriodSnapshot {
  scenario_id: string;              // Which scenario this belongs to
  date: string;                     // ISO date (e.g., "2024-12-15")
  starting_balance: number;         // From previous period's ending_balance
  transactions: TransactionInstance[];
  ending_balance: number;           // Calculated from starting + transactions
}

interface TransactionInstance {
  template_id: string;              // Reference to TransactionTemplate
  amount: number;                   // Negative for expenses
  isActual: boolean;                // true if "x" marker present
  note?: string;                    // Optional note
  reference?: string;               // Optional URL or reference
}
```

**Example:**

```json
{
  "scenario_id": "baseline",
  "date": "2024-12-15",
  "starting_balance": 3073.86,
  "transactions": [
    {
      "template_id": "rv_park",
      "amount": -635.10,
      "isActual": true,
      "reference": "https://amazon.com/..."
    },
    {
      "template_id": "groceries",
      "amount": -200.00,
      "isActual": true
    },
    {
      "template_id": "mortgage",
      "amount": -1500.00,
      "isActual": false
    },
    {
      "template_id": "fuel",
      "amount": -80.00,
      "isActual": true
    }
  ],
  "ending_balance": 658.76
}
```

### Key Differences

- **Old:** Each period tab is manually created and formulas copy forward
- **New:** PeriodSnapshots are generated by calculator engine
- **Benefit:** Regenerate projections instantly when scenarios change

---

## Actual vs Projected Transactions

This is one of the most important mappings to understand.

### The "x" Marker on Transactions (Rows 3-9)

In Google Sheets, transactions in rows 3-9 can have an "x" marker:

#### WITH "x" marker → ACTUAL Transaction

```
A    B          C        D
x    RV Park    635.10   $2,438.76
```

- User manually entered this transaction
- Amount is what ACTUALLY was paid (not projected)
- This is historical data that won't change

#### WITHOUT "x" marker → PROJECTED Transaction

```
A    B          C        D
     Mortgage   1500.00  $938.76
```

- Calculated from template + CONFIG values
- This is a projection (hasn't happened yet)
- Amount may change if CONFIG or templates change

### New Model: ActualTransaction

Actual transactions are stored separately:

```typescript
interface ActualTransaction {
  id: string;                       // Unique identifier
  date: string;                     // When it occurred (ISO format)
  template_id: string;              // Which template (if any)
  amount: number;                   // Actual amount (negative for expenses)
  note?: string;                    // Optional description
  reference?: string;               // Optional URL/receipt
}
```

**Example:**

```json
{
  "id": "act_001",
  "date": "2024-12-15",
  "template_id": "rv_park",
  "amount": -635.10,
  "isActual": true,
  "reference": "https://amazon.com/..."
}
```

### How the System Uses Actuals

When calculating a period:

1. Calculator generates projected transactions from templates
2. Checks if ActualTransaction exists for that template + date
3. If actual exists, **replace projected with actual**
4. If no actual exists, use projected amount

```typescript
// Pseudocode
function calculatePeriod(scenario: Scenario, date: string) {
  const transactions = generateProjectedTransactions(scenario, date);

  // Override with actuals
  transactions.forEach(tx => {
    const actual = findActualTransaction(tx.template_id, date);
    if (actual) {
      tx.amount = actual.amount;
      tx.isActual = true;
    }
  });

  return transactions;
}
```

### Key Differences

- **Old:** "x" marker indicates manual entry, both live in same spreadsheet rows
- **New:** ActualTransactions stored separately, override projections during calculation
- **Benefit:** Keep historical data separate from projection logic

---

## Multi-Period View

### Google Sheets: Multiple Tabs

The spreadsheet has many period tabs:

```
Tabs: [Start Dec-15] [Jan-1] [Jan-15] [Feb-1] [Feb-15] [Mar-1] [Mar-15] ...
```

Each tab represents the same scenario at a different point in time:

- **Start Dec-15:** Ending balance = $2,359.78
- **Jan-1:** Starting balance = $2,359.78, Ending balance = $5,500.00
- **Jan-15:** Starting balance = $5,500.00, Ending balance = $8,200.00

The ending balance from one period becomes the starting balance of the next.

### New Model: Array of PeriodSnapshots

All periods for a scenario are stored as an array:

```typescript
type ScenarioTimeline = PeriodSnapshot[];
```

**Example:**

```json
[
  {
    "scenario_id": "baseline",
    "date": "2024-12-15",
    "starting_balance": 3073.86,
    "ending_balance": 2359.78,
    "transactions": [...]
  },
  {
    "scenario_id": "baseline",
    "date": "2025-01-01",
    "starting_balance": 2359.78,
    "ending_balance": 5500.00,
    "transactions": [...]
  },
  {
    "scenario_id": "baseline",
    "date": "2025-01-15",
    "starting_balance": 5500.00,
    "ending_balance": 8200.00,
    "transactions": [...]
  }
]
```

### Calculator Output: Multiple Scenarios

The calculator generates timelines for ALL scenarios:

```json
{
  "baseline": [
    { "date": "2024-12-15", "ending_balance": 2359.78 },
    { "date": "2025-01-01", "ending_balance": 5500.00 },
    { "date": "2025-01-15", "ending_balance": 8200.00 }
  ],
  "with_second_job": [
    { "date": "2024-12-15", "ending_balance": 2359.78 },
    { "date": "2025-01-01", "ending_balance": 6800.00 },
    { "date": "2025-01-15", "ending_balance": 10500.00 }
  ],
  "house_sold": [
    { "date": "2024-12-15", "ending_balance": 2359.78 },
    { "date": "2025-01-01", "ending_balance": 52359.78 },
    { "date": "2025-01-15", "ending_balance": 55500.00 }
  ]
}
```

### Key Differences

- **Old:** One scenario = one set of period tabs
- **New:** One scenario = one array in calculator output
- **Benefit:** Compare multiple scenario timelines simultaneously

---

## Diagram Chart Evolution

### Google Sheets: Single-Line Chart

The "Diagram" tab shows a chart with:

- **X-axis:** Period dates (Jan-1, Jan-15, Feb-1, etc.)
- **Y-axis:** Account balance
- **Single line:** Represents one scenario (the current CONFIG)

To compare scenarios:
1. Note current chart results
2. Change CONFIG values
3. View new chart
4. Manually compare (or export to external tool)

### New System: Multi-Scenario Chart

The new visualization overlays multiple scenarios:

```
Balance
   │
12K│                                      ╱── House Sold
   │                                    ╱
10K│                          ╱────────
   │                        ╱
 8K│              ╱────────────────────── With Second Job
   │            ╱
 6K│    ╱──────
   │  ╱
 4K│╱─────────────────────────────────── Baseline
   │
 2K│
   │
   └─────────────────────────────────────
    Dec-15  Jan-1  Jan-15  Feb-1  Feb-15
```

**Features:**
- Multiple lines, different colors
- Legend showing scenario names
- Interactive (hover to see exact values)
- Synchronized x-axis (same time periods)

### Chart Data Structure

```typescript
interface ChartData {
  labels: string[];                      // X-axis labels (dates)
  datasets: ChartDataset[];              // One per scenario
}

interface ChartDataset {
  label: string;                         // Scenario name
  data: number[];                        // Balance at each period
  borderColor: string;                   // Line color
  backgroundColor: string;               // Fill color (if area chart)
}
```

**Example:**

```json
{
  "labels": ["Dec-15", "Jan-1", "Jan-15", "Feb-1", "Feb-15"],
  "datasets": [
    {
      "label": "Baseline",
      "data": [2359.78, 5500.00, 8200.00, 6800.00, 9500.00],
      "borderColor": "#3b82f6",
      "backgroundColor": "#3b82f620"
    },
    {
      "label": "With Second Job",
      "data": [2359.78, 6800.00, 10500.00, 9100.00, 13200.00],
      "borderColor": "#10b981",
      "backgroundColor": "#10b98120"
    },
    {
      "label": "House Sold",
      "data": [2359.78, 52359.78, 55500.00, 54100.00, 57200.00],
      "borderColor": "#f59e0b",
      "backgroundColor": "#f59e0b20"
    }
  ]
}
```

### Key Differences

- **Old:** One scenario visible at a time
- **New:** All scenarios overlaid on same chart
- **Benefit:** Immediate visual comparison of different futures

---

## Summary: Complete Mapping

### Data Flow Comparison

**Google Sheets:**
```
CONFIG (tab)
   ↓
Templates (rows 22+) → Enable with "x"
   ↓
Period Tabs (formulas) → Mark actuals with "x"
   ↓
Diagram (chart) → Single line
```

**New System:**
```
TransactionTemplates (defined once)
   ↓
Scenarios (multiple) → Reference templates + config
   ↓
Calculator → Processes all scenarios + actuals
   ↓
PeriodSnapshots (arrays) → One per scenario
   ↓
Multi-Scenario Chart → All scenarios overlaid
```

### Complete Field Mapping Table

See [field-mapping-table.md](./field-mapping-table.md) for comprehensive field-by-field mapping.

### Migration Guide

See [extract-from-sheets.md](./extract-from-sheets.md) for step-by-step code to extract existing data.

---

## Next Steps

1. **Review this mapping** to ensure accuracy
2. **Extract existing data** using migration scripts
3. **Set up transaction templates** in new system
4. **Define scenarios** (baseline + variations)
5. **Import actual transactions** (all rows with "x" markers)
6. **Run calculator** to generate projections
7. **Compare results** with Google Sheets to validate

---

## Questions?

If anything is unclear or you find discrepancies between this documentation and the actual Google Sheets structure, please document them for correction.
