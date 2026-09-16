export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  CONTRIBUTOR: "contributor",
  USER: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES] | string;

export type Permission =
  | "dashboard:view"
  | "orders:list_all"
  | "orders:manage"
  | "orders:view_own"
  | "products:create"
  | "products:edit"
  | "products:delete"
  | "consultations:manage"
  | "consultations:view_own"
  | "inquiries:view"
  | "users:manage"
  | "stats:view";

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    "dashboard:view",
    "orders:list_all",
    "orders:manage",
    "orders:view_own",
    "products:create",
    "products:edit",
    "products:delete",
    "consultations:manage",
    "consultations:view_own",
    "inquiries:view",
    "users:manage",
    "stats:view",
  ],
  editor: [
    "dashboard:view",
    "orders:view_own",
    "products:create",
    "products:edit",
    "consultations:view_own",
  ],
  contributor: [
    "dashboard:view",
    "orders:view_own",
    "inquiries:view",
    "consultations:view_own",
  ],
  user: [
    "orders:view_own",
    "consultations:view_own",
  ],
};

/**
 * Check if a specific role has a given permission
 */
export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Helper to determine if a role belongs to staff (has access to back-office / admin dashboard)
 */
export function isStaffRole(role: Role | undefined | null): boolean {
  if (!role) return false;
  return role === ROLES.ADMIN || role === ROLES.EDITOR || role === ROLES.CONTRIBUTOR;
}
