# Field Mapping Table: Google Sheets → New Data Model

This table provides a comprehensive field-by-field mapping between the Google Sheets implementation and the new data model.

## Table of Contents

1. [CONFIG Tab Fields](#config-tab-fields)
2. [Transaction Template Fields](#transaction-template-fields)
3. [Period Tab Fields](#period-tab-fields)
4. [Transaction Row Fields](#transaction-row-fields)
5. [Special Elements](#special-elements)

---

## CONFIG Tab Fields

| Google Sheets Element | Location | Type | Maps To Model | Field Path | Notes |
|----------------------|----------|------|---------------|------------|-------|
| Config key name | CONFIG!A:A | Text | Scenario | `config[key]` | Key in config object |
| Config value | CONFIG!B:B | Various | Scenario | `config[key]` | Value for that key |
| Mortgage_Paid_Month | CONFIG!A1:B1 | Text | Scenario | `config.Mortgage_Paid_Month` | Convert "Mar-1" to "2025-03-01" |
| Monthly_Mortgage_Payment | CONFIG!A2:B2 | Number | Scenario | `config.Monthly_Mortgage_Payment` | Use as-is: 1500 |
| Any custom config | CONFIG!A*:B* | Various | Scenario | `config[custom_key]` | All CONFIG rows become config fields |

**Migration Notes:**
- All CONFIG rows become properties in `Scenario.config`
- Date values should be converted to ISO format (YYYY-MM-DD)
- Numeric values remain as numbers
- Text values remain as strings

---

## Transaction Template Fields

| Google Sheets Element | Location | Type | Maps To Model | Field Path | Notes |
|----------------------|----------|------|---------------|------------|-------|
| "x" marker (templates) | Period!A22+ | Text | Scenario | `enabled_transactions[]` | "x" means template ID goes in array |
| Template name | Period!B22+ | Text | TransactionTemplate | `name` | Display name (e.g., "Plexis") |
| Template ID | Period!B22+ | Text | TransactionTemplate | `id` | Lowercase, underscored (e.g., "plexis") |
| Template amount | Period!C22+ | Number | TransactionTemplate | `amount` | Fixed amount or null if formula |
| Empty amount | Period!C22+ | Empty | TransactionTemplate | `amount.formula` | If empty, use formula reference |

**Mapping Logic for Templates:**

```javascript
// Pseudo-code for extracting template
const row = sheet.getRange('A23:C23').getValues()[0];

if (row[0] === 'x') {
  // Template is ENABLED in this scenario
  const templateId = row[1].toLowerCase().replace(/\s+/g, '_');
  scenario.enabled_transactions.push(templateId);
}

// Template definition (regardless of enabled state)
const template = {
  id: row[1].toLowerCase().replace(/\s+/g, '_'),
  name: row[1],
  amount: row[2] || { formula: 'CONFIG.some_value' },
  type: row[2] > 0 ? 'income' : 'expense',
  frequency: 'monthly' // Infer or set default
};
```

**Example Mappings:**

| Google Sheets | Model |
|---------------|-------|
| `x  Plexis` | `enabled_transactions: ["plexis"]`<br/>`{id: "plexis", name: "Plexis", ...}` |
| `   Insurance  100` | Not in `enabled_transactions`<br/>`{id: "insurance", name: "Insurance", amount: 100}` |
| `x  Mortgage` | `enabled_transactions: ["mortgage"]`<br/>`{id: "mortgage", name: "Mortgage", amount: {formula: "CONFIG.Monthly_Mortgage_Payment"}}` |

---

## Period Tab Fields

| Google Sheets Element | Location | Type | Maps To Model | Field Path | Notes |
|----------------------|----------|------|---------------|------------|-------|
| Tab name | Tab name | Text | PeriodSnapshot | `date` | Convert "Start Dec-15" to "2024-12-15" |
| "Starter Balance" label | Period!B1 | Text | N/A | N/A | Label only, not data |
| Starting balance value | Period!D1 | Number | PeriodSnapshot | `starting_balance` | Opening balance for period |
| "Ending Balance" label | Period!B16 | Text | N/A | N/A | Label only, not data |
| Ending balance value | Period!D16 | Number | PeriodSnapshot | `ending_balance` | Closing balance for period |
| Transaction rows | Period!A3:D9 | Mixed | PeriodSnapshot | `transactions[]` | See next section |
| Template rows | Period!A22:C30 | Mixed | Scenario | `enabled_transactions[]` | See template section above |

**Tab Name Conversion:**

| Google Sheets Tab | ISO Date | Notes |
|------------------|----------|-------|
| Start Dec-15 | 2024-12-15 | Assume current/previous year |
| Jan-1 | 2025-01-01 | Next occurrence of Jan-1 |
| Jan-15 | 2025-01-15 | Mid-month date |
| Feb-1 | 2025-02-01 | Next month |

**Migration Notes:**
- Parse tab names to extract month and day
- Determine year based on sequence (Dec → Jan means year increments)
- `starting_balance` of current period should equal `ending_balance` of previous period

---

## Transaction Row Fields

Transaction rows appear in rows 3-9 of each period tab.

| Google Sheets Element | Location | Type | Maps To Model | Field Path | Notes |
|----------------------|----------|------|---------------|------------|-------|
| "x" marker (transaction) | Period!A3:A9 | Text | TransactionInstance | `isActual` | "x" = true, empty = false |
| Transaction name | Period!B3:B9 | Text | TransactionInstance | `template_id` | Convert to lowercase_underscore |
| Transaction amount | Period!C3:C9 | Number | TransactionInstance | `amount` | Expenses are negative |
| Running balance | Period!D3:D9 | Number | N/A | N/A | Calculated, not stored |
| Reference link | Period!F3:F9 | URL | TransactionInstance | `reference` | Optional URL/receipt |

**Transaction Type Determination:**

```javascript
// Determine if actual or projected
const row = sheet.getRange('A3:F3').getValues()[0];

const transaction = {
  template_id: row[1].toLowerCase().replace(/\s+/g, '_'),
  amount: -Math.abs(row[2]), // Expenses negative
  isActual: row[0] === 'x',
  reference: row[5] || undefined
};
```

**Actual vs Projected:**

| Marker | Example Row | Model | Notes |
|--------|-------------|-------|-------|
| `x` | `x  RV Park  635.10  $2,438.76  https://...` | `{template_id: "rv_park", amount: -635.10, isActual: true, reference: "https://..."}` | User manually entered |
| (empty) | `   Mortgage  1500.00  $938.76` | `{template_id: "mortgage", amount: -1500.00, isActual: false}` | Formula calculated |

**Special Cases:**

| Google Sheets | Handling |
|---------------|----------|
| Row with amount but no name | Create one-off transaction with generated ID |
| Row with "Liquidated" or special text | Map to special transaction type or note |
| Empty row | Skip (no transaction) |
| Row with formula in amount | Evaluate formula, store result |

---

## Special Elements

### Chart / Diagram Tab

| Google Sheets Element | Location | Maps To Model | Notes |
|----------------------|----------|---------------|-------|
| Chart X-axis labels | Diagram tab | Chart labels | Period dates |
| Chart Y-axis values | Diagram tab | Chart data points | Balance at each period |
| Single line | Diagram tab | One dataset | Represents current CONFIG |

**New Model:**
- Multiple datasets (one per scenario)
- All scenarios overlaid on same chart
- Different colors for each scenario

### Formula References

| Google Sheets Formula | Maps To | Example |
|----------------------|---------|---------|
| `=CONFIG!B2` | TransactionTemplate.amount.formula | `{formula: "CONFIG.Monthly_Mortgage_Payment"}` |
| `=D1-C3` | Calculator logic | Not stored, recalculated |
| `=IF(...)` | Conditional logic | May need to be implemented in calculator |

### Date/Time Handling

| Google Sheets | Format | New Model | Format |
|---------------|--------|-----------|--------|
| Mar-1 | Text | 2025-03-01 | ISO 8601 |
| Jan-15 | Text | 2025-01-15 | ISO 8601 |
| Start Dec-15 | Tab name | 2024-12-15 | ISO 8601 |

---

## Complete Mapping Example

### Input: Google Sheets Row

**CONFIG Tab:**
```
A                           B
Mortgage_Paid_Month         Mar-1
Monthly_Mortgage_Payment    1500
```

**Period Tab: "Start Dec-15"**
```
Row 1:  Starter Balance                     $3,073.86

Row 3:  x    RV Park        635.10     $2,438.76    https://amazon.com/order123
Row 4:  x    Groceries      200.00     $2,238.76
Row 5:       Mortgage       1500.00    $738.76
Row 6:  x    Fuel           80.00      $658.76

Row 16: Ending Balance                      $658.76

Row 23: x    Plexis
Row 24: x    Mortgage
Row 25: x    RV Park    900
```

### Output: New Data Model

**Scenario:**
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

**TransactionTemplates:**
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
    "frequency": "monthly"
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

**PeriodSnapshot:**
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
      "reference": "https://amazon.com/order123"
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

**ActualTransactions:**
```json
[
  {
    "id": "act_001",
    "date": "2024-12-15",
    "template_id": "rv_park",
    "amount": -635.10,
    "reference": "https://amazon.com/order123"
  },
  {
    "id": "act_002",
    "date": "2024-12-15",
    "template_id": "groceries",
    "amount": -200.00
  },
  {
    "id": "act_003",
    "date": "2024-12-15",
    "template_id": "fuel",
    "amount": -80.00
  }
]
```

---

## Validation Checklist

When migrating data, verify:

- [ ] All CONFIG values are present in Scenario.config
- [ ] Template IDs are lowercase with underscores
- [ ] All "x" marked templates appear in enabled_transactions
- [ ] Starting balance of period N equals ending balance of period N-1
- [ ] Transactions with "x" have isActual: true
- [ ] Transactions without "x" have isActual: false
- [ ] All expense amounts are negative
- [ ] All income amounts are positive
- [ ] Dates are in ISO format (YYYY-MM-DD)
- [ ] Sum of transactions equals (ending_balance - starting_balance)

---

## Common Pitfalls

1. **Forgetting to negate expenses:** Google Sheets may show positive numbers, but model expects negative
2. **Incorrect date parsing:** "Jan-1" could be 2024 or 2025 depending on context
3. **Missing templates:** Template row exists but not defined in master list
4. **Duplicate template IDs:** "RV Park" and "RV_Park" become same ID
5. **Formula evaluation:** CONFIG references need to be resolved at calculation time

---

## See Also

- [google-sheets-mapping.md](./google-sheets-mapping.md) - Visual mapping with screenshots
- [extract-from-sheets.md](./extract-from-sheets.md) - Migration code examples
- [architecture-comparison.md](./architecture-comparison.md) - High-level architecture differences
