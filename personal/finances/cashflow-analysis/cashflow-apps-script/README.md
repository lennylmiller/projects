# Cashflow Apps Script

TypeScript-based Google Apps Script cashflow analysis engine with real transaction import, pattern detection, and multi-scenario visualization.

## Features

- **Import Real Data**: Parse OFX/CSV bank transaction exports (939+ transactions)
- **Pattern Detection**: Automatically identify recurring transactions with confidence scoring
- **Intelligent Tagging**: Auto-categorize transactions with machine learning
- **Multi-Scenario Analysis**: Compare multiple financial scenarios side-by-side
- **Visual Comparison**: Interactive charts showing scenario outcomes

## Development

### Prerequisites

- Node.js 18+
- Google account with Apps Script access
- clasp CLI installed (`npm install -g @google/clasp`)

### Setup

```bash
# Install dependencies
npm install

# Authenticate with clasp
clasp login

# Create new Apps Script project
clasp create --type sheets --title "Cashflow Analysis"

# Build and push
npm run push
```

### Development Workflow

```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# Run tests
npm test
npm run test:watch

# Type checking
npm run type-check

# Deploy to Apps Script
npm run deploy
```

## Project Structure

```
src/
├── models/          # Data models (TypeScript classes)
├── core/            # Calculator and rules engine
├── import/          # OFX/CSV parsers
├── analysis/        # Pattern detection and tagging
├── commands/        # User-facing commands
├── sheets/          # Google Sheets I/O
├── ui/              # Sidebar UI controller
├── types/           # Shared type definitions
└── utils/           # Helper functions

tests/
├── unit/            # Jest unit tests
└── fixtures/        # Test data
```

## Usage

1. **Import Data**: Paste OFX/CSV data into "Raw Transactions" sheet
2. **Initiate Analysis**: Menu → Cashflow Analysis → Initiate Analysis
3. **Review Templates**: Review detected patterns in sidebar
4. **Create Scenarios**: Define what-if scenarios
5. **Run & Visualize**: Generate comparison charts

## Testing

Run Jest tests:

```bash
npm test
```

Target coverage: 80% on business logic

## Architecture

- **Language**: TypeScript 5.3+
- **Build**: esbuild (fast bundling)
- **Deployment**: clasp 2.4+
- **Runtime**: V8 (ES2020)
- **Testing**: Jest 29+

## Performance Targets

- Parse 939 transactions: < 2 seconds
- Pattern detection: < 3 seconds
- Calculate 3 scenarios: < 3 seconds
- Complete workflow: < 30 seconds

## License

MIT
