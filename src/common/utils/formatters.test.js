import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatPhone,
  formatLoanNumber,
  formatCustomerNumber,
  formatFinancerNumber,
} from './formatters';

describe('formatters utility suite', () => {
  describe('formatCurrency', () => {
    it('formats numbers into Indian currency without fractional digits', () => {
      expect(formatCurrency(0)).toBe('₹0');
      expect(formatCurrency(1850000)).toMatch(/₹\s?18,50,000/);
      expect(formatCurrency(500)).toMatch(/₹\s?500/);
    });

    it('handles null, undefined, NaN, and negative numbers', () => {
      expect(formatCurrency(null)).toBe('₹0');
      expect(formatCurrency(undefined)).toBe('₹0');
      expect(formatCurrency(NaN)).toBe('₹0');
      expect(formatCurrency(-5000)).toMatch(/-₹\s?5,000|₹\s?-5,000/);
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates into DD-MMM-YYYY format', () => {
      expect(formatDate('2026-09-10T00:00:00Z')).toBe('10-Sep-2026');
      expect(formatDate(new Date('2026-01-05T00:00:00Z'))).toMatch(/05-Jan-2026|04-Jan-2026/);
    });

    it('handles empty strings and invalid dates', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('invalid-date-string')).toBe('invalid-date-string');
    });
  });

  describe('formatPhone', () => {
    it('formats 10-digit Indian numbers into +91 XXXXX XXXXX', () => {
      expect(formatPhone('9876543210')).toBe('+91 98765 43210');
      expect(formatPhone('98765-43210')).toBe('+91 98765 43210');
    });

    it('returns original input if empty or not 10 digits', () => {
      expect(formatPhone('')).toBe('');
      expect(formatPhone(null)).toBe('');
      expect(formatPhone('12345')).toBe('12345');
      expect(formatPhone('+91987654321012')).toBe('+91987654321012');
    });
  });

  describe('formatLoanNumber', () => {
    it('returns readable loan number if present', () => {
      expect(formatLoanNumber({ loanNumber: 'LN-2026-001' })).toBe('LN-2026-001');
      expect(formatLoanNumber({ loan_number: 'LN-2026-002' })).toBe('LN-2026-002');
      expect(formatLoanNumber({ displayId: 'LN-DISP' })).toBe('LN-DISP');
    });

    it('generates fallback LN-XXXXXXXX from ID or GUID', () => {
      expect(formatLoanNumber('1234-5678-90ab-cdef')).toBe('LN-12345678');
      expect(formatLoanNumber({ id: 'c2e8e1f6-a35d-4ea0-809a-17bd2a77518f' })).toBe('LN-C2E8E1F6');
    });

    it('returns em dash for empty or invalid input', () => {
      expect(formatLoanNumber(null)).toBe('—');
      expect(formatLoanNumber({})).toBe('—');
      expect(formatLoanNumber('')).toBe('—');
    });
  });

  describe('formatCustomerNumber', () => {
    it('returns readable customer number if present', () => {
      expect(formatCustomerNumber({ customerNumber: 'CUS-001' })).toBe('CUS-001');
      expect(formatCustomerNumber({ customer_number: 'CUS-002' })).toBe('CUS-002');
      expect(formatCustomerNumber({ customerDisplayId: 'CUS-DISP' })).toBe('CUS-DISP');
    });

    it('generates fallback CUS-XXXXXXXX from ID or GUID', () => {
      expect(formatCustomerNumber('cust-1234-5678')).toBe('CUS-CUST1234');
      expect(formatCustomerNumber({ id: '18a469d1-c79e-40d3-ba0d-7ab60cdc6288' })).toBe('CUS-18A469D1');
    });

    it('returns em dash for empty or invalid input', () => {
      expect(formatCustomerNumber(null)).toBe('—');
      expect(formatCustomerNumber({})).toBe('—');
      expect(formatCustomerNumber('')).toBe('—');
    });
  });

  describe('formatFinancerNumber', () => {
    it('returns readable financer number if present', () => {
      expect(formatFinancerNumber({ financerNumber: 'FIN-001' })).toBe('FIN-001');
      expect(formatFinancerNumber({ financer_number: 'FIN-002' })).toBe('FIN-002');
      expect(formatFinancerNumber({ financerDisplayId: 'FIN-DISP' })).toBe('FIN-DISP');
    });

    it('generates fallback FIN-XXXXXXXX from ID or GUID', () => {
      expect(formatFinancerNumber('fin-9999-aaaa')).toBe('FIN-FIN9999A');
      expect(formatFinancerNumber({ id: 'f1a2b3c4-d5e6-7890' })).toBe('FIN-F1A2B3C4');
    });

    it('returns em dash for empty or invalid input', () => {
      expect(formatFinancerNumber(null)).toBe('—');
      expect(formatFinancerNumber({})).toBe('—');
      expect(formatFinancerNumber('')).toBe('—');
    });
  });
});
