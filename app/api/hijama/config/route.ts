import { NextRequest, NextResponse } from "next/server";
import { requireRole, ROLES } from "@/lib/rbac";
import {
  getOrInitHijamaSchedule,
  getHijamaDateOverrides,
  updateHijamaSettings,
  updateHijamaScheduleDay,
  setHijamaDateOverride,
  deleteHijamaDateOverride,
} from "@/lib/hijama";

/**
 * Public & Staff: Get complete Hijama configuration (schedule, settings, and date overrides)
 */
export async function GET() {
  try {
    const [{ configs: schedule, settings }, overrides] = await Promise.all([
      getOrInitHijamaSchedule(),
      getHijamaDateOverrides(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        schedule,
        settings,
        overrides,
      },
    });
  } catch (error: any) {
    console.error("Error retrieving Hijama configuration:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to load Hijama configuration.",
      },
      { status: 500 }
    );
  }
}

/**
 * Common handler for updating settings, schedule, and date overrides (Staff only)
 */
async function handleConfigUpdate(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [
      ROLES.ADMIN,
      ROLES.EDITOR,
    ]);
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { settings, schedule, override } = body;

    // 1. Update settings if provided
    if (settings && typeof settings === "object") {
      await updateHijamaSettings({
        moonSightingOffset:
          typeof settings.moonSightingOffset === "number"
            ? settings.moonSightingOffset
            : undefined,
        sunnahMaleCapacity:
          typeof settings.sunnahMaleCapacity === "number"
            ? settings.sunnahMaleCapacity
            : undefined,
        sunnahFemaleCapacity:
          typeof settings.sunnahFemaleCapacity === "number"
            ? settings.sunnahFemaleCapacity
            : undefined,
        standardFee:
          typeof settings.standardFee === "number"
            ? settings.standardFee
            : undefined,
      });
    }

    // 2. Update weekly schedule days if provided
    if (Array.isArray(schedule)) {
      for (const day of schedule) {
        if (
          typeof day.dayOfWeek === "number" &&
          day.dayOfWeek >= 0 &&
          day.dayOfWeek <= 6
        ) {
          await updateHijamaScheduleDay(day.dayOfWeek, {
            isOpen: typeof day.isOpen === "boolean" ? day.isOpen : undefined,
            openTime:
              typeof day.openTime === "string" ? day.openTime : undefined,
            closeTime:
              typeof day.closeTime === "string" ? day.closeTime : undefined,
            slotDurationMins:
              typeof day.slotDurationMins === "number"
                ? day.slotDurationMins
                : undefined,
            maxMaleCapacity:
              typeof day.maxMaleCapacity === "number"
                ? day.maxMaleCapacity
                : undefined,
            maxFemaleCapacity:
              typeof day.maxFemaleCapacity === "number"
                ? day.maxFemaleCapacity
                : undefined,
            customSlots:
              typeof day.customSlots === "string" || day.customSlots === null
                ? day.customSlots
                : undefined,
          });
        }
      }
    }

    // 3. Update or set date override if provided
    if (override && typeof override === "object" && override.date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(override.date)) {
        return NextResponse.json(
          {
            success: false,
            error: "Override date must be formatted as YYYY-MM-DD.",
          },
          { status: 400 }
        );
      }

      await setHijamaDateOverride({
        date: override.date,
        isClosed:
          typeof override.isClosed === "boolean" ? override.isClosed : undefined,
        openTime:
          typeof override.openTime === "string" || override.openTime === null
            ? override.openTime
            : undefined,
        closeTime:
          typeof override.closeTime === "string" || override.closeTime === null
            ? override.closeTime
            : undefined,
        slotDurationMins:
          typeof override.slotDurationMins === "number" ||
          override.slotDurationMins === null
            ? override.slotDurationMins
            : undefined,
        maxMaleCapacity:
          typeof override.maxMaleCapacity === "number" ||
          override.maxMaleCapacity === null
            ? override.maxMaleCapacity
            : undefined,
        maxFemaleCapacity:
          typeof override.maxFemaleCapacity === "number" ||
          override.maxFemaleCapacity === null
            ? override.maxFemaleCapacity
            : undefined,
        customSlots:
          typeof override.customSlots === "string" ||
          override.customSlots === null
            ? override.customSlots
            : undefined,
        note:
          typeof override.note === "string" || override.note === null
            ? override.note
            : undefined,
      });
    }

    const [{ configs: updatedSchedule, settings: updatedSettings }, updatedOverrides] =
      await Promise.all([
        getOrInitHijamaSchedule(),
        getHijamaDateOverrides(),
      ]);

    return NextResponse.json({
      success: true,
      message: "Configuration updated successfully.",
      data: {
        schedule: updatedSchedule,
        settings: updatedSettings,
        overrides: updatedOverrides,
      },
    });
  } catch (error: any) {
    console.error("Error updating Hijama configuration:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update Hijama configuration.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleConfigUpdate(request);
}

export async function PATCH(request: NextRequest) {
  return handleConfigUpdate(request);
}

/**
 * Delete a specific date override (Staff only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [
      ROLES.ADMIN,
      ROLES.EDITOR,
    ]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim();

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        {
          success: false,
          error: "Date query parameter is required in YYYY-MM-DD format.",
        },
        { status: 400 }
      );
    }

    await deleteHijamaDateOverride(date);

    return NextResponse.json({
      success: true,
      message: `Hijama date override for "${date}" removed successfully.`,
    });
  } catch (error: any) {
    console.error("Error deleting Hijama date override:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to remove Hijama date override.",
      },
      { status: 500 }
    );
  }
}
