export const ADMIN_PORTAL_ROLES = ['SuperAdmin', 'Admin', 'ComplianceOfficer', 'FinanceOfficer', 'CollectionAgent', 'SupportAgent', 'Auditor'];
export const FINANCER_MANAGE_ROLES = ['SuperAdmin', 'Admin'];
export const BILLING_MANAGE_ROLES = ['SuperAdmin', 'Admin', 'FinanceOfficer', 'CollectionAgent'];
export const CONFIG_MANAGE_ROLES = ['SuperAdmin', 'Admin'];
export const SUPPORT_MANAGE_ROLES = ['SuperAdmin', 'Admin', 'SupportAgent'];

export const roleAllowed = (userRoles = [], allowedRoles = []) =>
  allowedRoles.some((role) => userRoles.includes(role));
