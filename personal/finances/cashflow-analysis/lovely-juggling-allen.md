# Google Sheets to Data Model Mapping Documentation Plan

## Task Overview
Create visual documentation showing how the existing Google Sheets structure maps to the new cashflow analysis data model.

## Understanding Complete - Google Sheets Structure

From the screenshots captured, the Google Sheets has:

### 1. CONFIG Tab
- Row 1: `Mortgage_Paid_Month = "Mar-1"`
- Row 2: `Monthly_Mortgage_Payment = 1500`
- Simple key-value pairs stored in columns A and B

### 2. Period Tabs (e.g., "Start Dec-15")
**Top Section (Rows 1-16):**
- Row 1: "Starter Balance" in column B, amount in column D (e.g., $3,073.86)
- Rows 3-9: Individual transactions (actual transactions for this period)
  - Column A: "x" marker indicates ACTUAL (manually entered)
  - Column B: Transaction name
  - Column C: Amount
  - Column D: Running balance after transaction
  - Column F: Reference links (Amazon URLs for purchases)
- Row 11: Special entries like "Liquidated"
- Row 16: "Ending Balance" with final amount

**Bottom Section (Rows 22+): Transaction Templates**
- Row 22: "x X"
- Row 23: "x Plexis"
- Row 24: "x Mortgage"
- Row 25: "x RV Park" with amount 900 in column C
- "x" marker = transaction template is ENABLED
- No "x" = transaction template is DISABLED

### 3. Diagram Tab
- Line/bar chart showing balance over time
- X-axis: Period dates (Jan-1, Jan-15, Feb-1, etc.)
- Y-axis: Account balance
- Single line representing one scenario

### 4. Multiple Period Tabs
- Start Dec-15, Jan-1, Jan-15, Feb-1, Feb-15, Mar-1, Mar-15, Apr-1, Apr-15
- Each represents a snapshot in time

## Mapping to New Data Model

### Google Sheets → Data Model Mapping

1. **CONFIG Tab** → **Scenario.config**
   ```javascript
   // Google Sheets: CONFIG tab
   Row 1: Mortgage_Paid_Month = "Mar-1"
   Row 2: Monthly_Mortgage_Payment = 1500

   // New Model: Scenario.config
   {
     config: {
       Mortgage_Paid_Month: "2025-03-01",
       Monthly_Mortgage_Payment: 1500
     }
   }
   ```

2. **Transaction Templates (Bottom of Period Tab)** → **TransactionTemplate[]**
   ```javascript
   // Google Sheets: Rows 22-25
   x Plexis
   x Mortgage
   x RV Park    900

   // New Model: TransactionTemplate
   [
     {
       id: "plexis",
       name: "Plexis",
       type: "income",
       amount: 2200,
       frequency: "bi-weekly"
     },
     {
       id: "mortgage",
       name: "Mortgage",
       type: "expense",
       amount: { formula: "CONFIG.Monthly_Mortgage_Payment" },
       frequency: "monthly"
     },
     {
       id: "rv_park",
       name: "RV Park",
       type: "expense",
       amount: 900,
       frequency: "monthly"
     }
   ]
   ```

3. **"x" Marker on Template** → **Scenario.enabled_transactions**
   ```javascript
   // Google Sheets: "x" markers in column A (rows 22-25)
   x Plexis    ← ENABLED
   x Mortgage  ← ENABLED
   x RV Park   ← ENABLED
     Insurance ← DISABLED (no x)

   // New Model: Scenario
   {
     enabled_transactions: ["plexis", "mortgage", "rv_park"]
   }
   ```

4. **Period Tab (Rows 1-16)** → **PeriodSnapshot**
   ```javascript
   // Google Sheets: Start Dec-15 tab
   Row 1: Starter Balance = $3,073.86
   Row 3: x RV Park = $635.10
   Row 16: Ending Balance = $2,359.78

   // New Model: PeriodSnapshot
   {
     scenario_id: "baseline",
     date: "2024-12-15",
     starting_balance: 3073.86,
     transactions: [
       {
         template_id: "rv_park",
         amount: -635.10,
         isActual: true  // ← "x" marker present
       }
     ],
     ending_balance: 2359.78
   }
   ```

5. **"x" Marker on Transaction** → **ActualTransaction**
   ```javascript
   // Google Sheets: Period tab row with "x"
   x RV Park    $635.10    $2,438.76

   // New Model: ActualTransaction
   {
     date: "2024-12-15",
     template_id: "rv_park",
     amount: -635.10,
     isActual: true
   }
   ```

6. **No "x" Marker** → **Projected (Formula-Calculated)**
   ```javascript
   // Google Sheets: Period tab row WITHOUT "x"
     Mortgage   $1,500     $1,000

   // New Model: TransactionInstance (in PeriodSnapshot)
   {
     template_id: "mortgage",
     amount: -1500,  // Calculated from CONFIG + template
     isActual: false  // ← No "x" marker
   }
   ```

7. **All Period Tabs** → **Array of PeriodSnapshots**
   ```javascript
   // Google Sheets: Multiple tabs
   Start Dec-15 → Ending Balance: $2,359.78
   Jan-1       → Ending Balance: $5,500.00
   Jan-15      → Ending Balance: $8,200.00

   // New Model: Calculator output
   [
     { date: "2024-12-15", ending_balance: 2359.78 },
     { date: "2025-01-01", ending_balance: 5500.00 },
     { date: "2025-01-15", ending_balance: 8200.00 }
   ]
   ```

8. **Diagram Tab** → **Multi-Scenario Chart**
   ```javascript
   // Google Sheets: Single line chart
   One line = One scenario (only one CONFIG)

   // New Model: Multiple lines
   Baseline scenario: Blue line
   With Second Job: Green line
   House Sold: Orange line
   All overlaid on same chart
   ```

## Key Differences: Old vs New

### Old System (Google Sheets)
- **One scenario at a time**: Can only see one configuration
- **Manual comparison**: Change CONFIG values, note results, change back
- **Single chart line**: Diagram shows one scenario
- **Template flags in period tabs**: Each period tab has template enable/disable
- **Actuals mixed with projections**: Same rows, distinguished by "x" marker

### New System
- **Multiple scenarios in parallel**: Define many scenarios upfront
- **Automatic comparison**: All scenarios calculated simultaneously
- **Multi-line chart**: All scenarios overlaid with different colors
- **Templates separate from scenarios**: Scenarios reference templates
- **Actuals stored separately**: ActualTransaction objects override projections

## Documentation Deliverables

### 1. Annotated Screenshot Document (`docs/google-sheets-mapping.md`)

Create markdown document with annotated screenshots showing:

**Section 1: CONFIG Tab Mapping**
- Screenshot of CONFIG tab
- Arrows/annotations pointing to each element
- Side-by-side comparison with Scenario.config JSON

**Section 2: Transaction Templates Mapping**
- Screenshot of rows 22-25 (template section)
- Annotations showing:
  - "x" marker → enabled_transactions
  - Template name → TransactionTemplate.id
  - Amount column → TransactionTemplate.amount
- Side-by-side with TransactionTemplate JSON

**Section 3: Period Tab Structure**
- Screenshot of complete period tab
- Annotations showing:
  - "Starter Balance" → starting_balance
  - Transaction rows → transactions array
  - "x" marker → isActual: true
  - No "x" → isActual: false
  - "Ending Balance" → ending_balance
- Side-by-side with PeriodSnapshot JSON

**Section 4: Actual vs Projected**
- Two screenshots side-by-side:
  - Row with "x" marker
  - Row without "x" marker
- Annotations explaining the difference
- JSON examples showing ActualTransaction vs projected

**Section 5: Multi-Period View**
- Screenshot showing multiple period tabs at bottom
- Diagram showing how these map to array of PeriodSnapshots
- Timeline visualization

**Section 6: Diagram Chart**
- Screenshot of Diagram tab
- Annotation showing single line = single scenario
- Mock-up showing what multi-scenario chart will look like

### 2. Visual Comparison Diagram (`docs/architecture-comparison.svg` or `.png`)

Create side-by-side diagram:

**Left side: Google Sheets Architecture**
```
┌─────────────┐
│   CONFIG    │  ← One set of values
└─────────────┘
       ↓
┌─────────────┐
│  Templates  │  ← Enable/disable flags
│  x Plexis   │
│  x Mortgage │
└─────────────┘
       ↓
┌─────────────┐
│ Period Tabs │  ← Calculated with formulas
│  Dec-15     │
│  Jan-1      │
│  Jan-15     │
└─────────────┘
       ↓
┌─────────────┐
│   Diagram   │  ← Single line chart
└─────────────┘
```

**Right side: New System Architecture**
```
┌─────────────────┐
│ TransactionTmpl │  ← Master list (all possible)
│  - Payroll      │
│  - Plexis       │
│  - Mortgage     │
│  - RV Park      │
└─────────────────┘
         ↓
┌─────────────────────────────────┐
│         Scenarios               │  ← Multiple configs
│  ┌─────────────┐ ┌────────────┐│
│  │  Baseline   │ │ With Job   ││
│  │  Config A   │ │ Config B   ││
│  │  [Pay,Mort] │ │ [Pay,Plex] ││
│  └─────────────┘ └────────────┘│
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│    Calculator Engine            │  ← Processes all
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│    Period Snapshots             │  ← Results for each
│  Baseline: [Dec-15, Jan-1, ...] │
│  With Job: [Dec-15, Jan-1, ...] │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│    Multi-Scenario Chart         │  ← Multiple lines
│    ─── Baseline (blue)          │
│    ─── With Job (green)         │
└─────────────────────────────────┘
```

### 3. Mapping Table (`docs/field-mapping-table.md`)

Create comprehensive table:

| Google Sheets Element | Location | Maps To | New Model Field | Notes |
|----------------------|----------|---------|----------------|-------|
| CONFIG tab | Named range | Scenario | config | Key-value pairs |
| Mortgage_Paid_Month | CONFIG!A1:B1 | Scenario.config | Mortgage_Paid_Month | Date value |
| Monthly_Mortgage_Payment | CONFIG!A2:B2 | Scenario.config | Monthly_Mortgage_Payment | Number value |
| "x Plexis" row | Period tab row 23 | Scenario | enabled_transactions | "x" = enabled |
| Template name "Plexis" | Column B, row 23 | TransactionTemplate | name | Display name |
| Template amount 900 | Column C, row 25 | TransactionTemplate | amount | Fixed amount |
| "x" marker on transaction | Column A, rows 3-9 | ActualTransaction | isActual: true | Manual entry |
| No "x" marker | Column A, rows 3-9 | PeriodSnapshot.transactions | isActual: false | Formula-calculated |
| "Starter Balance" | Row 1, column D | PeriodSnapshot | starting_balance | Previous period's ending |
| "Ending Balance" | Row 16, column D | PeriodSnapshot | ending_balance | Final balance |
| Period tab name "Jan-1" | Tab name | PeriodSnapshot | date | ISO format "2025-01-01" |
| Diagram chart | Chart on Diagram tab | Multi-scenario chart | N/A | Currently single line |

### 4. Example Data Extraction (`docs/extract-from-sheets.md`)

Show step-by-step how to extract data from Google Sheets into new format:

```javascript
// Step 1: Extract CONFIG
const configSheet = spreadsheet.getSheetByName('CONFIG');
const config = {
  Mortgage_Paid_Month: configSheet.getRange('B1').getValue(),
  Monthly_Mortgage_Payment: configSheet.getRange('B2').getValue()
};

// Step 2: Extract transaction templates
const decSheet = spreadsheet.getSheetByName('Start Dec-15');
const templates = [];
const templateRows = decSheet.getRange('A22:C30').getValues();
templateRows.forEach(row => {
  if (row[0] === 'x') {  // Enabled template
    templates.push({
      id: row[1].toLowerCase().replace(/\s+/g, '_'),
      name: row[1],
      amount: row[2] || 0,
      // ... additional fields
    });
  }
});

// Step 3: Extract actual transactions
const actualTransactions = [];
const txRows = decSheet.getRange('A3:D9').getValues();
txRows.forEach((row, index) => {
  if (row[0] === 'x') {  // Actual transaction
    actualTransactions.push({
      date: '2024-12-15',  // From tab name
      template_id: row[1].toLowerCase().replace(/\s+/g, '_'),
      amount: -row[2],  // Expenses are negative
      isActual: true
    });
  }
});

// Step 4: Create scenario
const scenario = {
  id: 'baseline',
  name: 'Baseline (Current Plan)',
  enabled_transactions: templates.map(t => t.id),
  config: config
};
```

## Implementation Steps

### Step 1: Create Annotated Screenshots
1. Use image editing tool (Photoshop, GIMP, or online tool)
2. Add arrows, boxes, and labels to screenshots
3. Use consistent color coding:
   - Blue for data elements
   - Green for mapping arrows
   - Red for important notes
   - Yellow highlights for key areas

### Step 2: Write Markdown Documentation
1. Create `docs/google-sheets-mapping.md`
2. Embed annotated images
3. Include JSON examples side-by-side
4. Add explanatory text for each mapping

### Step 3: Create Architecture Diagrams
1. Use Mermaid.js or draw.io
2. Show old vs new architecture
3. Highlight key differences
4. Export as SVG for documentation

### Step 4: Create Mapping Table
1. List all Google Sheets elements
2. Document exact location (cell references, tab names)
3. Show corresponding data model field
4. Add migration notes

### Step 5: Write Extraction Guide
1. Document how to read Google Sheets data
2. Provide code examples
3. Show transformation logic
4. Include validation steps

## Files to Create

1. `/docs/google-sheets-mapping.md` - Main mapping documentation with annotated screenshots
2. `/docs/architecture-comparison.svg` - Visual diagram comparing old vs new
3. `/docs/field-mapping-table.md` - Comprehensive field-by-field table
4. `/docs/extract-from-sheets.md` - Code examples for data extraction
5. `/docs/images/` - Folder containing:
   - `config-tab-annotated.png`
   - `period-tab-structure-annotated.png`
   - `transaction-templates-annotated.png`
   - `actual-vs-projected-annotated.png`
   - `diagram-chart-annotated.png`
   - `multi-period-view-annotated.png`

## Key Insights for Documentation

### Critical Mappings to Emphasize

1. **The "x" Marker Has Two Meanings:**
   - In template section (rows 22+): "x" = template is enabled
   - In transaction section (rows 3-9): "x" = actual transaction (not projected)

2. **CONFIG is Per-Scenario:**
   - Old: One CONFIG tab affects all calculations
   - New: Each scenario has its own config values

3. **Templates vs Instances:**
   - Old: Templates mixed with actuals in same tab
   - New: Templates defined once, instances created per period

4. **Projection Morphs to Actual:**
   - Old: User manually adds "x" marker when transaction occurs
   - New: System checks ActualTransaction table, uses actual if exists

5. **Period Tabs = One Scenario:**
   - Old: Each period tab represents same scenario at different time
   - New: Each scenario generates its own set of period snapshots

## Verification

After creating documentation:

1. **Completeness Check:**
   - [ ] All Google Sheets tabs documented
   - [ ] All data elements mapped
   - [ ] All "x" marker meanings explained
   - [ ] CONFIG variables covered
   - [ ] Transaction templates mapped
   - [ ] Actual vs projected clearly distinguished

2. **Clarity Check:**
   - [ ] Non-technical user can understand mapping
   - [ ] Visual annotations are clear
   - [ ] Side-by-side comparisons effective
   - [ ] Examples use real data from sheets

3. **Accuracy Check:**
   - [ ] Cell references correct
   - [ ] Data model field names match implementation
   - [ ] JSON examples valid
   - [ ] Code examples executable

## Success Criteria

✅ User can look at Google Sheets and immediately identify:
- Where each data element comes from
- How it maps to new data model
- What "x" markers mean in each context
- How to extract existing data

✅ Documentation includes:
- Clear visual annotations
- Side-by-side comparisons
- Working code examples
- Comprehensive field table

✅ Documentation answers:
- "Where does CONFIG data go?"
- "How do I know which transactions are enabled?"
- "What's the difference between actual and projected?"
- "How do period tabs relate to period snapshots?"
- "Why do we need multiple scenarios?"
