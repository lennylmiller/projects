# Architecture Comparison: Google Sheets vs New System

This document provides a high-level comparison of the architectural approaches between the Google Sheets implementation and the new data-driven system.

## Visual Architecture Comparison

### Google Sheets Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GOOGLE SHEETS                           │
│                     (Single Workbook)                        │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  CONFIG Tab  │  │ Period Tabs  │  │ Diagram Tab  │
    │              │  │              │  │              │
    │ Key  │ Value │  │ Start Dec-15 │  │   [Chart]    │
    │ ──── │ ───── │  │   Jan-1      │  │     📊       │
    │ Mtg  │ 1500  │  │   Jan-15     │  │  Single Line │
    │ Date │ Mar-1 │  │   Feb-1      │  │              │
    └──────────────┘  │   Feb-15     │  └──────────────┘
            │         │   ...        │
            │         └──────────────┘
            │                 │
            │         ┌───────┴────────┐
            │         │                │
            │         ▼                ▼
            │  ┌─────────────┐  ┌─────────────┐
            │  │ Starter Bal │  │  Templates  │
            │  │  $3,073.86  │  │  (rows 22+) │
            │  ├─────────────┤  │             │
            │  │Transactions │  │ x Plexis    │
            │  │ x RV Park   │  │ x Mortgage  │
            │  │   Mortgage  │  │ x RV Park   │
            │  ├─────────────┤  │             │
            │  │ Ending Bal  │  │             │
            │  │  $2,359.78  │  │             │
            │  └─────────────┘  └─────────────┘
            │                          │
            └──────────┬───────────────┘
                       │
                       ▼
            ┌────────────────────┐
            │  Formulas Connect  │
            │    Everything      │
            │                    │
            │  =CONFIG!B2        │
            │  =D1-C3            │
            │  =IF(A22="x",...)  │
            └────────────────────┘
```

**Key Characteristics:**
- **Single configuration** affects all calculations
- **Formulas embedded** in cells
- **Templates mixed** with period data
- **Manual propagation** of changes
- **One scenario** visible at a time

---

### New System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│                    (JSON / Database)                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Transaction     │     │   Scenarios     │     │     Actual      │
│   Templates     │     │                 │     │  Transactions   │
│  (Master List)  │     │ ┌─────────────┐ │     │                 │
│                 │     │ │  Baseline   │ │     │ ┌─────────────┐ │
│ • Payroll       │◄────┤ │  Config A   │ │     │ │ Dec-15 Rent │ │
│ • Plexis        │     │ │  [Pay,Mort] │ │     │ │   $635.10   │ │
│ • Mortgage      │◄────┤ └─────────────┘ │     │ └─────────────┘ │
│ • RV Park       │     │ ┌─────────────┐ │     │ ┌─────────────┐ │
│ • Insurance     │◄────┤ │ With 2nd Job│ │     │ │ Dec-15 Fuel │ │
│ • Groceries     │     │ │  Config B   │ │     │ │    $80.00   │ │
│                 │     │ │ [Pay,Plex]  │ │     │ └─────────────┘ │
└─────────────────┘     │ └─────────────┘ │     └─────────────────┘
         │              │ ┌─────────────┐ │              │
         │              │ │ House Sold  │ │              │
         │              │ │  Config C   │ │              │
         │              │ │ [Pay,Mort]  │ │              │
         │              │ └─────────────┘ │              │
         │              └─────────────────┘              │
         │                        │                      │
         └────────────────────────┼──────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   CALCULATOR ENGINE      │
                    │                          │
                    │  • Load templates        │
                    │  • For each scenario:    │
                    │    - Apply config        │
                    │    - Generate periods    │
                    │    - Override w/ actuals │
                    │    - Calculate balances  │
                    └──────────────────────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
        ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
        │ Baseline    │  │ With 2nd Job│  │ House Sold  │
        │  Timeline   │  │  Timeline   │  │  Timeline   │
        │             │  │             │  │             │
        │ [Dec-15]    │  │ [Dec-15]    │  │ [Dec-15]    │
        │   $2,359    │  │   $2,359    │  │   $2,359    │
        │ [Jan-1]     │  │ [Jan-1]     │  │ [Jan-1]     │
        │   $5,500    │  │   $6,800    │  │   $52,359   │
        │ [Jan-15]    │  │ [Jan-15]    │  │ [Jan-15]    │
        │   $8,200    │  │   $10,500   │  │   $55,500   │
        └─────────────┘  └─────────────┘  └─────────────┘
                 │                │                │
                 └────────────────┼────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  VISUALIZATION LAYER     │
                    │                          │
                    │  Multi-Scenario Chart    │
                    │                          │
                    │  ─── Baseline (blue)     │
                    │  ─── With Job (green)    │
                    │  ─── Sold (orange)       │
                    └──────────────────────────┘
```

**Key Characteristics:**
- **Multiple scenarios** defined upfront
- **Separation of concerns** (templates, scenarios, actuals)
- **Calculator engine** generates projections
- **Automatic comparison** of all scenarios
- **Parallel processing** of what-if scenarios

---

## Detailed Comparison

### 1. Configuration Management

| Aspect | Google Sheets | New System |
|--------|---------------|------------|
| **Storage** | CONFIG tab (key-value pairs) | `Scenario.config` object |
| **Scope** | Global (affects all periods) | Per-scenario (isolated) |
| **Comparison** | Manual (change, note, revert) | Automatic (define multiple scenarios) |
| **History** | Manual versioning | Version control (Git) |
| **Example** | `CONFIG!B2 = 1500` | `scenarios[0].config.Monthly_Mortgage_Payment = 1500` |

**Google Sheets Workflow:**
1. Set `Monthly_Mortgage_Payment = 1500`
2. Note ending balance: `$8,200`
3. Change to `Monthly_Mortgage_Payment = 1200`
4. Note new ending balance: `$8,500`
5. Manually compare results

**New System Workflow:**
1. Define scenario A: `Monthly_Mortgage_Payment = 1500`
2. Define scenario B: `Monthly_Mortgage_Payment = 1200`
3. Run calculator (processes both)
4. View both scenarios on chart (automatic comparison)

---

### 2. Transaction Templates

| Aspect | Google Sheets | New System |
|--------|---------------|------------|
| **Definition** | Bottom of each period tab | Separate `TransactionTemplate[]` |
| **Reusability** | Copied to each period tab | Defined once, referenced everywhere |
| **Enable/Disable** | "x" marker per period | `enabled_transactions` per scenario |
| **Modification** | Update in all period tabs | Update once in master list |
| **Formulas** | `=CONFIG!B2` in cells | `{formula: "CONFIG.value"}` in JSON |

**Example:**

**Google Sheets:**
```
Period Tab: Start Dec-15, rows 22+
x  Plexis
x  Mortgage
x  RV Park   900

Period Tab: Jan-1, rows 22+
x  Plexis
x  Mortgage
x  RV Park   900

Period Tab: Jan-15, rows 22+
x  Plexis
x  Mortgage
x  RV Park   900
```
*Templates repeated in each tab*

**New System:**
```json
{
  "templates": [
    {"id": "plexis", "name": "Plexis", "amount": 2200},
    {"id": "mortgage", "name": "Mortgage", "amount": {"formula": "CONFIG.Monthly_Mortgage_Payment"}},
    {"id": "rv_park", "name": "RV Park", "amount": 900}
  ],
  "scenarios": [
    {
      "id": "baseline",
      "enabled_transactions": ["plexis", "mortgage", "rv_park"]
    }
  ]
}
```
*Templates defined once, scenarios reference them*

---

### 3. Actual vs Projected Transactions

| Aspect | Google Sheets | New System |
|--------|---------------|------------|
| **Storage** | Mixed in same rows (rows 3-9) | Separate `ActualTransaction` objects |
| **Indicator** | "x" marker in column A | `isActual: true` or separate table |
| **Modification** | Add "x" to mark as actual | Insert into `actual_transactions` table |
| **Projection Override** | Formula disappears when "x" added | Calculator checks for actual, overrides projection |
| **History** | Difficult to see what changed | Clear separation of historical vs projected |

**Google Sheets:**
```
Row 3:  x  RV Park    635.10    $2,438.76     [ACTUAL - manually entered]
Row 4:     Mortgage   1500.00   $938.76       [PROJECTED - formula]
```

**New System:**
```json
{
  "period_snapshots": [{
    "transactions": [
      {"template_id": "rv_park", "amount": -635.10, "isActual": true},
      {"template_id": "mortgage", "amount": -1500.00, "isActual": false}
    ]
  }],
  "actual_transactions": [
    {"id": "act_001", "date": "2024-12-15", "template_id": "rv_park", "amount": -635.10}
  ]
}
```

---

### 4. Period Calculation

| Aspect | Google Sheets | New System |
|--------|---------------|------------|
| **Method** | Formulas in cells | Calculator engine |
| **Dependencies** | Previous cell references | Ordered array of periods |
| **Regeneration** | Manual (copy tab, update formulas) | Automatic (re-run calculator) |
| **Validation** | Manual review | Automated tests |
| **Performance** | Slow (recalculates on every change) | Fast (calculated on-demand) |

**Google Sheets:**
```
Period Tab: Jan-1
Row 1:  =PreviousTab!D16              [Starting balance from previous period]
Row 3:  =D1-C3                        [Running balance]
Row 4:  =D3-C4                        [Running balance]
Row 16: =D9                           [Ending balance]
```

**New System:**
```typescript
function calculatePeriod(scenario: Scenario, date: string, prevBalance: number): PeriodSnapshot {
  const transactions = generateTransactions(scenario, date);
  const starting_balance = prevBalance;
  const ending_balance = starting_balance + transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return { date, starting_balance, transactions, ending_balance };
}
```

---

### 5. Visualization

| Aspect | Google Sheets | New System |
|--------|---------------|------------|
| **Chart Type** | Single line chart | Multi-line overlay |
| **Scenarios** | One at a time | Multiple simultaneously |
| **Interactivity** | Limited (hover for values) | Rich (zoom, filter, compare) |
| **Export** | Screenshot or manual export | Programmatic (SVG, PNG, CSV) |
| **Customization** | Manual chart formatting | Theme-based styling |

**Google Sheets Diagram Tab:**
```
Balance
   │
 8K│          ╱─────
   │        ╱
 6K│      ╱
   │    ╱
 4K│  ╱
   │╱
   └────────────────
    Jan-1  Jan-15  Feb-1
```
*Single scenario shown*

**New System:**
```
Balance
   │
12K│                       ╱── House Sold
   │                     ╱
10K│           ╱────────────── With 2nd Job
   │         ╱
 8K│   ╱────────────────────── Baseline
   │ ╱
 6K│╱
   │
   └─────────────────────────
    Jan-1   Jan-15   Feb-1
```
*All scenarios overlaid*

---

## Data Flow Comparison

### Google Sheets Data Flow

```
User Input (CONFIG, "x" markers)
         ↓
Spreadsheet Formulas Execute
         ↓
Cell Values Update
         ↓
Chart Recalculates
         ↓
User Views Result
         ↓
[To compare scenarios: manual note-taking and re-running]
```

**Limitations:**
- Slow recalculation on every change
- No history of different scenarios
- Manual comparison required
- Difficult to debug formula errors
- Hard to extend with new features

---

### New System Data Flow

```
User Defines Scenarios (JSON)
         ↓
Calculator Loads Data
         ↓
For Each Scenario:
  ├─ Load Templates
  ├─ Apply Config
  ├─ Generate Periods
  ├─ Override with Actuals
  └─ Calculate Balances
         ↓
All Results Collected
         ↓
Visualization Renders All Scenarios
         ↓
User Sees Comparison Immediately
```

**Advantages:**
- Fast parallel processing
- All scenarios calculated once
- Automatic comparison
- Easy to test and validate
- Simple to add new scenarios

---

## Scenario Comparison Example

### Question: "What if I pay off my mortgage early?"

**Google Sheets Approach:**

1. Note current ending balance: `$8,200`
2. Change `CONFIG!B1` from `"Mar-1"` to `"Jan-1"`
3. Wait for recalculation
4. Note new ending balance: `$9,500`
5. Manually record difference: `$1,300` better
6. Revert `CONFIG!B1` back to `"Mar-1"` (or lose original scenario)

**New System Approach:**

1. Define scenario A: `Mortgage_Paid_Month: "Mar-1"`
2. Define scenario B: `Mortgage_Paid_Month: "Jan-1"`
3. Run calculator (instant)
4. View both lines on chart:
   - Blue line (Mar payoff): ends at `$8,200`
   - Green line (Jan payoff): ends at `$9,500`
5. Difference clearly visible: `$1,300` better
6. Both scenarios saved for future reference

---

## Scalability Comparison

### Adding a New Scenario: "What if I get a second job?"

**Google Sheets:**
1. Duplicate entire workbook (or manually note values)
2. Update CONFIG values
3. Update template enable/disable flags in ALL period tabs
4. Wait for recalculation
5. Export chart to compare with original
6. Manage multiple workbook files

**Estimated Time:** 10-15 minutes

---

**New System:**
1. Copy scenario JSON
2. Change ID and name
3. Update config values
4. Update enabled_transactions list
5. Run calculator

```json
{
  "id": "with_second_job",
  "name": "With Second Job",
  "config": {
    "Mortgage_Paid_Month": "2025-03-01",
    "Monthly_Mortgage_Payment": 1500,
    "Second_Job_Income": 1500
  },
  "enabled_transactions": ["plexis", "second_job", "mortgage", "rv_park"]
}
```

6. View on chart (automatically included)

**Estimated Time:** 1-2 minutes

---

## Migration Benefits Summary

| Benefit | Description |
|---------|-------------|
| **Speed** | Instant comparison of unlimited scenarios |
| **Accuracy** | Automated calculations reduce human error |
| **Maintainability** | Templates defined once, not copied everywhere |
| **Scalability** | Add scenarios without duplicating data |
| **Testability** | Automated tests validate calculator logic |
| **Version Control** | JSON files track changes over time |
| **Extensibility** | Easy to add features (categories, tags, etc.) |
| **Collaboration** | Multiple people can edit without conflicts |

---

## Trade-offs

### What Google Sheets Does Well

- **Familiarity:** Everyone knows how to use Excel/Sheets
- **Visual editing:** See all data in one place
- **Quick start:** No coding required
- **Flexibility:** Can add notes, formatting, ad-hoc calculations

### What New System Does Well

- **Automation:** Calculate all scenarios automatically
- **Comparison:** See all futures side-by-side
- **Scalability:** Handle many scenarios without complexity
- **Testing:** Validate calculations programmatically
- **Integration:** Can feed data to other systems

---

## Conclusion

The new system is designed to:

1. **Preserve the good ideas** from Google Sheets (templates, actuals vs projections)
2. **Fix the limitations** (single scenario, manual comparison)
3. **Enable new capabilities** (parallel scenarios, automated analysis)

The architecture separates concerns cleanly:
- **Data layer:** Templates, scenarios, actuals
- **Calculation layer:** Engine that processes scenarios
- **Visualization layer:** Charts that show comparisons

This separation makes the system more maintainable, testable, and scalable than a formula-based spreadsheet.

---

## See Also

- [google-sheets-mapping.md](./google-sheets-mapping.md) - Detailed field mapping
- [field-mapping-table.md](./field-mapping-table.md) - Complete field reference
- [extract-from-sheets.md](./extract-from-sheets.md) - Migration scripts
