import { Frequency } from '../types';
import { TransactionTemplate } from '../models/TransactionTemplate';

/**
 * Date utilities for period calculation
 */
export class DateUtils {
  /**
   * Parse date string to Date object
   * Uses noon UTC to avoid timezone issues with date-only strings
   */
  static parseDate(dateStr: string | Date): Date {
    if (dateStr instanceof Date) return dateStr;

    // For ISO date strings (YYYY-MM-DD), add time to avoid timezone issues
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Parse as noon UTC to avoid timezone boundary issues
      return new Date(dateStr + 'T12:00:00Z');
    }

    return new Date(dateStr);
  }

  /**
   * Format date as ISO string (YYYY-MM-DD)
   */
  static formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * Compare two dates
   * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
   */
  static compareDates(date1: string | Date, date2: string | Date): number {
    const d1 = this.parseDate(date1);
    const d2 = this.parseDate(date2);
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  }

  /**
   * Check if date is within range
   */
  static isDateInRange(
    date: string | Date,
    startDate: string | Date | null,
    endDate: string | Date | null
  ): boolean {
    const d = this.parseDate(date);
    const start = startDate ? this.parseDate(startDate) : null;
    const end = endDate ? this.parseDate(endDate) : null;

    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  }

  /**
   * Generate bi-weekly dates from start date
   */
  static generateBiWeeklyDates(startDate: string | Date, endDate: string | Date): string[] {
    const dates: string[] = [];
    let current = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setDate(current.getDate() + 14);
    }

    return dates;
  }

  /**
   * Generate monthly dates (1st and 15th of each month)
   */
  static generateMonthlyDates(
    startDate: string | Date,
    endDate: string | Date,
    daysOfMonth: number[] = [1, 15]
  ): string[] {
    const dates: string[] = [];
    let current = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    const start = this.parseDate(startDate);

    while (current <= end) {
      for (const day of daysOfMonth) {
        const date = new Date(current.getFullYear(), current.getMonth(), day);
        if (date >= start && date <= end) {
          dates.push(this.formatDate(date));
        }
      }
      current.setMonth(current.getMonth() + 1);
    }

    return dates.sort();
  }

  /**
   * Generate weekly dates
   */
  static generateWeeklyDates(startDate: string | Date, endDate: string | Date): string[] {
    const dates: string[] = [];
    let current = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setDate(current.getDate() + 7);
    }

    return dates;
  }

  /**
   * Generate quarterly dates
   */
  static generateQuarterlyDates(startDate: string | Date, endDate: string | Date): string[] {
    const dates: string[] = [];
    let current = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setMonth(current.getMonth() + 3);
    }

    return dates;
  }

  /**
   * Generate yearly dates
   */
  static generateYearlyDates(startDate: string | Date, endDate: string | Date): string[] {
    const dates: string[] = [];
    let current = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setFullYear(current.getFullYear() + 1);
    }

    return dates;
  }

  /**
   * Generate dates for a specific frequency
   */
  static generateDatesForFrequency(
    frequency: Frequency,
    startDate: string | Date,
    endDate: string | Date
  ): string[] {
    switch (frequency) {
      case 'weekly':
        return this.generateWeeklyDates(startDate, endDate);
      case 'bi-weekly':
        return this.generateBiWeeklyDates(startDate, endDate);
      case 'monthly':
        return this.generateMonthlyDates(startDate, endDate);
      case 'quarterly':
        return this.generateQuarterlyDates(startDate, endDate);
      case 'yearly':
        return this.generateYearlyDates(startDate, endDate);
      case 'once':
        return [this.formatDate(startDate)];
      default:
        return [];
    }
  }

  /**
   * Generate period dates (combination of transaction frequencies)
   */
  static generatePeriodDates(
    startDate: string | Date,
    endDate: string | Date,
    templates: TransactionTemplate[]
  ): string[] {
    const dateSet = new Set<string>();

    // Add dates based on all template frequencies
    templates.forEach(template => {
      const templateStart = template.startDate || this.formatDate(startDate);
      const templateEnd = template.endDate || this.formatDate(endDate);

      const templateDates = this.generateDatesForFrequency(
        template.frequency,
        templateStart,
        templateEnd
      );

      templateDates.forEach(date => dateSet.add(date));
    });

    // Convert to sorted array
    return Array.from(dateSet).sort();
  }

  /**
   * Add days to a date
   */
  static addDays(date: string | Date, days: number): string {
    const d = this.parseDate(date);
    d.setDate(d.getDate() + days);
    return this.formatDate(d);
  }

  /**
   * Add months to a date
   */
  static addMonths(date: string | Date, months: number): string {
    const d = this.parseDate(date);
    d.setMonth(d.getMonth() + months);
    return this.formatDate(d);
  }

  /**
   * Get days between two dates
   */
  static daysBetween(date1: string | Date, date2: string | Date): number {
    const d1 = this.parseDate(date1);
    const d2 = this.parseDate(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
