# Extracting Data from Google Sheets

This guide provides step-by-step code examples for extracting data from the existing Google Sheets cashflow tracker and transforming it into the new data model format.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Google Sheets API Access](#setup-google-sheets-api-access)
3. [Extract CONFIG Tab](#extract-config-tab)
4. [Extract Transaction Templates](#extract-transaction-templates)
5. [Extract Period Snapshots](#extract-period-snapshots)
6. [Extract Actual Transactions](#extract-actual-transactions)
7. [Build Scenarios](#build-scenarios)
8. [Validation](#validation)
9. [Complete Migration Script](#complete-migration-script)

---

## Prerequisites

```bash
npm install googleapis @google-cloud/local-auth
```

Or for TypeScript:

```bash
npm install --save-dev @types/google.auth @types/google.sheets
```

---

## Setup Google Sheets API Access

### 1. Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create credentials (OAuth 2.0 Client ID)
5. Download credentials JSON

### 2. Initialize Client

```typescript
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

async function getGoogleSheetsClient() {
  const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  return google.sheets({ version: 'v4', auth });
}

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

---

## Extract CONFIG Tab

### Function: extractConfig

```typescript
interface Config {
  [key: string]: string | number;
}

async function extractConfig(sheets: any): Promise<Config> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'CONFIG!A:B',
  });

  const rows = response.data.values || [];
  const config: Config = {};

  for (const row of rows) {
    if (row.length >= 2) {
      const key = row[0];
      const value = row[1];

      // Convert to appropriate type
      if (!isNaN(Number(value))) {
        config[key] = Number(value);
      } else if (isDateString(value)) {
        config[key] = parseDate(value);
      } else {
        config[key] = value;
      }
    }
  }

  return config;
}

// Helper: Check if string looks like a date
function isDateString(str: string): boolean {
  return /^[A-Za-z]{3}-\d{1,2}$/.test(str); // e.g., "Mar-1"
}

// Helper: Parse date from Google Sheets format
function parseDate(dateStr: string): string {
  // Convert "Mar-1" to "2025-03-01"
  const [monthStr, dayStr] = dateStr.split('-');

  const monthMap: { [key: string]: number } = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };

  const month = monthMap[monthStr];
  const day = parseInt(dayStr, 10);
  const year = 2025; // You may need logic to determine the year

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
```

**Example Output:**

```json
{
  "Mortgage_Paid_Month": "2025-03-01",
  "Monthly_Mortgage_Payment": 1500
}
```

---

## Extract Transaction Templates

### Function: extractTransactionTemplates

```typescript
import { TransactionTemplate } from '../src/types';

async function extractTransactionTemplates(
  sheets: any,
  periodTabName: string = 'Start Dec-15'
): Promise<TransactionTemplate[]> {
  // Read template rows (rows 22 onwards)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${periodTabName}!A22:C50`, // Read more rows than needed
  });

  const rows = response.data.values || [];
  const templates: TransactionTemplate[] = [];
  const seenIds = new Set<string>();

  for (const row of rows) {
    if (row.length < 2) continue; // Need at least marker and name

    const marker = row[0];
    const name = row[1];
    const amount = row[2] ? parseFloat(row[2]) : null;

    if (!name || name.trim() === '') continue;

    // Generate template ID
    const id = name.toLowerCase().replace(/\s+/g, '_');

    // Avoid duplicates
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    // Determine type based on naming or amount
    const type = inferTransactionType(name, amount);

    // Build template
    const template: TransactionTemplate = {
      id,
      name,
      type,
      amount: amount !== null ? Math.abs(amount) : { formula: `CONFIG.${name}_Amount` },
      frequency: inferFrequency(name), // Heuristic
    };

    templates.push(template);
  }

  return templates;
}

// Helper: Infer transaction type
function inferTransactionType(name: string, amount: number | null): 'income' | 'expense' {
  const incomeName = ['payroll', 'plexis', 'salary', 'income', 'payment'];
  const nameLower = name.toLowerCase();

  for (const keyword of incomeName) {
    if (nameLower.includes(keyword)) return 'income';
  }

  return 'expense'; // Default to expense
}

// Helper: Infer frequency (basic heuristic)
function inferFrequency(name: string): TransactionTemplate['frequency'] {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('weekly') || nameLower.includes('plexis')) return 'bi-weekly';
  if (nameLower.includes('annual') || nameLower.includes('yearly')) return 'yearly';
  if (nameLower.includes('quarter')) return 'quarterly';

  return 'monthly'; // Default
}
```

**Example Output:**

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
    "amount": { "formula": "CONFIG.Monthly_Mortgage_Payment" },
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

---

## Extract Period Snapshots

### Function: extractPeriodSnapshot

```typescript
import { PeriodSnapshot, TransactionInstance } from '../src/types';

async function extractPeriodSnapshot(
  sheets: any,
  tabName: string,
  scenarioId: string
): Promise<PeriodSnapshot> {
  // Extract date from tab name
  const date = parseTabNameToDate(tabName);

  // Read starting balance
  const startResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!D1`,
  });
  const starting_balance = parseFloat(startResponse.data.values[0][0].replace(/[^0-9.-]/g, ''));

  // Read ending balance
  const endResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!D16`,
  });
  const ending_balance = parseFloat(endResponse.data.values[0][0].replace(/[^0-9.-]/g, ''));

  // Read transaction rows
  const txResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!A3:F9`,
  });

  const txRows = txResponse.data.values || [];
  const transactions: TransactionInstance[] = [];

  for (const row of txRows) {
    if (row.length < 3) continue; // Need marker, name, amount

    const marker = row[0];
    const name = row[1];
    const amount = row[2];
    const reference = row[5] || undefined;

    if (!name || !amount) continue;

    const template_id = name.toLowerCase().replace(/\s+/g, '_');
    const isActual = marker === 'x';

    transactions.push({
      template_id,
      amount: -Math.abs(parseFloat(amount)), // Expenses are negative
      isActual,
      reference,
    });
  }

  return {
    scenario_id: scenarioId,
    date,
    starting_balance,
    transactions,
    ending_balance,
  };
}

// Helper: Parse tab name to ISO date
function parseTabNameToDate(tabName: string): string {
  // "Start Dec-15" → "2024-12-15"
  // "Jan-1" → "2025-01-01"

  const match = tabName.match(/([A-Za-z]{3})-(\d{1,2})/);
  if (!match) throw new Error(`Invalid tab name: ${tabName}`);

  const [, monthStr, dayStr] = match;

  const monthMap: { [key: string]: number } = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };

  const month = monthMap[monthStr];
  const day = parseInt(dayStr, 10);

  // Determine year (heuristic: Dec is previous year, Jan onwards is current/next year)
  const year = monthStr === 'Dec' ? 2024 : 2025;

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
```

**Example Output:**

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
    }
  ],
  "ending_balance": 658.76
}
```

---

## Extract Actual Transactions

### Function: extractActualTransactions

```typescript
import { ActualTransaction } from '../src/types';

async function extractActualTransactions(
  sheets: any,
  tabNames: string[]
): Promise<ActualTransaction[]> {
  const actuals: ActualTransaction[] = [];
  let idCounter = 1;

  for (const tabName of tabNames) {
    const date = parseTabNameToDate(tabName);

    // Read transaction rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A3:F9`,
    });

    const rows = response.data.values || [];

    for (const row of rows) {
      if (row.length < 3) continue;

      const marker = row[0];
      const name = row[1];
      const amount = row[2];
      const reference = row[5] || undefined;

      // Only extract actuals (rows with "x" marker)
      if (marker !== 'x') continue;

      const template_id = name.toLowerCase().replace(/\s+/g, '_');

      actuals.push({
        id: `act_${String(idCounter).padStart(3, '0')}`,
        date,
        template_id,
        amount: -Math.abs(parseFloat(amount)),
        reference,
      });

      idCounter++;
    }
  }

  return actuals;
}
```

**Example Output:**

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

## Build Scenarios

### Function: buildScenario

```typescript
import { Scenario } from '../src/types';

async function buildScenario(
  sheets: any,
  scenarioId: string,
  scenarioName: string,
  config: Config,
  periodTabName: string = 'Start Dec-15'
): Promise<Scenario> {
  // Read template rows to determine enabled transactions
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${periodTabName}!A22:C50`,
  });

  const rows = response.data.values || [];
  const enabled_transactions: string[] = [];

  for (const row of rows) {
    if (row.length < 2) continue;

    const marker = row[0];
    const name = row[1];

    if (marker === 'x' && name) {
      const template_id = name.toLowerCase().replace(/\s+/g, '_');
      enabled_transactions.push(template_id);
    }
  }

  return {
    id: scenarioId,
    name: scenarioName,
    config,
    enabled_transactions,
  };
}
```

**Example Output:**

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

---

## Validation

### Function: validateExtraction

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateExtraction(
  config: Config,
  templates: TransactionTemplate[],
  scenarios: Scenario[],
  periodSnapshots: PeriodSnapshot[],
  actuals: ActualTransaction[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validate CONFIG
  if (Object.keys(config).length === 0) {
    errors.push('CONFIG is empty');
  }

  // 2. Validate templates
  const templateIds = new Set(templates.map(t => t.id));
  if (templateIds.size !== templates.length) {
    errors.push('Duplicate template IDs found');
  }

  // 3. Validate scenarios reference valid templates
  for (const scenario of scenarios) {
    for (const txId of scenario.enabled_transactions) {
      if (!templateIds.has(txId)) {
        errors.push(`Scenario "${scenario.id}" references unknown template "${txId}"`);
      }
    }
  }

  // 4. Validate period snapshots
  for (let i = 1; i < periodSnapshots.length; i++) {
    const prev = periodSnapshots[i - 1];
    const curr = periodSnapshots[i];

    // Check if ending balance of previous = starting balance of current
    if (Math.abs(prev.ending_balance - curr.starting_balance) > 0.01) {
      warnings.push(
        `Period ${curr.date}: starting balance (${curr.starting_balance}) doesn't match ` +
        `previous ending balance (${prev.ending_balance})`
      );
    }

    // Check if transactions sum correctly
    const txSum = curr.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const expectedEnding = curr.starting_balance + txSum;
    if (Math.abs(expectedEnding - curr.ending_balance) > 0.01) {
      warnings.push(
        `Period ${curr.date}: transactions don't sum correctly. ` +
        `Expected ${expectedEnding}, got ${curr.ending_balance}`
      );
    }
  }

  // 5. Validate actuals reference valid templates
  for (const actual of actuals) {
    if (!templateIds.has(actual.template_id)) {
      warnings.push(`Actual transaction "${actual.id}" references unknown template "${actual.template_id}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

## Complete Migration Script

### Full Script: migrateFromGoogleSheets.ts

```typescript
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import fs from 'fs/promises';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const OUTPUT_DIR = path.join(process.cwd(), 'data/migrated');

async function main() {
  console.log('Starting migration from Google Sheets...\n');

  // 1. Authenticate
  const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: path.join(process.cwd(), 'credentials.json'),
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // 2. Get all tab names
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const tabNames = spreadsheet.data.sheets
    ?.map(sheet => sheet.properties?.title)
    .filter(name => name && name !== 'CONFIG' && name !== 'Diagram') as string[];

  console.log(`Found ${tabNames.length} period tabs:`, tabNames);

  // 3. Extract CONFIG
  console.log('\nExtracting CONFIG...');
  const config = await extractConfig(sheets);
  console.log('✓ CONFIG extracted:', Object.keys(config).length, 'fields');

  // 4. Extract templates
  console.log('\nExtracting transaction templates...');
  const templates = await extractTransactionTemplates(sheets, tabNames[0]);
  console.log('✓ Templates extracted:', templates.length);

  // 5. Build scenario
  console.log('\nBuilding baseline scenario...');
  const scenario = await buildScenario(sheets, 'baseline', 'Baseline Scenario', config, tabNames[0]);
  console.log('✓ Scenario built with', scenario.enabled_transactions.length, 'enabled transactions');

  // 6. Extract period snapshots
  console.log('\nExtracting period snapshots...');
  const periodSnapshots: PeriodSnapshot[] = [];
  for (const tabName of tabNames) {
    const snapshot = await extractPeriodSnapshot(sheets, tabName, scenario.id);
    periodSnapshots.push(snapshot);
    console.log(`  ✓ ${tabName} → ${snapshot.date}`);
  }

  // 7. Extract actual transactions
  console.log('\nExtracting actual transactions...');
  const actuals = await extractActualTransactions(sheets, tabNames);
  console.log('✓ Actuals extracted:', actuals.length);

  // 8. Validate
  console.log('\nValidating extraction...');
  const validation = validateExtraction(config, templates, [scenario], periodSnapshots, actuals);

  if (validation.errors.length > 0) {
    console.error('\n❌ ERRORS:');
    validation.errors.forEach(err => console.error('  -', err));
  }

  if (validation.warnings.length > 0) {
    console.warn('\n⚠️  WARNINGS:');
    validation.warnings.forEach(warn => console.warn('  -', warn));
  }

  if (validation.isValid) {
    console.log('\n✓ Validation passed!');
  } else {
    console.error('\n❌ Validation failed. Fix errors before saving.');
    process.exit(1);
  }

  // 9. Save to files
  console.log('\nSaving to files...');
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'config.json'),
    JSON.stringify(config, null, 2)
  );

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'templates.json'),
    JSON.stringify(templates, null, 2)
  );

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'scenarios.json'),
    JSON.stringify([scenario], null, 2)
  );

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'period-snapshots.json'),
    JSON.stringify(periodSnapshots, null, 2)
  );

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'actual-transactions.json'),
    JSON.stringify(actuals, null, 2)
  );

  console.log('✓ Files saved to:', OUTPUT_DIR);
  console.log('\n✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Review the extracted data in', OUTPUT_DIR);
  console.log('2. Manually adjust any templates that need refinement');
  console.log('3. Create additional scenarios by copying scenarios.json');
  console.log('4. Run the calculator to verify results match Google Sheets');
}

// Run migration
main().catch(console.error);
```

### Usage

```bash
# 1. Set up credentials
# Download credentials.json from Google Cloud Console

# 2. Run migration
npx tsx scripts/migrateFromGoogleSheets.ts

# 3. Review output
ls data/migrated/
# config.json
# templates.json
# scenarios.json
# period-snapshots.json
# actual-transactions.json
```

---

## Post-Migration Steps

1. **Review Templates:** Check that frequency, type, and amounts are correct
2. **Verify Dates:** Ensure year inference is correct (Dec-15 vs Jan-1)
3. **Create Additional Scenarios:** Copy `scenarios.json` and modify config values
4. **Run Calculator:** Compare results with Google Sheets to validate
5. **Import Actuals:** Ensure all "x" marked transactions are captured

---

## Troubleshooting

### Common Issues

**Issue:** "Invalid tab name: XYZ"
- **Fix:** Update `parseTabNameToDate()` regex to match your tab naming

**Issue:** "Starting balance doesn't match previous ending balance"
- **Fix:** Check for manual adjustments in Google Sheets (e.g., "Liquidated" entries)

**Issue:** "Duplicate template IDs"
- **Fix:** Rename templates with similar names (e.g., "RV Park Rent" and "RV Park")

**Issue:** "Unknown template referenced"
- **Fix:** Ensure template section is consistent across all period tabs

---

## See Also

- [google-sheets-mapping.md](./google-sheets-mapping.md) - Visual mapping guide
- [field-mapping-table.md](./field-mapping-table.md) - Complete field reference
- [../README.md](../README.md) - Project overview and architecture
