import { GroupingTag, SubTag, TagAssignment, MerchantLearningData } from '../types';
import { normalizeMerchant } from '../utils/helpers';

/**
 * Tagging rule for merchant matching
 */
interface TagRule {
  grouping: GroupingTag;
  sub: SubTag[];
}

/**
 * Tagging Engine
 * Auto-assigns tags to transactions and learns from user corrections
 */
export class TaggingEngine {
  // Rule-based merchant patterns
  private static readonly MERCHANT_RULES: Record<string, TagRule> = {
    // Income
    'JACK HENRY': { grouping: 'income', sub: ['recurring', 'essential'] },
    'PAYROLL': { grouping: 'income', sub: ['recurring', 'essential'] },
    'VACP TREAS': { grouping: 'income', sub: ['recurring', 'essential'] },
    'AMERICAN SECURIT': { grouping: 'income', sub: ['one-time'] },
    'DEPOSIT': { grouping: 'income', sub: [] },

    // Housing
    'ASHLAND TALENT': { grouping: 'housing', sub: ['recurring', 'essential', 'auto-pay'] },
    'RENT': { grouping: 'housing', sub: ['recurring', 'essential'] },
    'MORTGAGE': { grouping: 'housing', sub: ['recurring', 'essential'] },

    // Utilities
    'VZWRLSS': { grouping: 'utilities', sub: ['recurring', 'essential'] },
    'VERIZON': { grouping: 'utilities', sub: ['recurring', 'essential'] },
    'PACIFIC POWER': { grouping: 'utilities', sub: ['recurring', 'essential'] },
    'RECOLOGY': { grouping: 'utilities', sub: ['recurring', 'essential'] },
    'COMCAST': { grouping: 'utilities', sub: ['recurring'] },
    'ATT': { grouping: 'utilities', sub: ['recurring'] },

    // Transportation
    'CHEVRON': { grouping: 'transportation', sub: ['variable'] },
    '76': { grouping: 'transportation', sub: ['variable'] },
    'SHELL': { grouping: 'transportation', sub: ['variable'] },
    'ARCO': { grouping: 'transportation', sub: ['variable'] },
    'GAS': { grouping: 'transportation', sub: ['variable'] },

    // Food
    'DUTCH BROS': { grouping: 'food', sub: ['discretionary'] },
    'STARBUCKS': { grouping: 'food', sub: ['discretionary'] },
    'MCDONALD': { grouping: 'food', sub: ['discretionary'] },
    'DOORDASH': { grouping: 'food', sub: ['discretionary'] },
    'DAIRY QUEEN': { grouping: 'food', sub: ['discretionary'] },
    'CROWN MARKET': { grouping: 'food', sub: [] },
    'SAFEWAY': { grouping: 'food', sub: ['essential'] },
    'WALMART': { grouping: 'food', sub: [] },

    // Entertainment
    'PRIME VIDEO': { grouping: 'entertainment', sub: ['subscription', 'recurring'] },
    'NETFLIX': { grouping: 'entertainment', sub: ['subscription', 'recurring'] },
    'SPOTIFY': { grouping: 'entertainment', sub: ['subscription', 'recurring'] },
    'HULU': { grouping: 'entertainment', sub: ['subscription', 'recurring'] },

    // Shopping
    'AMAZON': { grouping: 'shopping', sub: ['discretionary'] },
    'TARGET': { grouping: 'shopping', sub: [] },
    'COSTCO': { grouping: 'shopping', sub: [] },

    // Health
    'PHARMACY': { grouping: 'health', sub: ['essential'] },
    'CVS': { grouping: 'health', sub: [] },
    'WALGREENS': { grouping: 'health', sub: [] },
    'DOCTOR': { grouping: 'health', sub: ['essential'] },

    // Financial
    'ATM': { grouping: 'financial', sub: [] },
    'PAYPAL': { grouping: 'financial', sub: [] },
    'VENMO': { grouping: 'financial', sub: [] },
    'ZELLE': { grouping: 'financial', sub: [] },

    // Services
    'CLAUDE.AI': { grouping: 'misc', sub: ['subscription', 'recurring'] },
    'GOOGLE': { grouping: 'misc', sub: ['subscription', 'recurring'] },
    'MICROSOFT': { grouping: 'misc', sub: ['subscription', 'recurring'] }
  };

  /**
   * Assign tags to a merchant
   */
  assignTags(merchant: string, amount?: number): TagAssignment {
    const normalized = normalizeMerchant(merchant);

    // Try rule-based matching first
    for (const [pattern, tags] of Object.entries(TaggingEngine.MERCHANT_RULES)) {
      if (normalized.includes(pattern)) {
        return { ...tags, confidence: 0.9 };
      }
    }

    // Try learned patterns
    const learned = this.checkLearnedPatterns(normalized);
    if (learned) return learned;

    // Try heuristic matching
    const heuristic = this.heuristicMatching(normalized, amount);
    if (heuristic) return heuristic;

    // Default: misc with low confidence
    return {
      grouping: 'misc',
      sub: [],
      confidence: 0.2
    };
  }

  /**
   * Check learned patterns from PropertiesService
   */
  private checkLearnedPatterns(merchant: string): TagAssignment | null {
    const learningData = this.getLearningData();

    for (const [pattern, data] of Object.entries(learningData)) {
      if (merchant.includes(pattern) && data.confidence > 0.6) {
        return {
          grouping: data.grouping,
          sub: data.sub,
          confidence: data.confidence
        };
      }
    }

    return null;
  }

  /**
   * Heuristic-based matching using keywords
   */
  private heuristicMatching(merchant: string, amount?: number): TagAssignment | null {
    // Income detection (positive amounts)
    if (amount && amount > 0) {
      return {
        grouping: 'income',
        sub: [],
        confidence: 0.6
      };
    }

    // Food keywords
    if (this.matchesAny(merchant, ['RESTAURANT', 'CAFE', 'COFFEE', 'BURGER', 'PIZZA', 'DELI', 'BAKERY'])) {
      return {
        grouping: 'food',
        sub: ['discretionary'],
        confidence: 0.7
      };
    }

    // Gas stations
    if (this.matchesAny(merchant, ['FUEL', 'PETROL', 'GAS STATION'])) {
      return {
        grouping: 'transportation',
        sub: ['variable'],
        confidence: 0.7
      };
    }

    // Subscriptions
    if (this.matchesAny(merchant, ['SUBSCRIPTION', 'MONTHLY', '.COM'])) {
      return {
        grouping: 'misc',
        sub: ['subscription'],
        confidence: 0.5
      };
    }

    return null;
  }

  /**
   * Check if merchant matches any of the keywords
   */
  private matchesAny(merchant: string, keywords: string[]): boolean {
    return keywords.some(kw => merchant.includes(kw));
  }

  /**
   * Get learning data from PropertiesService
   */
  private getLearningData(): Record<string, MerchantLearningData> {
    try {
      const stored = PropertiesService.getScriptProperties().getProperty('tag_learning_data');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      Logger.log('Error reading learning data: ' + error);
      return {};
    }
  }

  /**
   * Save learning data to PropertiesService
   */
  private saveLearningData(data: Record<string, MerchantLearningData>): void {
    try {
      PropertiesService.getScriptProperties().setProperty(
        'tag_learning_data',
        JSON.stringify(data)
      );
    } catch (error) {
      Logger.log('Error saving learning data: ' + error);
    }
  }

  /**
   * Learn from user correction
   */
  learnFromCorrection(merchant: string, grouping: GroupingTag, subTags: SubTag[]): void {
    const normalized = normalizeMerchant(merchant);
    const learningData = this.getLearningData();

    if (!learningData[normalized]) {
      learningData[normalized] = {
        grouping,
        sub: subTags,
        confidence: 0.5,
        count: 1
      };
    } else {
      // Update existing learning data
      learningData[normalized].grouping = grouping;
      learningData[normalized].sub = subTags;
      learningData[normalized].count++;
      learningData[normalized].confidence = Math.min(
        0.5 + (learningData[normalized].count * 0.1),
        0.95
      );
    }

    this.saveLearningData(learningData);
    Logger.log(`Learned: ${normalized} → ${grouping} (confidence: ${learningData[normalized].confidence})`);
  }

  /**
   * Bulk learn from corrections
   */
  bulkLearn(corrections: Array<{ merchant: string; grouping: GroupingTag; subTags: SubTag[] }>): void {
    corrections.forEach(c => {
      this.learnFromCorrection(c.merchant, c.grouping, c.subTags);
    });
  }

  /**
   * Clear all learning data
   */
  clearLearningData(): void {
    PropertiesService.getScriptProperties().deleteProperty('tag_learning_data');
    Logger.log('Learning data cleared');
  }

  /**
   * Export learning data
   */
  exportLearningData(): Record<string, MerchantLearningData> {
    return this.getLearningData();
  }

  /**
   * Import learning data
   */
  importLearningData(data: Record<string, MerchantLearningData>): void {
    this.saveLearningData(data);
    Logger.log(`Imported ${Object.keys(data).length} learned patterns`);
  }

  /**
   * Get learning statistics
   */
  getLearningStats(): {
    totalPatterns: number;
    byGroupingTag: Record<GroupingTag, number>;
    averageConfidence: number;
    highConfidencePatterns: number;
  } {
    const learningData = this.getLearningData();
    const patterns = Object.values(learningData);

    const byGroupingTag: Record<GroupingTag, number> = {
      income: 0,
      housing: 0,
      utilities: 0,
      transportation: 0,
      food: 0,
      health: 0,
      entertainment: 0,
      shopping: 0,
      financial: 0,
      misc: 0
    };

    let totalConfidence = 0;
    let highConfidenceCount = 0;

    patterns.forEach(p => {
      byGroupingTag[p.grouping]++;
      totalConfidence += p.confidence;
      if (p.confidence >= 0.8) {
        highConfidenceCount++;
      }
    });

    return {
      totalPatterns: patterns.length,
      byGroupingTag,
      averageConfidence: patterns.length > 0 ? totalConfidence / patterns.length : 0,
      highConfidencePatterns: highConfidenceCount
    };
  }

  /**
   * Suggest tags for review (low confidence)
   */
  suggestForReview(
    merchants: string[],
    threshold: number = 0.6
  ): Array<{ merchant: string; assignment: TagAssignment }> {
    const suggestions: Array<{ merchant: string; assignment: TagAssignment }> = [];

    merchants.forEach(merchant => {
      const assignment = this.assignTags(merchant);
      if (assignment.confidence < threshold) {
        suggestions.push({ merchant, assignment });
      }
    });

    return suggestions;
  }
}
