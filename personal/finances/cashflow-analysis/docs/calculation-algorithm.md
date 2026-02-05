# Calculation Algorithm Documentation

Detailed pseudocode and algorithms for the cashflow calculation engine.

## Overview

The calculation engine processes transaction templates, scenarios, and actual transactions to produce period snapshots showing cashflow state over time.

## High-Level Flow

```
Input:
  - Transaction Templates (master list of possible transactions)
  - Scenario Definition (which templates enabled + CONFIG values)
  - Actual Transactions (historical locked-in data)
  - Date Range (start date, end date)
  - Initial Balance

Process:
  1. Generate period dates based on transaction frequencies
  2. For each period date:
     a. Determine which transactions should occur
     b. Check for actual overrides
     c. Calculate amounts (formulas + CONFIG)
     d. Update running balance
     e. Create period snapshot

Output:
  - Array of Period Snapshots (one per period date)
```

## Algorithm 1: Generate Period Dates

**Purpose**: Create a sorted list of all dates when transactions might occur

**Input**:
- Start date (e.g., "2025-01-01")
- End date (e.g., "2025-12-31")
- Transaction templates (array)

**Output**:
- Sorted array of ISO date strings

**Pseudocode**:

```
FUNCTION generatePeriodDates(startDate, endDate, templates):
    dateSet = empty set

    FOR EACH template IN templates:
        templateDates = []

        SWITCH template.frequency:
            CASE "monthly":
                // Generate 1st and 15th of each month
                templateDates = generateMonthlyDates(
                    template.startDate OR startDate,
                    endDate,
                    daysOfMonth = [1, 15]
                )

            CASE "bi-weekly":
                // Generate every 14 days from start
                templateDates = generateBiWeeklyDates(
                    template.startDate OR startDate,
                    endDate
                )

            CASE "weekly":
                // Generate every 7 days from start
                templateDates = generateWeeklyDates(
                    template.startDate OR startDate,
                    endDate
                )

            CASE "quarterly":
                // Generate every 3 months from start
                templateDates = generateQuarterlyDates(
                    template.startDate OR startDate,
                    endDate
                )

            CASE "one-time":
                // Single date only
                IF template.startDate:
                    templateDates = [template.startDate]

        // Add all dates to set (automatically deduplicates)
        FOR EACH date IN templateDates:
            dateSet.add(date)

    // Convert to sorted array
    RETURN sort(dateSet)
```

**Example**:

```javascript
Input:
  startDate: "2025-01-01"
  endDate: "2025-01-31"
  templates: [
    { frequency: "bi-weekly", startDate: "2025-01-01" },
    { frequency: "monthly" }
  ]

Output:
  ["2025-01-01", "2025-01-15", "2025-01-29"]
  // 1st: monthly + bi-weekly
  // 15th: monthly + bi-weekly
  // 29th: bi-weekly
```

## Algorithm 2: Calculate Scenario

**Purpose**: Calculate all period snapshots for a single scenario

**Input**:
- Scenario definition
- Start date
- End date
- Initial balance

**Output**:
- Array of period snapshots

**Pseudocode**:

```
FUNCTION calculateScenario(scenario, startDate, endDate, initialBalance):
    rulesEngine = new RulesEngine(scenario)
    periodDates = generatePeriodDates(startDate, endDate)
    snapshots = []
    currentBalance = initialBalance

    FOR EACH date IN periodDates:
        snapshot = calculatePeriod(
            scenario,
            rulesEngine,
            date,
            currentBalance
        )

        snapshots.push(snapshot)
        currentBalance = snapshot.ending_balance

    RETURN snapshots
```

## Algorithm 3: Calculate Period

**Purpose**: Calculate a single period snapshot

**Input**:
- Scenario definition
- Rules engine (with CONFIG values)
- Date
- Starting balance

**Output**:
- Period snapshot

**Pseudocode**:

```
FUNCTION calculatePeriod(scenario, rulesEngine, date, startingBalance):
    // Step 1: Get active templates for this date
    activeTemplates = rulesEngine.applyConditionalRules(templates, date)

    // Step 2: Resolve dependencies
    resolvedTemplates = rulesEngine.resolveDependencies(activeTemplates, date)

    // Step 3: Calculate transactions
    transactions = []
    balance = startingBalance

    FOR EACH template IN resolvedTemplates:
        // Check for actual override
        actual = getActual(date, template.id)

        IF actual EXISTS:
            // Use actual value
            transaction = {
                template_id: template.id,
                name: template.name,
                type: template.type,
                amount: actual.amount,
                isActual: true,
                notes: actual.notes
            }
        ELSE:
            // Calculate projected value
            amount = rulesEngine.calculateAmount(template, date)

            transaction = {
                template_id: template.id,
                name: template.name,
                type: template.type,
                amount: amount,
                isActual: false,
                notes: ""
            }

        transactions.push(transaction)
        balance = balance + transaction.amount

    // Step 4: Create snapshot
    snapshot = {
        scenario_id: scenario.id,
        date: date,
        starting_balance: startingBalance,
        transactions: transactions,
        ending_balance: balance,
        metadata: { calculatedAt: now() }
    }

    RETURN snapshot
```

## Algorithm 4: Apply Conditional Rules

**Purpose**: Filter templates to only those that should occur on a given date

**Input**:
- Transaction templates (all templates)
- Date
- Scenario (for enabled_transactions check)

**Output**:
- Filtered array of active templates

**Pseudocode**:

```
FUNCTION applyConditionalRules(templates, date, scenario):
    activeTemplates = []

    FOR EACH template IN templates:
        // Check 1: Is enabled in scenario?
        IF NOT scenario.enabled_transactions.includes(template.id):
            CONTINUE

        // Check 2: Is active on this date?
        IF NOT isTransactionActive(template, date):
            CONTINUE

        // Check 3: Should occur on this date?
        IF NOT shouldTransactionOccur(template, date):
            CONTINUE

        activeTemplates.push(template)

    RETURN activeTemplates
```

## Algorithm 5: Is Transaction Active

**Purpose**: Check if a transaction is active on a given date (within start/end range)

**Input**:
- Transaction template
- Date

**Output**:
- Boolean (true if active)

**Pseudocode**:

```
FUNCTION isTransactionActive(template, date):
    currentDate = parseDate(date)

    // Check start date
    IF template.startDate EXISTS:
        startDate = parseDate(template.startDate)
        IF currentDate < startDate:
            RETURN false

    // Check end date
    IF template.endDate EXISTS:
        endDate = parseDate(template.endDate)
        IF currentDate > endDate:
            RETURN false

    // Check endsOn (can be formula)
    IF template.endsOn EXISTS:
        IF template.endsOn is formula:
            endDate = evaluateFormula(template.endsOn.formula, date)
        ELSE:
            endDate = parseDate(template.endsOn)

        IF currentDate >= endDate:
            RETURN false

    // Special case: one-time transactions
    IF template.frequency === "one-time":
        IF template.startDate EXISTS:
            RETURN formatDate(currentDate) === formatDate(template.startDate)
        RETURN false

    RETURN true
```

## Algorithm 6: Should Transaction Occur

**Purpose**: Check if a transaction should occur on a specific date based on frequency

**Input**:
- Transaction template
- Date

**Output**:
- Boolean (true if should occur)

**Pseudocode**:

```
FUNCTION shouldTransactionOccur(template, date):
    currentDate = parseDate(date)
    day = currentDate.getDate()

    SWITCH template.frequency:
        CASE "monthly":
            // Occurs on 1st and 15th
            RETURN day === 1 OR day === 15

        CASE "bi-weekly":
            IF NOT template.startDate:
                RETURN false

            startDate = parseDate(template.startDate)
            daysDiff = daysBetween(startDate, currentDate)

            RETURN daysDiff >= 0 AND daysDiff % 14 === 0

        CASE "weekly":
            IF NOT template.startDate:
                RETURN false

            startDate = parseDate(template.startDate)
            daysDiff = daysBetween(startDate, currentDate)

            RETURN daysDiff >= 0 AND daysDiff % 7 === 0

        CASE "quarterly":
            IF NOT template.startDate:
                RETURN false

            startDate = parseDate(template.startDate)
            monthsDiff = monthsBetween(startDate, currentDate)

            RETURN monthsDiff >= 0 AND
                   monthsDiff % 3 === 0 AND
                   currentDate.day === startDate.day

        CASE "one-time":
            RETURN true  // Already handled in isTransactionActive

        DEFAULT:
            RETURN false
```

## Algorithm 7: Calculate Amount

**Purpose**: Calculate transaction amount, evaluating formulas if needed

**Input**:
- Transaction template
- Date
- Context (additional variables)

**Output**:
- Calculated amount (number)

**Pseudocode**:

```
FUNCTION calculateAmount(template, date, context):
    // Evaluate value (handles both numbers and formulas)
    amount = evaluateValue(template.amount, context)

    // Expenses should be negative
    IF template.type === "expense" AND amount > 0:
        amount = -amount

    RETURN amount
```

## Algorithm 8: Evaluate Formula

**Purpose**: Evaluate a formula string that references CONFIG variables

**Input**:
- Formula string (e.g., "CONFIG.Monthly_Mortgage_Payment")
- Context (CONFIG values + additional variables)

**Output**:
- Evaluated result (number, string, or date)

**Pseudocode**:

```
FUNCTION evaluateFormula(formula, context):
    processedFormula = formula

    // Replace CONFIG.variable_name with actual values
    FOR EACH match IN findAll("CONFIG.\\w+", formula):
        variableName = extractVariableName(match)
        value = context.CONFIG[variableName]

        IF value is undefined:
            THROW "CONFIG variable not found: " + variableName

        // Wrap strings in quotes for evaluation
        IF value is string:
            processedFormula = replace(match, '"' + value + '"')
        ELSE:
            processedFormula = replace(match, value)

    // Replace context variables
    FOR EACH key IN context.keys:
        IF key !== "CONFIG":
            value = context[key]
            IF value is string:
                processedFormula = replace(key, '"' + value + '"')
            ELSE:
                processedFormula = replace(key, value)

    // Safely evaluate the formula
    TRY:
        result = evaluate(processedFormula)
        RETURN result
    CATCH error:
        THROW "Formula evaluation failed: " + formula + " - " + error
```

**Example**:

```javascript
Input:
  formula: "CONFIG.Monthly_Mortgage_Payment * 1.05"
  context: {
    CONFIG: { Monthly_Mortgage_Payment: 1500 }
  }

Processing:
  1. Replace "CONFIG.Monthly_Mortgage_Payment" with 1500
  2. Result: "1500 * 1.05"
  3. Evaluate: 1575

Output: 1575
```

## Algorithm 9: Actual Override Logic

**Purpose**: Check if an actual transaction exists and use it instead of projection

**Input**:
- Date
- Template ID
- Actuals index (Map of "date:template_id" -> ActualTransaction)

**Output**:
- ActualTransaction or null

**Pseudocode**:

```
FUNCTION getActual(date, templateId, actualsIndex):
    key = date + ":" + templateId

    IF actualsIndex.has(key):
        RETURN actualsIndex.get(key)

    RETURN null
```

**Usage**:

```
FOR EACH template IN activeTemplates:
    actual = getActual(date, template.id, actualsIndex)

    IF actual EXISTS:
        USE actual.amount
        MARK isActual = true
    ELSE:
        CALCULATE projected amount
        MARK isActual = false
```

## Algorithm 10: Resolve Dependencies

**Purpose**: Handle transaction dependencies (e.g., one transaction disabling another)

**Input**:
- Active templates for this period
- Date
- Context (previous transactions, state)

**Output**:
- Filtered templates after dependency resolution

**Pseudocode**:

```
FUNCTION resolveDependencies(templates, date, context):
    // Example: If house is sold, disable mortgage
    houseSaleOccurred = templates.some(t => t.id === "house_sale")

    IF houseSaleOccurred:
        templates = templates.filter(t => t.id !== "mortgage")

    // Additional dependency rules can be added here
    // - Progressive calculations based on previous periods
    // - Conditional triggers
    // - Cascading effects

    RETURN templates
```

**Advanced Dependencies (Future Enhancement)**:

```
FUNCTION advancedDependencies(templates, date, context):
    resolvedTemplates = []

    FOR EACH template IN templates:
        shouldInclude = true

        // Check if template has dependencies
        IF template.dependencies EXISTS:
            FOR EACH dependency IN template.dependencies:
                IF NOT isDependencyMet(dependency, context):
                    shouldInclude = false
                    BREAK

        IF shouldInclude:
            resolvedTemplates.push(template)

    RETURN resolvedTemplates
```

## Algorithm 11: Multiple Scenarios Calculation

**Purpose**: Calculate multiple scenarios in parallel for comparison

**Input**:
- Array of scenarios
- Start date
- End date
- Initial balance

**Output**:
- Map of scenario_id -> array of period snapshots

**Pseudocode**:

```
FUNCTION calculateMultipleScenarios(scenarios, startDate, endDate, initialBalance):
    results = new Map()

    FOR EACH scenario IN scenarios:
        snapshots = calculateScenario(
            scenario,
            startDate,
            endDate,
            initialBalance
        )

        results.set(scenario.id, snapshots)

    RETURN results
```

## Performance Optimizations

### 1. Actuals Index

Build a hash map for O(1) actual transaction lookup:

```javascript
// Instead of: actuals.find(a => a.date === date && a.template_id === id)
// Use: actualsIndex.get(`${date}:${template_id}`)

actualsIndex = new Map()
FOR EACH actual IN actuals:
    key = actual.date + ":" + actual.template_id
    actualsIndex.set(key, actual)
```

### 2. Date Caching

Cache generated period dates to avoid regeneration:

```javascript
dateCache = new Map()

FUNCTION getPeriodDates(startDate, endDate, templates):
    cacheKey = startDate + ":" + endDate + ":" + templateHash

    IF dateCache.has(cacheKey):
        RETURN dateCache.get(cacheKey)

    dates = generatePeriodDates(startDate, endDate, templates)
    dateCache.set(cacheKey, dates)

    RETURN dates
```

### 3. Template Filtering

Pre-filter templates by scenario before period loop:

```javascript
enabledTemplates = templates.filter(t =>
    scenario.enabled_transactions.includes(t.id)
)

// Then in period loop, only process enabledTemplates
```

## Error Handling

### Validation Before Calculation

```
FUNCTION validateInputs(templates, scenario, startDate, endDate):
    // Validate all templates
    FOR EACH template IN templates:
        TRY:
            template.validate()
        CATCH error:
            THROW "Invalid template " + template.id + ": " + error

    // Validate scenario
    TRY:
        scenario.validate()
    CATCH error:
        THROW "Invalid scenario: " + error

    // Validate dates
    IF parseDate(endDate) < parseDate(startDate):
        THROW "End date must be after start date"

    // Validate enabled transactions reference valid templates
    FOR EACH templateId IN scenario.enabled_transactions:
        IF NOT templates.find(t => t.id === templateId):
            THROW "Unknown template: " + templateId
```

### Formula Error Handling

```
TRY:
    result = evaluateFormula(formula, context)
CATCH error:
    // Log error with context
    console.error("Formula error:", {
        formula: formula,
        context: context,
        error: error.message
    })

    // Option 1: Use default value
    result = defaultValue

    // Option 2: Re-throw with context
    THROW "Formula evaluation failed: " + formula + " - " + error.message
```

## Testing Strategy

### Unit Tests

1. **Date Generation**: Test each frequency pattern
2. **Formula Evaluation**: Test CONFIG references, math operations
3. **Actual Override**: Test actual vs projected logic
4. **Transaction Filtering**: Test active/inactive, should occur logic
5. **Balance Calculation**: Test income/expense application

### Integration Tests

1. **Single Scenario**: Compare with known spreadsheet results
2. **Multiple Scenarios**: Verify scenarios are independent
3. **Actual Impact**: Verify actuals override projections correctly
4. **Date Ranges**: Test various date ranges and edge cases

### Validation Tests

1. **Data Integrity**: Verify balance = starting + sum(transactions)
2. **Transaction Consistency**: Verify no duplicate transactions per period
3. **Scenario Isolation**: Verify scenarios don't affect each other
4. **Actual Persistence**: Verify actuals persist across recalculations

## Complexity Analysis

- **Time Complexity**: O(S × P × T)
  - S = number of scenarios
  - P = number of periods (dates)
  - T = average transactions per period

- **Space Complexity**: O(S × P × T)
  - Storing all period snapshots with transactions

**Example**:
- 3 scenarios × 26 periods × 5 transactions = 390 transaction instances
- With optimizations, can handle 100+ scenarios efficiently
