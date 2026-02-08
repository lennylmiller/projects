import { RawTransaction } from '../types';
import { generateId } from '../utils/helpers';

/**
 * CSV Parser
 * Parses CSV format transaction data exported from banks
 */
export class CSVParser {
  /**
   * Parse CSV file content into raw transactions
   */
  parse(rawText: string): RawTransaction[] {
    const transactions: RawTransaction[] = [];
    const lines = this.splitLines(rawText);

    if (lines.length < 4) {
      throw new Error('CSV file is too short - missing header or data');
    }

    // Find the header row (contains column names)
    let headerIndex = -1;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (lines[i].toLowerCase().includes('transaction number') ||
          lines[i].toLowerCase().includes('date')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      throw new Error('Could not find CSV header row');
    }

    // Parse header to get column indices
    const headers = this.parseCSVLine(lines[headerIndex]);
    const columnMap = this.buildColumnMap(headers);

    // Parse data rows
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const fields = this.parseCSVLine(line);
        const transaction = this.parseTransaction(fields, columnMap);

        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error: any) {
        Logger.log(`Error parsing CSV line ${i + 1}: ${error.message}`);
        Logger.log(line);
      }
    }

    return transactions;
  }

  /**
   * Split text into lines, handling different line endings
   */
  private splitLines(text: string): string[] {
    return text.split(/\r?\n/);
  }

  /**
   * Parse a single CSV line, handling quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = i < line.length - 1 ? line[i + 1] : '';

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }

    // Add last field
    fields.push(currentField);

    return fields.map(f => f.trim());
  }

  /**
   * Build a map of column names to indices
   */
  private buildColumnMap(headers: string[]): Record<string, number> {
    const map: Record<string, number> = {};

    headers.forEach((header, index) => {
      const normalized = header.toLowerCase().trim();

      // Map common variations to standard names
      if (normalized.includes('date')) {
        map['date'] = index;
      }
      if (normalized.includes('description')) {
        map['description'] = index;
      }
      if (normalized.includes('memo')) {
        map['memo'] = index;
      }
      if (normalized.includes('debit')) {
        map['debit'] = index;
      }
      if (normalized.includes('credit')) {
        map['credit'] = index;
      }
      if (normalized.includes('balance')) {
        map['balance'] = index;
      }
      if (normalized.includes('check')) {
        map['check'] = index;
      }
      if (normalized.includes('transaction') && normalized.includes('number')) {
        map['transaction_id'] = index;
      }
    });

    return map;
  }

  /**
   * Parse a transaction from CSV fields
   */
  private parseTransaction(
    fields: string[],
    columnMap: Record<string, number>
  ): RawTransaction | null {
    // Get date
    const dateStr = fields[columnMap['date']] || '';
    if (!dateStr) return null;

    const date = this.parseDate(dateStr);
    if (!date) return null;

    // Get merchant name from description
    const description = fields[columnMap['description']] || '';
    const merchant = this.cleanMerchantName(description);

    // Get amount (from debit or credit column)
    const debitStr = fields[columnMap['debit']] || '';
    const creditStr = fields[columnMap['credit']] || '';

    let amount = 0;
    if (debitStr) {
      // Debit is negative (expense)
      amount = -Math.abs(this.parseAmount(debitStr));
    } else if (creditStr) {
      // Credit is positive (income)
      amount = Math.abs(this.parseAmount(creditStr));
    } else {
      return null; // No amount
    }

    if (isNaN(amount)) return null;

    // Build transaction
    const transaction: RawTransaction = {
      id: generateId(),
      date,
      merchant,
      amount,
      memo: fields[columnMap['memo']] || undefined,
      fitid: fields[columnMap['transaction_id']] || undefined
    };

    return transaction;
  }

  /**
   * Parse date in MM/DD/YYYY format to ISO (YYYY-MM-DD)
   */
  private parseDate(dateStr: string): string {
    // Try MM/DD/YYYY format
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const month = match[1].padStart(2, '0');
      const day = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    }

    // Try YYYY-MM-DD format (already ISO)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    return '';
  }

  /**
   * Parse amount string to number
   */
  private parseAmount(amountStr: string): number {
    // Remove currency symbols, commas, and whitespace
    const cleaned = amountStr
      .replace(/[$,\s]/g, '')
      .replace(/[()]/g, ''); // Remove parentheses (sometimes used for negative)

    return parseFloat(cleaned);
  }

  /**
   * Clean merchant name by removing common prefixes
   */
  private cleanMerchantName(name: string): string {
    if (!name) return '';

    let cleaned = name;

    // Remove common prefixes
    cleaned = cleaned.replace(/^(POS Withdrawal|Ext Withdrawal|ATM Withdrawal|Over Counter Check)\s+/i, '');

    // Remove card number suffixes
    cleaned = cleaned.replace(/\s+Card #\d+$/i, '');

    // Remove trailing location codes
    cleaned = cleaned.replace(/\s+(W[A-Z]{2,3}|[A-Z]{2}US)$/i, '');

    // Trim whitespace
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Extract account information from CSV header
   */
  extractAccountInfo(rawText: string): {
    accountName: string;
    accountNumber: string;
    dateRange: string;
  } | null {
    const lines = this.splitLines(rawText);
    if (lines.length < 3) return null;

    const accountName = this.extractHeaderValue(lines[0], 'Account Name');
    const accountNumber = this.extractHeaderValue(lines[1], 'Account Number');
    const dateRange = this.extractHeaderValue(lines[2], 'Date Range');

    return {
      accountName: accountName || '',
      accountNumber: accountNumber || '',
      dateRange: dateRange || ''
    };
  }

  /**
   * Extract value from header line (e.g., "Account Name : Regular Checking")
   */
  private extractHeaderValue(line: string, key: string): string {
    const parts = line.split(':');
    if (parts.length !== 2) return '';

    const lineKey = parts[0].trim();
    if (lineKey.toLowerCase().includes(key.toLowerCase())) {
      return parts[1].trim();
    }

    return '';
  }

  /**
   * Validate CSV format
   */
  isValidCSV(rawText: string): boolean {
    const lines = this.splitLines(rawText);

    // Check for minimum length
    if (lines.length < 4) return false;

    // Check for date column in header
    const hasDateHeader = lines.some(line =>
      line.toLowerCase().includes('date') &&
      line.toLowerCase().includes('description')
    );

    return hasDateHeader;
  }

  /**
   * Auto-detect CSV delimiter
   */
  detectDelimiter(rawText: string): string {
    const lines = this.splitLines(rawText);
    const sampleLine = lines.find(l => l.length > 10) || '';

    const commaCount = (sampleLine.match(/,/g) || []).length;
    const tabCount = (sampleLine.match(/\t/g) || []).length;
    const semicolonCount = (sampleLine.match(/;/g) || []).length;

    if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
    if (semicolonCount > commaCount) return ';';
    return ',';
  }

  /**
   * Get statistics about parsed data
   */
  getStatistics(transactions: RawTransaction[]): {
    totalTransactions: number;
    dateRange: { start: string; end: string } | null;
    totalIncome: number;
    totalExpenses: number;
  } {
    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
        dateRange: null,
        totalIncome: 0,
        totalExpenses: 0
      };
    }

    const dates = transactions.map(t => t.date).sort();
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
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
      totalIncome,
      totalExpenses
    };
  }
}
