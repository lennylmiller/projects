import { RawTransaction, DetectedPattern, Frequency, TransactionTemplateData } from '../types';
import { calculateMedian, calculateStdDev, calculateSimilarity, normalizeMerchant, generateId } from '../utils/helpers';

/**
 * Pattern Detector
 * Analyzes transactions to identify recurring patterns and generate templates
 */
export class PatternDetector {
  private readonly MIN_OCCURRENCES = 2; // Minimum transactions to consider as pattern
  private readonly SIMILARITY_THRESHOLD = 0.7; // Fuzzy matching threshold

  /**
   * Detect recurring patterns from transactions
   */
  detect(transactions: RawTransaction[]): DetectedPattern[] {
    // Group transactions by merchant
    const merchantGroups = this.groupByMerchant(transactions);

    // Analyze each group for patterns
    const patterns: DetectedPattern[] = [];

    for (const [merchant, txns] of Object.entries(merchantGroups)) {
      if (txns.length < this.MIN_OCCURRENCES) continue;

      // Sort by date
      txns.sort((a, b) => a.date.localeCompare(b.date));

      // Detect frequency
      const frequency = this.detectFrequency(txns);

      // Calculate typical amount
      const amounts = txns.map(t => Math.abs(t.amount));
      const typicalAmount = calculateMedian(amounts);

      // Calculate confidence score
      const confidence = this.calculateConfidence(txns, frequency);

      patterns.push({
        merchant,
        transactions: txns,
        frequency,
        typicalAmount,
        confidence
      });
    }

    // Sort by confidence (highest first)
    patterns.sort((a, b) => b.confidence - a.confidence);

    return patterns;
  }

  /**
   * Group transactions by merchant using fuzzy matching
   */
  private groupByMerchant(transactions: RawTransaction[]): Record<string, RawTransaction[]> {
    const groups: Record<string, RawTransaction[]> = {};

    for (const txn of transactions) {
      const normalized = normalizeMerchant(txn.merchant);

      // Find existing group with fuzzy match
      let groupKey: string | null = null;
      for (const existingKey of Object.keys(groups)) {
        if (this.fuzzyMatch(normalized, existingKey)) {
          groupKey = existingKey;
          break;
        }
      }

      if (!groupKey) {
        // Create new group
        groupKey = normalized;
        groups[groupKey] = [];
      }

      groups[groupKey].push(txn);
    }

    return groups;
  }

  /**
   * Check if two merchant names match using fuzzy matching
   */
  private fuzzyMatch(name1: string, name2: string): boolean {
    // Exact substring match
    if (name1.includes(name2) || name2.includes(name1)) {
      return true;
    }

    // Similarity threshold
    const similarity = calculateSimilarity(name1, name2);
    return similarity >= this.SIMILARITY_THRESHOLD;
  }

  /**
   * Detect transaction frequency from date intervals
   */
  private detectFrequency(txns: RawTransaction[]): Frequency | null {
    if (txns.length < 2) return 'once';

    // Calculate intervals between consecutive transactions (in days)
    const intervals: number[] = [];
    for (let i = 1; i < txns.length; i++) {
      const date1 = new Date(txns[i - 1].date);
      const date2 = new Date(txns[i].date);
      const daysDiff = Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
      intervals.push(daysDiff);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stdDev = calculateStdDev(intervals);

    // Classify frequency with variance tolerance
    // More lenient thresholds for real-world data
    if (this.isFrequency(avgInterval, 7, 2, stdDev, 4)) return 'weekly';
    if (this.isFrequency(avgInterval, 14, 3, stdDev, 5)) return 'bi-weekly';
    if (this.isFrequency(avgInterval, 30, 5, stdDev, 10)) return 'monthly';
    if (this.isFrequency(avgInterval, 90, 10, stdDev, 15)) return 'quarterly';
    if (this.isFrequency(avgInterval, 365, 30, stdDev, 30)) return 'yearly';

    // If only one occurrence, it's a one-time transaction
    if (txns.length === 1) return 'once';

    // If pattern doesn't fit standard frequencies, return null
    return null;
  }

  /**
   * Check if average interval matches expected frequency
   */
  private isFrequency(
    avgInterval: number,
    expectedDays: number,
    tolerance: number,
    stdDev: number,
    maxStdDev: number
  ): boolean {
    return Math.abs(avgInterval - expectedDays) <= tolerance && stdDev < maxStdDev;
  }

  /**
   * Calculate confidence score for a pattern (0-1)
   */
  private calculateConfidence(txns: RawTransaction[], frequency: Frequency | null): number {
    let score = 0;

    // Factor 1: Number of occurrences (up to 0.4)
    score += Math.min(txns.length / 10, 0.4);

    // Factor 2: Amount consistency (up to 0.3)
    const amounts = txns.map(t => Math.abs(t.amount));
    const median = calculateMedian(amounts);
    const variance = median > 0 ? calculateStdDev(amounts) / median : 1;
    score += Math.max(0, 0.3 - variance);

    // Factor 3: Frequency detection success (0.2)
    if (frequency && frequency !== 'once') {
      score += 0.2;
    }

    // Factor 4: Recent activity (up to 0.1)
    const lastTxnDate = new Date(txns[txns.length - 1].date);
    const daysSinceLastTxn = (new Date().getTime() - lastTxnDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastTxn < 45) {
      score += 0.1;
    } else if (daysSinceLastTxn < 90) {
      score += 0.05;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Convert detected pattern to transaction template
   */
  convertToTemplate(pattern: DetectedPattern): TransactionTemplateData {
    const isIncome = pattern.typicalAmount > 0;
    const frequency = pattern.frequency || 'once';

    // Get date range
    const sortedDates = pattern.transactions.map(t => t.date).sort();
    const startDate = sortedDates[0];
    const endDate = frequency === 'once' ? startDate : undefined;

    return {
      id: generateId(),
      name: pattern.merchant,
      type: isIncome ? 'income' : 'expense',
      amount: Math.abs(pattern.typicalAmount),
      frequency,
      startDate,
      endDate,
      isRecurring: frequency !== 'once',
      confidence: pattern.confidence
    };
  }

  /**
   * Convert multiple patterns to templates
   */
  convertAllToTemplates(patterns: DetectedPattern[]): TransactionTemplateData[] {
    return patterns.map(p => this.convertToTemplate(p));
  }

  /**
   * Find patterns that are likely the same (duplicates)
   */
  findDuplicatePatterns(patterns: DetectedPattern[]): Array<[number, number]> {
    const duplicates: Array<[number, number]> = [];

    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        if (this.arePatternsEquivalent(patterns[i], patterns[j])) {
          duplicates.push([i, j]);
        }
      }
    }

    return duplicates;
  }

  /**
   * Check if two patterns are equivalent
   */
  private arePatternsEquivalent(p1: DetectedPattern, p2: DetectedPattern): boolean {
    // Check merchant similarity
    if (!this.fuzzyMatch(p1.merchant, p2.merchant)) {
      return false;
    }

    // Check amount similarity (within 5%)
    const amountDiff = Math.abs(p1.typicalAmount - p2.typicalAmount);
    const avgAmount = (Math.abs(p1.typicalAmount) + Math.abs(p2.typicalAmount)) / 2;
    if (avgAmount > 0 && amountDiff / avgAmount > 0.05) {
      return false;
    }

    // Check frequency match
    if (p1.frequency !== p2.frequency) {
      return false;
    }

    return true;
  }

  /**
   * Get summary statistics for detected patterns
   */
  getPatternSummary(patterns: DetectedPattern[]): {
    totalPatterns: number;
    recurringPatterns: number;
    oneTimePatterns: number;
    highConfidencePatterns: number;
    byFrequency: Record<string, number>;
    averageConfidence: number;
  } {
    const byFrequency: Record<string, number> = {};
    let totalConfidence = 0;

    patterns.forEach(p => {
      const freq = p.frequency || 'unknown';
      byFrequency[freq] = (byFrequency[freq] || 0) + 1;
      totalConfidence += p.confidence;
    });

    const recurringPatterns = patterns.filter(p => p.frequency !== 'once').length;
    const oneTimePatterns = patterns.filter(p => p.frequency === 'once').length;
    const highConfidencePatterns = patterns.filter(p => p.confidence >= 0.7).length;

    return {
      totalPatterns: patterns.length,
      recurringPatterns,
      oneTimePatterns,
      highConfidencePatterns,
      byFrequency,
      averageConfidence: patterns.length > 0 ? totalConfidence / patterns.length : 0
    };
  }
}
