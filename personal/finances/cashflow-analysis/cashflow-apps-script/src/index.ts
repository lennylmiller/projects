/**
 * Cashflow Analysis - Google Apps Script Entry Point
 *
 * This is the main entry point for the Google Apps Script application.
 * All global functions exposed to Apps Script must be declared here.
 */

// Import core modules
import { CashflowCalculator } from './core/Calculator';
import { TransactionTemplate } from './models/TransactionTemplate';
import { Scenario } from './models/Scenario';

/**
 * Called when the spreadsheet is opened
 * Creates custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('Cashflow Analysis')
    .addItem('Initiate Analysis', 'initiateAnalysis')
    .addSeparator()
    .addItem('Review Templates & Tags', 'showReviewSidebar')
    .addItem('Create Scenario', 'createScenario')
    .addSeparator()
    .addItem('Run All Scenarios', 'runAllScenarios')
    .addItem('Generate Charts', 'generateCharts')
    .addSeparator()
    .addSubMenu(ui.createMenu('Advanced')
      .addItem('Clear Learning Data', 'clearLearningData')
      .addItem('Export to JSON', 'exportToJSON')
      .addItem('Import from JSON', 'importFromJSON'))
    .addToUi();
}

/**
 * Initiate Analysis - Parse raw data, detect patterns, populate sheets
 */
function initiateAnalysis() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Initiate Analysis', 'This feature will be available soon.', ui.ButtonSet.OK);
}

/**
 * Show review sidebar for templates and tags
 */
function showReviewSidebar() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Review Sidebar', 'This feature will be available soon.', ui.ButtonSet.OK);
}

/**
 * Create new scenario
 */
function createScenario() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Create Scenario', 'This feature will be available soon.', ui.ButtonSet.OK);
}

/**
 * Run all scenarios
 */
function runAllScenarios() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Run All Scenarios', 'This feature will be available soon.', ui.ButtonSet.OK);
}

/**
 * Generate comparison charts
 */
function generateCharts() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Generate Charts', 'This feature will be available soon.', ui.ButtonSet.OK);
}

/**
 * Clear tag learning data
 */
function clearLearningData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Clear Learning Data',
    'Are you sure you want to clear all tag learning data?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    PropertiesService.getScriptProperties().deleteProperty('tag_learning_data');
    ui.alert('Success', 'Learning data cleared.', ui.ButtonSet.OK);
  }
}

/**
 * Export scenarios and templates to JSON
 */
function exportToJSON() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Export to JSON', 'This feature will be available soon.', ui.ButtonSet.OK);
}

/**
 * Import scenarios and templates from JSON
 */
function importFromJSON() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Import from JSON', 'This feature will be available soon.', ui.ButtonSet.OK);
}

/**
 * Test function to verify TypeScript compilation
 */
function testCalculator() {
  const template = new TransactionTemplate({
    id: 'test_income',
    name: 'Test Payroll',
    type: 'income',
    amount: 5000,
    frequency: 'bi-weekly',
    category: 'income'
  });

  const scenario = new Scenario({
    id: 'test_scenario',
    name: 'Test Scenario',
    enabled_transactions: ['test_income'],
    config: {}
  });

  const calculator = new CashflowCalculator([template], []);
  const snapshots = calculator.calculateScenario(
    scenario,
    '2025-01-01',
    '2025-12-31',
    1000
  );

  Logger.log(`Calculated ${snapshots.length} periods`);
  Logger.log(`Final balance: ${snapshots[snapshots.length - 1]?.ending_balance || 0}`);

  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Test Complete',
    `Calculated ${snapshots.length} periods\nFinal balance: $${snapshots[snapshots.length - 1]?.ending_balance || 0}`,
    ui.ButtonSet.OK
  );
}

// Export global functions for Apps Script
// These must be declared in the global scope
declare global {
  function onOpen(): void;
  function initiateAnalysis(): void;
  function showReviewSidebar(): void;
  function createScenario(): void;
  function runAllScenarios(): void;
  function generateCharts(): void;
  function clearLearningData(): void;
  function exportToJSON(): void;
  function importFromJSON(): void;
  function testCalculator(): void;
}

// Make functions available globally
(global as any).onOpen = onOpen;
(global as any).initiateAnalysis = initiateAnalysis;
(global as any).showReviewSidebar = showReviewSidebar;
(global as any).createScenario = createScenario;
(global as any).runAllScenarios = runAllScenarios;
(global as any).generateCharts = generateCharts;
(global as any).clearLearningData = clearLearningData;
(global as any).exportToJSON = exportToJSON;
(global as any).importFromJSON = importFromJSON;
(global as any).testCalculator = testCalculator;
