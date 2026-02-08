import { RawTransaction } from '../types';
import { generateId } from '../utils/helpers';

/**
 * OFX Parser
 * Parses Open Financial Exchange (OFX) format transaction data
 */
export class OFXParser {
  /**
   * Parse OFX file content into raw transactions
   */
  parse(rawText: string): RawTransaction[] {
    const transactions: RawTransaction[] = [];

    // Extract transaction blocks: <STMTTRN>...</STMTTRN>
    const stmtTrnPattern = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    const matches = rawText.matchAll(stmtTrnPattern);

    for (const match of matches) {
      const block = match[1];

      try {
        const transaction: RawTransaction = {
          id: generateId(),
          date: this.parseDate(this.extractTag(block, 'DTPOSTED')),
          type: this.extractTag(block, 'TRNTYPE'),
          amount: parseFloat(this.extractTag(block, 'TRNAMT')),
          merchant: this.cleanMerchantName(this.extractTag(block, 'NAME')),
          memo: this.extractTag(block, 'MEMO'),
          fitid: this.extractTag(block, 'FITID')
        };

        // Skip invalid transactions
        if (!transaction.date || isNaN(transaction.amount)) {
          Logger.log(`Skipping invalid transaction: ${block.substring(0, 100)}`);
          continue;
        }

        transactions.push(transaction);
      } catch (error: any) {
        Logger.log(`Error parsing transaction block: ${error.message}`);
        Logger.log(block.substring(0, 200));
      }
    }

    return transactions;
  }

  /**
   * Extract value from OFX tag
   */
  private extractTag(block: string, tagName: string): string {
    const pattern = new RegExp(`<${tagName}>([^<]*?)(?=\\n|<)`, 'i');
    const match = block.match(pattern);
    return match ? match[1].trim() : '';
  }

  /**
   * Parse OFX date format to ISO date (YYYY-MM-DD)
   * OFX format: 20260204000000[-8:PST]
   * Output: 2026-02-04
   */
  private parseDate(ofxDate: string): string {
    if (!ofxDate || ofxDate.length < 8) {
      return '';
    }

    // Extract YYYYMMDD from the start
    const dateStr = ofxDate.substring(0, 8);
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    return `${year}-${month}-${day}`;
  }

  /**
   * Clean merchant name by removing common prefixes and suffixes
   */
  private cleanMerchantName(name: string): string {
    if (!name) return '';

    let cleaned = name;

    // Remove common prefixes
    cleaned = cleaned.replace(/^(POS Withdrawal|Ext Withdrawal|ATM Withdrawal|Check)\s+/i, '');

    // Remove card number suffixes (e.g., "Card #6315")
    cleaned = cleaned.replace(/\s+Card #\d+$/i, '');

    // Remove trailing location codes
    cleaned = cleaned.replace(/\s+(W[A-Z]{2,3}|[A-Z]{2}US)$/i, '');

    // Trim whitespace
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Extract account information from OFX
   */
  extractAccountInfo(rawText: string): {
    bankId: string;
    accountId: string;
    accountType: string;
    currency: string;
  } | null {
    const bankId = this.extractTag(rawText, 'BANKID');
    const accountId = this.extractTag(rawText, 'ACCTID');
    const accountType = this.extractTag(rawText, 'ACCTTYPE');
    const currency = this.extractTag(rawText, 'CURDEF');

    if (!accountId) return null;

    return {
      bankId,
      accountId,
      accountType,
      currency: currency || 'USD'
    };
  }

  /**
   * Extract balance information from OFX
   */
  extractBalance(rawText: string): {
    ledgerBalance: number;
    availableBalance: number;
    balanceDate: string;
  } | null {
    // Extract ledger balance block
    const ledgerPattern = /<LEDGERBAL>([\s\S]*?)<\/LEDGERBAL>/i;
    const ledgerMatch = rawText.match(ledgerPattern);

    if (!ledgerMatch) return null;

    const ledgerBlock = ledgerMatch[1];
    const balanceAmount = parseFloat(this.extractTag(ledgerBlock, 'BALAMT'));
    const balanceDate = this.parseDate(this.extractTag(ledgerBlock, 'DTASOF'));

    // Extract available balance if present
    const availPattern = /<AVAILBAL>([\s\S]*?)<\/AVAILBAL>/i;
    const availMatch = rawText.match(availPattern);
    let availableBalance = balanceAmount;

    if (availMatch) {
      const availBlock = availMatch[1];
      const availAmount = parseFloat(this.extractTag(availBlock, 'BALAMT'));
      if (!isNaN(availAmount)) {
        availableBalance = availAmount;
      }
    }

    return {
      ledgerBalance: balanceAmount,
      availableBalance,
      balanceDate
    };
  }

  /**
   * Extract date range from OFX
   */
  extractDateRange(rawText: string): {
    startDate: string;
    endDate: string;
  } | null {
    const startDate = this.parseDate(this.extractTag(rawText, 'DTSTART'));
    const endDate = this.parseDate(this.extractTag(rawText, 'DTEND'));

    if (!startDate || !endDate) return null;

    return { startDate, endDate };
  }

  /**
   * Validate OFX format
   */
  isValidOFX(rawText: string): boolean {
    // Check for OFX header
    if (!rawText.includes('OFXHEADER') && !rawText.includes('<OFX>')) {
      return false;
    }

    // Check for transaction list
    if (!rawText.includes('<BANKTRANLIST>') && !rawText.includes('<CCSTMTTRNRS>')) {
      return false;
    }

    return true;
  }

  /**
   * Get statistics about parsed data
   */
  getStatistics(transactions: RawTransaction[]): {
    totalTransactions: number;
    dateRange: { start: string; end: string } | null;
    transactionTypes: Record<string, number>;
    totalIncome: number;
    totalExpenses: number;
  } {
    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
        dateRange: null,
        transactionTypes: {},
        totalIncome: 0,
        totalExpenses: 0
      };
    }

    const dates = transactions.map(t => t.date).sort();
    const types: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
      // Count transaction types
      if (t.type) {
        types[t.type] = (types[t.type] || 0) + 1;
      }

      // Sum income/expenses
      if (t.amount > 0) {
        totalIncome += t.amount;
      } else {
        totalExpenses += Math.abs(t.amount);
      }
    });

    return {
      totalTransactions: transactions.length,
      dateRange: {
        start: dates[0],
        end: dates[dates.length - 1]
      },
      transactionTypes: types,
      totalIncome,
      totalExpenses
    };
  }
}
