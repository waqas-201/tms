import { NextRequest, NextResponse } from "next/server";
import { requireRole, ROLES } from "@/lib/rbac";
import { getMembershipStats } from "@/lib/membership";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.EDITOR,
    ]);

    if (errorResponse) {
      return errorResponse;
    }

    const stats = await getMembershipStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/membership/stats] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve membership statistics.",
      },
      { status: 500 }
    );
  }
}
