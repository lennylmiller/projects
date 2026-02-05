# Data Schema Documentation

Complete JSON schemas with validation rules for the cashflow analysis system.

## Overview

The data model consists of four main entities:
1. **TransactionTemplate** - Reusable income/expense patterns
2. **Scenario** - What-if configuration with enabled transactions and CONFIG values
3. **ActualTransaction** - Historical locked-in transactions
4. **PeriodSnapshot** - Calculated cashflow state for a specific date/scenario

## TransactionTemplate

Defines a reusable income or expense pattern that can occur across multiple periods.

### Schema

```json
{
  "id": "string (required, unique)",
  "name": "string (required)",
  "type": "income | expense (required)",
  "amount": "number | { formula: string } (required)",
  "frequency": "monthly | bi-weekly | weekly | quarterly | one-time | custom (required)",
  "startDate": "ISO date string (optional)",
  "endDate": "ISO date string (optional)",
  "endsOn": "ISO date string | { formula: string } (optional)",
  "isRecurring": "boolean (default: true)",
  "category": "string (optional)"
}
```

### Field Descriptions

- **id**: Unique identifier for the template (e.g., "payroll", "mortgage")
- **name**: Display name for the transaction
- **type**: Whether this is income (positive) or expense (negative)
- **amount**: Fixed amount or formula that references CONFIG variables
- **frequency**: How often the transaction occurs
- **startDate**: When the transaction becomes active (null = active immediately)
- **endDate**: When the transaction stops (null = never ends)
- **endsOn**: Alternative to endDate, can use formula (e.g., CONFIG.Mortgage_Paid_Month)
- **isRecurring**: Whether transaction repeats or is one-time
- **category**: Optional categorization (e.g., "housing", "income", "transportation")

### Examples

**Simple Income (Fixed Amount)**
```json
{
  "id": "payroll",
  "name": "Payroll",
  "type": "income",
  "amount": 4159.99,
  "frequency": "bi-weekly",
  "startDate": "2025-01-01"
}
```

**Expense with Formula**
```json
{
  "id": "mortgage",
  "name": "Mortgage Payment",
  "type": "expense",
  "amount": { "formula": "CONFIG.Monthly_Mortgage_Payment" },
  "frequency": "monthly",
  "startDate": "2025-01-01",
  "endsOn": { "formula": "CONFIG.Mortgage_Paid_Month" }
}
```

**One-Time Transaction**
```json
{
  "id": "house_sale",
  "name": "House Sale Proceeds",
  "type": "income",
  "amount": 300000,
  "frequency": "one-time",
  "startDate": "2025-02-15",
  "isRecurring": false
}
```

### Validation Rules

1. `id` must be non-empty string, unique across all templates
2. `name` must be non-empty string
3. `type` must be exactly "income" or "expense"
4. `amount` must be number OR object with "formula" property
5. `frequency` must be one of: monthly, bi-weekly, weekly, quarterly, one-time, custom
6. If `frequency` is "one-time", `startDate` is required
7. Cannot have both `endDate` and `endsOn` (use one or the other)
8. Dates must be valid ISO date strings (YYYY-MM-DD)

## Scenario

Defines a what-if scenario with specific transaction enables/disables and CONFIG values.

### Schema

```json
{
  "id": "string (required, unique)",
  "name": "string (required)",
  "enabled_transactions": "array of template IDs (required)",
  "config": "object with key-value pairs (required)",
  "color": "hex color string (optional, default: #3B82F6)",
  "description": "string (optional)",
  "basedOn": "scenario ID (optional)"
}
```

### Field Descriptions

- **id**: Unique identifier for the scenario (e.g., "baseline", "with_second_job")
- **name**: Display name shown in UI and charts
- **enabled_transactions**: Array of template IDs that are active in this scenario
- **config**: Key-value pairs for CONFIG variables used in formulas
- **color**: Hex color for chart visualization
- **description**: Optional longer description of what this scenario represents
- **basedOn**: Optional reference to parent scenario (for inheritance)

### Examples

**Baseline Scenario**
```json
{
  "id": "baseline",
  "name": "Baseline (Current Plan)",
  "enabled_transactions": ["payroll", "mortgage", "rv_park", "disability"],
  "config": {
    "Mortgage_Paid_Month": "2025-03-01",
    "Monthly_Mortgage_Payment": 1500
  },
  "color": "#3B82F6",
  "description": "Current financial plan with existing income and expenses"
}
```

**Second Job Scenario**
```json
{
  "id": "with_second_job",
  "name": "With Second Job",
  "enabled_transactions": ["payroll", "plexis", "mortgage", "rv_park", "disability"],
  "config": {
    "Mortgage_Paid_Month": "2025-02-01",
    "Monthly_Mortgage_Payment": 1500
  },
  "color": "#10B981",
  "description": "Adding Plexis income allows earlier mortgage payoff"
}
```

**House Sold Scenario**
```json
{
  "id": "house_sold",
  "name": "House Sold February",
  "enabled_transactions": ["payroll", "rv_park", "disability", "house_sale"],
  "config": {
    "Mortgage_Paid_Month": "2025-02-01",
    "Monthly_Mortgage_Payment": 0,
    "House_Sale_Amount": 300000,
    "House_Sale_Date": "2025-02-15"
  },
  "color": "#F59E0B",
  "description": "Selling house eliminates mortgage and provides lump sum"
}
```

### Validation Rules

1. `id` must be non-empty string, unique across all scenarios
2. `name` must be non-empty string
3. `enabled_transactions` must be array (can be empty)
4. All items in `enabled_transactions` must reference valid template IDs
5. `config` must be object (can be empty)
6. `color` must be valid hex color if provided
7. `basedOn` must reference existing scenario ID if provided

## ActualTransaction

Represents a historical, locked-in transaction that overrides projected values.

### Schema

```json
{
  "id": "string (auto-generated if not provided)",
  "date": "ISO date string (required)",
  "template_id": "string (required)",
  "amount": "number (required)",
  "isActual": "boolean (default: true)",
  "notes": "string (optional)",
  "createdAt": "ISO datetime string (auto-generated)"
}
```

### Field Descriptions

- **id**: Unique identifier (auto-generated as "actual_timestamp_random")
- **date**: Date when this transaction occurred (YYYY-MM-DD)
- **template_id**: Reference to the transaction template
- **amount**: Actual amount (positive for income, negative for expense)
- **isActual**: Always true (marks this as actual vs projected)
- **notes**: Optional notes about this transaction
- **createdAt**: Timestamp when this actual was recorded

### Examples

**Actual Paycheck with Bonus**
```json
{
  "id": "actual_1704200400000_xyz123",
  "date": "2025-01-15",
  "template_id": "payroll",
  "amount": 5000,
  "isActual": true,
  "notes": "Regular pay plus year-end bonus",
  "createdAt": "2025-01-15T08:30:00Z"
}
```

**Actual Expense Lower Than Expected**
```json
{
  "id": "actual_1704200400000_abc456",
  "date": "2025-01-01",
  "template_id": "rv_park",
  "amount": -850,
  "isActual": true,
  "notes": "Got discount for early payment",
  "createdAt": "2025-01-02T10:15:00Z"
}
```

### Validation Rules

1. `date` must be valid ISO date string (YYYY-MM-DD)
2. `template_id` must be non-empty string
3. `amount` must be number (positive for income, negative for expense)
4. `isActual` must be true
5. If provided, `id` must be unique across all actuals

### Actual Override Logic

When calculating a period:
1. Check if actual exists for (date, template_id)
2. If YES: Use actual amount, mark transaction as isActual=true
3. If NO: Calculate projected amount from template, mark as isActual=false

## PeriodSnapshot

Calculated cashflow state for a specific date and scenario.

### Schema

```json
{
  "scenario_id": "string (required)",
  "date": "ISO date string (required)",
  "starting_balance": "number (required)",
  "transactions": "array of TransactionInstance (required)",
  "ending_balance": "number (required)",
  "metadata": "object (optional)"
}
```

### TransactionInstance Schema

```json
{
  "template_id": "string",
  "name": "string",
  "type": "income | expense",
  "amount": "number",
  "isActual": "boolean",
  "notes": "string",
  "category": "string (optional)"
}
```

### Field Descriptions

- **scenario_id**: Reference to the scenario this snapshot belongs to
- **date**: Date of this period (YYYY-MM-DD)
- **starting_balance**: Balance at beginning of period
- **transactions**: Array of all transactions that occurred in this period
- **ending_balance**: Balance at end of period (starting + sum of transactions)
- **metadata**: Optional additional data (e.g., calculatedAt timestamp)

### Example

```json
{
  "scenario_id": "baseline",
  "date": "2025-01-15",
  "starting_balance": 2359.78,
  "transactions": [
    {
      "template_id": "payroll",
      "name": "Payroll",
      "type": "income",
      "amount": 4159.99,
      "isActual": true,
      "notes": "Regular paycheck",
      "category": "income"
    },
    {
      "template_id": "rv_park",
      "name": "RV Park",
      "type": "expense",
      "amount": -900,
      "isActual": false,
      "notes": "",
      "category": "housing"
    }
  ],
  "ending_balance": 5619.77,
  "metadata": {
    "calculatedAt": "2025-01-10T12:00:00Z"
  }
}
```

### Validation Rules

1. `scenario_id` must reference valid scenario
2. `date` must be valid ISO date string
3. `starting_balance` must be number
4. `ending_balance` must be number
5. `transactions` must be array (can be empty)
6. Each transaction must have: template_id, name, type, amount, isActual
7. Balance integrity: `ending_balance` should equal `starting_balance + sum(transaction amounts)`

### Calculated Properties

The PeriodSnapshot class provides methods to calculate:
- **getTotalIncome()**: Sum of all income transactions
- **getTotalExpenses()**: Sum of all expense transactions (absolute value)
- **getNetChange()**: Total income - total expenses

## CONFIG Variables

CONFIG variables are user-defined values stored in the scenario's `config` object. They can be referenced in formulas using the syntax: `CONFIG.variable_name`

### Common CONFIG Variables

```javascript
{
  "Mortgage_Paid_Month": "2025-03-01",      // Date when mortgage ends
  "Monthly_Mortgage_Payment": 1500,         // Mortgage payment amount
  "House_Sale_Amount": 300000,              // Expected house sale price
  "House_Sale_Date": "2025-02-15",          // Date of house sale
  "RV_Park_Monthly": 900,                   // RV park monthly fee
  "Emergency_Fund_Target": 10000,           // Savings goal
  "Tax_Rate": 0.22                          // Tax rate for calculations
}
```

### Formula Examples

**Reference CONFIG Value**
```json
{
  "amount": { "formula": "CONFIG.Monthly_Mortgage_Payment" }
}
```

**Conditional Formula**
```json
{
  "amount": {
    "formula": "date < CONFIG.House_Sale_Date ? CONFIG.Monthly_Mortgage_Payment : 0"
  }
}
```

**Calculation Formula**
```json
{
  "amount": {
    "formula": "CONFIG.Base_Salary * (1 + CONFIG.Tax_Rate)"
  }
}
```

## Date Formats

All dates use ISO 8601 format:
- **Date only**: `YYYY-MM-DD` (e.g., "2025-01-15")
- **Date and time**: `YYYY-MM-DDTHH:mm:ssZ` (e.g., "2025-01-15T08:30:00Z")

### Period Date Generation

The system generates period dates based on transaction frequencies:

1. **Monthly**: 1st and 15th of each month
2. **Bi-weekly**: Every 14 days from start date
3. **Weekly**: Every 7 days from start date
4. **Quarterly**: Every 3 months from start date
5. **One-time**: Only on start date

All dates are sorted chronologically and combined (union of all frequencies).

## Import/Export Format

### Complete Data Export

```json
{
  "version": "1.0",
  "exportedAt": "2025-01-15T12:00:00Z",
  "templates": [
    { /* TransactionTemplate objects */ }
  ],
  "scenarios": [
    { /* Scenario objects */ }
  ],
  "actuals": [
    { /* ActualTransaction objects */ }
  ],
  "settings": {
    "defaultStartDate": "2025-01-01",
    "defaultEndDate": "2025-12-31",
    "initialBalance": 2359.78,
    "currency": "USD"
  }
}
```

## Type Definitions (TypeScript)

```typescript
interface TransactionTemplate {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number | { formula: string };
  frequency: 'monthly' | 'bi-weekly' | 'weekly' | 'quarterly' | 'one-time' | 'custom';
  startDate?: string;
  endDate?: string;
  endsOn?: string | { formula: string };
  isRecurring?: boolean;
  category?: string;
}

interface Scenario {
  id: string;
  name: string;
  enabled_transactions: string[];
  config: Record<string, any>;
  color?: string;
  description?: string;
  basedOn?: string;
}

interface ActualTransaction {
  id?: string;
  date: string;
  template_id: string;
  amount: number;
  isActual?: boolean;
  notes?: string;
  createdAt?: string;
}

interface TransactionInstance {
  template_id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  isActual: boolean;
  notes: string;
  category?: string;
}

interface PeriodSnapshot {
  scenario_id: string;
  date: string;
  starting_balance: number;
  transactions: TransactionInstance[];
  ending_balance: number;
  metadata?: Record<string, any>;
}
```

## Error Handling

### Validation Errors

All entities have a `validate()` method that throws errors for invalid data:

```javascript
try {
  template.validate();
} catch (error) {
  console.error('Validation failed:', error.message);
  // Handle validation error
}
```

### Common Error Messages

- "Transaction template must have a valid id"
- "Amount must be a number or formula object"
- "Frequency must be one of: monthly, bi-weekly, ..."
- "Formula evaluation failed: [formula] - [error]"
- "CONFIG variable not found: [variable_name]"

## Best Practices

1. **Template IDs**: Use lowercase with underscores (e.g., "second_job", "rv_park")
2. **Scenario IDs**: Use descriptive names (e.g., "baseline", "optimistic", "conservative")
3. **CONFIG Variables**: Use PascalCase (e.g., "Mortgage_Paid_Month", "Monthly_Payment")
4. **Amounts**: Store expenses as positive in templates (engine converts to negative)
5. **Dates**: Always use ISO format for consistency
6. **Formulas**: Keep simple for maintainability; complex logic belongs in rules engine
7. **Actuals**: Record as soon as transactions occur for accurate projections
8. **Categories**: Use consistent categorization for reporting (optional but recommended)
