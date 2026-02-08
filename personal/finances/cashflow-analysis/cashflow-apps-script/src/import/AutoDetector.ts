import { RawTransaction } from '../types';
import { OFXParser } from './OFXParser';
import { CSVParser } from './CSVParser';

/**
 * Format types supported
 */
export type TransactionFormat = 'OFX' | 'QFX' | 'QBO' | 'CSV' | 'UNKNOWN';

/**
 * Auto Detector
 * Automatically detects transaction file format and uses appropriate parser
 */
export class AutoDetector {
  private ofxParser: OFXParser;
  private csvParser: CSVParser;

  constructor() {
    this.ofxParser = new OFXParser();
    this.csvParser = new CSVParser();
  }

  /**
   * Detect the format of transaction data
   */
  detectFormat(rawText: string): TransactionFormat {
    // Check for OFX/QFX/QBO (all use same structure)
    if (this.ofxParser.isValidOFX(rawText)) {
      if (rawText.includes('INTU.BID')) {
        return 'QBO'; // QuickBooks
      }
      if (rawText.includes('QBPOS') || rawText.includes('QFX')) {
        return 'QFX'; // Quicken
      }
      return 'OFX'; // Generic OFX
    }

    // Check for CSV
    if (this.csvParser.isValidCSV(rawText)) {
      return 'CSV';
    }

    return 'UNKNOWN';
  }

  /**
   * Parse transaction data using auto-detected format
   */
  parse(rawText: string): {
    format: TransactionFormat;
    transactions: RawTransaction[];
    metadata?: any;
  } {
    const format = this.detectFormat(rawText);

    switch (format) {
      case 'OFX':
      case 'QFX':
      case 'QBO':
        return this.parseOFX(rawText, format);

      case 'CSV':
        return this.parseCSV(rawText);

      default:
        throw new Error('Unknown or unsupported transaction format');
    }
  }

  /**
   * Parse OFX format
   */
  private parseOFX(rawText: string, format: TransactionFormat): {
    format: TransactionFormat;
    transactions: RawTransaction[];
    metadata: any;
  } {
    const transactions = this.ofxParser.parse(rawText);
    const accountInfo = this.ofxParser.extractAccountInfo(rawText);
    const balance = this.ofxParser.extractBalance(rawText);
    const dateRange = this.ofxParser.extractDateRange(rawText);
    const statistics = this.ofxParser.getStatistics(transactions);

    return {
      format,
      transactions,
      metadata: {
        accountInfo,
        balance,
        dateRange,
        statistics
      }
    };
  }

  /**
   * Parse CSV format
   */
  private parseCSV(rawText: string): {
    format: TransactionFormat;
    transactions: RawTransaction[];
    metadata: any;
  } {
    const transactions = this.csvParser.parse(rawText);
    const accountInfo = this.csvParser.extractAccountInfo(rawText);
    const statistics = this.csvParser.getStatistics(transactions);

    return {
      format: 'CSV',
      transactions,
      metadata: {
        accountInfo,
        statistics
      }
    };
  }

  /**
   * Get format description
   */
  getFormatDescription(format: TransactionFormat): string {
    switch (format) {
      case 'OFX':
        return 'Open Financial Exchange (OFX) - Standard banking format';
      case 'QFX':
        return 'Quicken Financial Exchange (QFX) - Intuit Quicken format';
      case 'QBO':
        return 'QuickBooks Online (QBO) - Intuit QuickBooks format';
      case 'CSV':
        return 'Comma-Separated Values (CSV) - Bank export format';
      default:
        return 'Unknown format';
    }
  }

  /**
   * Validate that data can be parsed
   */
  canParse(rawText: string): boolean {
    const format = this.detectFormat(rawText);
    return format !== 'UNKNOWN';
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): TransactionFormat[] {
    return ['OFX', 'QFX', 'QBO', 'CSV'];
  }
}
