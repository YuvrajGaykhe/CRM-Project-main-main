export const ROLE_ACCESS = {
  "super-admin": ["leads", "dealers", "products", "tasks", "analytics", "notifications", "audit", "settings"],
  "admin": ["leads", "dealers", "products", "tasks", "analytics", "notifications", "audit", "settings"],
  "sales-manager": ["leads", "dealers", "tasks", "analytics", "notifications", "audit", "settings"],
  "dealer-manager": ["leads", "dealers", "tasks", "notifications", "settings"],
  "sales-executive": ["leads", "tasks", "notifications", "settings"],
  "support-staff": ["leads", "notifications", "settings"],
};
