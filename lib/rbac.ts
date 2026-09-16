import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { Role, Permission, ROLES, hasPermission } from "./rbac-base";

export * from "./rbac-base";

/**
 * Server-side API Route Guard: checks session and validates that the user possesses one of the allowed roles.
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: Role[]
): Promise<
  | { session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>; errorResponse: null }
  | { session: null; errorResponse: NextResponse }
> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return {
        session: null,
        errorResponse: NextResponse.json(
          { success: false, error: "Authentication required." },
          { status: 401 }
        ),
      };
    }

    const userRole = (session.user as any).role || ROLES.USER;

    if (!allowedRoles.includes(userRole)) {
      return {
        session: null,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: `Forbidden. Requires one of [${allowedRoles.join(", ")}] permissions.`,
          },
          { status: 403 }
        ),
      };
    }

    return { session, errorResponse: null };
  } catch (err: any) {
    console.error("Auth verification error in requireRole:", err);
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication verification failed." },
        { status: 500 }
      ),
    };
  }
}

/**
 * Server-side API Route Guard: checks session and validates that the user possesses a specific permission.
 */
export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<
  | { session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>; errorResponse: null }
  | { session: null; errorResponse: NextResponse }
> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return {
        session: null,
        errorResponse: NextResponse.json(
          { success: false, error: "Authentication required." },
          { status: 401 }
        ),
      };
    }

    const userRole = (session.user as any).role || ROLES.USER;

    if (!hasPermission(userRole, permission)) {
      return {
        session: null,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: `Forbidden. Missing required permission: '${permission}'.`,
          },
          { status: 403 }
        ),
      };
    }

    return { session, errorResponse: null };
  } catch (err: any) {
    console.error("Auth verification error in requirePermission:", err);
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication verification failed." },
        { status: 500 }
      ),
    };
  }
}
