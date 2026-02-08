// Core types
export type TransactionType = 'income' | 'expense';
export type Frequency = 'once' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
export type GroupingTag =
  | 'income'
  | 'housing'
  | 'utilities'
  | 'transportation'
  | 'food'
  | 'health'
  | 'entertainment'
  | 'shopping'
  | 'financial'
  | 'misc';

export type SubTag =
  | 'recurring'
  | 'subscription'
  | 'variable'
  | 'essential'
  | 'discretionary'
  | 'one-time'
  | 'auto-pay';

// Transaction data
export interface RawTransaction {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  merchant: string;
  amount: number; // Negative for expenses
  memo?: string;
  type?: string; // OFX transaction type
  fitid?: string; // Financial Institution Transaction ID
}

export interface ParsedTransaction extends RawTransaction {
  groupingTag: GroupingTag;
  subTags: SubTag[];
  templateId: string | null;
}

// Template
export interface TransactionTemplateData {
  id: string;
  name: string;
  type: TransactionType;
  amount: number | { formula: string; context?: Record<string, any> };
  frequency: Frequency;
  startDate?: string;
  endDate?: string;
  endsOn?: string | { formula: string; context?: Record<string, any> };
  isRecurring?: boolean;
  category?: GroupingTag;
  tags?: SubTag[];
  confidence?: number;
}

// Scenario
export interface ScenarioData {
  id: string;
  name: string;
  enabled_transactions: string[]; // Template IDs
  config: Record<string, any>;
  color?: string;
  description?: string;
  basedOn?: string;
}

// Period snapshot
export interface TransactionInstance {
  template_id: string;
  name: string;
  amount: number;
  isActual: boolean;
  note?: string;
  reference?: string;
  groupingTag?: GroupingTag;
  subTags?: SubTag[];
}

export interface PeriodSnapshotData {
  scenario_id: string;
  date: string;
  starting_balance: number;
  transactions: TransactionInstance[];
  ending_balance: number;
}

// Actual transaction
export interface ActualTransactionData {
  id: string;
  template_id: string;
  date: string;
  amount: number;
  note?: string;
  reference?: string;
}

// Pattern detection
export interface DetectedPattern {
  merchant: string;
  transactions: RawTransaction[];
  frequency: Frequency | null;
  typicalAmount: number;
  confidence: number;
}

// Tag assignment
export interface TagAssignment {
  grouping: GroupingTag;
  sub: SubTag[];
  confidence: number;
}

// Learning data
export interface MerchantLearningData {
  grouping: GroupingTag;
  sub: SubTag[];
  confidence: number;
  count: number;
}

// Validation
export const VALID_GROUPING_TAGS: GroupingTag[] = [
  'income',
  'housing',
  'utilities',
  'transportation',
  'food',
  'health',
  'entertainment',
  'shopping',
  'financial',
  'misc'
];

export const VALID_SUB_TAGS: SubTag[] = [
  'recurring',
  'subscription',
  'variable',
  'essential',
  'discretionary',
  'one-time',
  'auto-pay'
];

export const VALID_FREQUENCIES: Frequency[] = [
  'once',
  'weekly',
  'bi-weekly',
  'monthly',
  'quarterly',
  'yearly'
];
