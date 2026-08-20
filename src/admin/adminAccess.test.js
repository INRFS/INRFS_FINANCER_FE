import { describe, expect, it } from 'vitest';

import { BILLING_MANAGE_ROLES, CONFIG_MANAGE_ROLES, FINANCER_MANAGE_ROLES, SUPPORT_MANAGE_ROLES, roleAllowed } from './adminAccess';

describe('admin UI role matrix', () => {
  it('keeps financer and configuration mutations admin-only', () => {
    expect(roleAllowed(['Admin'], FINANCER_MANAGE_ROLES)).toBe(true);
    expect(roleAllowed(['Auditor'], FINANCER_MANAGE_ROLES)).toBe(false);
    expect(roleAllowed(['FinanceOfficer'], CONFIG_MANAGE_ROLES)).toBe(false);
  });

  it('allows finance officers to manage billing but not platform configuration', () => {
    expect(roleAllowed(['FinanceOfficer'], BILLING_MANAGE_ROLES)).toBe(true);
    expect(roleAllowed(['FinanceOfficer'], CONFIG_MANAGE_ROLES)).toBe(false);
  });

  it('allows support operations only for support-capable roles', () => {
    expect(roleAllowed(['SupportAgent'], SUPPORT_MANAGE_ROLES)).toBe(true);
    expect(roleAllowed(['Auditor'], SUPPORT_MANAGE_ROLES)).toBe(false);
  });
});
