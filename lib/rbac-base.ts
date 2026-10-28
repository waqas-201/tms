export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
  // Legacy aliases for non-breaking transitions
  HAKIM: "admin",
  EDITOR: "admin",
  CONTRIBUTOR: "admin",
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
  | "inventory:view"
  | "inventory:manage"
  | "units:manage"
  | "consultations:manage"
  | "consultations:view_own"
  | "inquiries:view"
  | "users:manage"
  | "stats:view"
  | "staff:manage"
  | "system:bootstrap";

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [
    "dashboard:view",
    "orders:list_all",
    "orders:manage",
    "orders:view_own",
    "products:create",
    "products:edit",
    "products:delete",
    "inventory:view",
    "inventory:manage",
    "units:manage",
    "consultations:manage",
    "consultations:view_own",
    "inquiries:view",
    "users:manage",
    "stats:view",
    "staff:manage",
    "system:bootstrap",
  ],
  admin: [
    "dashboard:view",
    "orders:list_all",
    "orders:manage",
    "orders:view_own",
    "products:create",
    "products:edit",
    "products:delete",
    "inventory:view",
    "inventory:manage",
    "units:manage",
    "consultations:manage",
    "consultations:view_own",
    "inquiries:view",
    "users:manage",
    "stats:view",
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
  const permissions = ROLE_PERMISSIONS[String(role).toLowerCase()] || [];
  return permissions.includes(permission);
}

/**
 * Helper to determine if a role belongs to staff (has access to back-office / admin dashboard)
 */
export function isStaffRole(role: Role | undefined | null): boolean {
  if (!role) return false;
  const normalized = String(role).toLowerCase();
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMIN;
}

/**
 * Helper to determine if a role is the sovereign Super Admin
 */
export function isSuperAdmin(role: Role | undefined | null): boolean {
  if (!role) return false;
  return String(role).toLowerCase() === ROLES.SUPER_ADMIN;
}
