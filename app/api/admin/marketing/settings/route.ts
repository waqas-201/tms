import { NextRequest, NextResponse } from "next/server";
import { requireRole, ROLES } from "@/lib/rbac";
import { getMarketingSettings, updateMarketingSettings } from "@/lib/marketing-settings";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const settings = await getMarketingSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/marketing/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load marketing settings." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload provided." },
        { status: 400 }
      );
    }

    const updated = await updateMarketingSettings(body);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Marketing & referral settings updated successfully.",
    });
  } catch (error: any) {
    console.error("[POST /api/admin/marketing/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update marketing settings." },
      { status: 500 }
    );
  }
}
