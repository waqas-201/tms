"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  TrendingUp,
  Receipt,
  ShoppingBag,
  Tag,
  Package,
  Warehouse,
  FolderTree,
  Scale,
  Activity,
  Droplets,
  CalendarCheck,
  Users,
  ShieldCheck,
  ChevronDown,
  Check,
  Menu,
  X,
  Compass,
} from "lucide-react";

export type AdminTab =
  | "analytics"
  | "orders"
  | "accounting"
  | "products"
  | "inventory"
  | "categories"
  | "units"
  | "consultations"
  | "schedule"
  | "hijama"
  | "users"
  | "staff"
  | "coupons";

export interface AdminTabItem {
  id: AdminTab;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  tabs: AdminTabItem[];
}

export const ADMIN_GROUPS: AdminNavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    shortLabel: "Analytics",
    icon: TrendingUp,
    description: "Executive KPIs, revenue performance & business trends",
    tabs: [
      {
        id: "analytics",
        label: "Executive Analytics",
        icon: TrendingUp,
        description: "Revenue trends, order volumes & business health",
        adminOnly: true,
      },
    ],
  },
  {
    id: "commerce",
    label: "Orders & Finance",
    shortLabel: "Commerce",
    icon: Receipt,
    description: "Orders, financial ledgers, payment logs & promotional campaigns",
    tabs: [
      {
        id: "orders",
        label: "Orders",
        icon: ShoppingBag,
        description: "Customer orders, fulfillment pipeline & dispatch verification",
      },
      {
        id: "accounting",
        label: "Accounting & Payments",
        icon: Receipt,
        description: "Patient ledgers, invoices, COD collection & payouts",
      },
      {
        id: "coupons",
        label: "Coupons & Flash Promos",
        icon: Tag,
        description: "Discount vouchers, flash campaigns & promotional rules",
        adminOnly: true,
      },
    ],
  },
  {
    id: "catalog",
    label: "Catalog & Inventory",
    shortLabel: "Catalog",
    icon: Package,
    description: "Herbal medicines, stock levels, taxonomies & measurement units",
    tabs: [
      {
        id: "products",
        label: "Products",
        icon: Package,
        description: "Herbal medicine catalog, variants, potencies & pricing",
      },
      {
        id: "inventory",
        label: "Stock",
        icon: Warehouse,
        description: "On-hand stock levels, movements & reorder alerts",
      },
      {
        id: "categories",
        label: "Categories",
        icon: FolderTree,
        description: "Remedy categories, classifications & storefront taxonomy",
      },
      {
        id: "units",
        label: "Units",
        icon: Scale,
        description: "Measurement units (grams, ml, bottles) & packaging ratios",
      },
    ],
  },
  {
    id: "clinic",
    label: "Clinic & Appointments",
    shortLabel: "Clinic",
    icon: Activity,
    description: "Consultations, Hijama cupping appointments & practitioner rosters",
    tabs: [
      {
        id: "consultations",
        label: "Consultations & Rx",
        icon: Activity,
        description: "Hakeem patient inquiries, diagnosis & prescriptions",
      },
      {
        id: "hijama",
        label: "Hijama Cupping",
        icon: Droplets,
        description: "Sunnah day bookings, seat capacity & Hajjam sessions",
      },
      {
        id: "schedule",
        label: "Clinic Schedule",
        icon: CalendarCheck,
        description: "Clinic timings, Hajjam shifts & lunar calendar offsets",
      },
    ],
  },
  {
    id: "team",
    label: "Team & Access",
    shortLabel: "Team",
    icon: ShieldCheck,
    description: "Registered accounts, staff permissions & Super Admin cell",
    tabs: [
      {
        id: "users",
        label: "Users & Access",
        icon: Users,
        description: "Customer & staff directory, roles, suspensions & audits",
        adminOnly: true,
      },
      {
        id: "staff",
        label: "Admin Team & Cell",
        icon: ShieldCheck,
        description: "Super Admin cell, administrative quota & staff provisioning",
        superAdminOnly: true,
      },
    ],
  },
];

interface AdminNavigationProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export default function AdminNavigation({
  activeTab,
  onSelectTab,
  isAdmin,
  isSuperAdmin,
}: AdminNavigationProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter groups and sub-tabs based on role permissions
  const visibleGroups = useMemo(() => {
    return ADMIN_GROUPS.map((group) => {
      const filteredTabs = group.tabs.filter((t) => {
        if (t.superAdminOnly) return isSuperAdmin;
        if (t.adminOnly) return isAdmin;
        return true;
      });
      return {
        ...group,
        tabs: filteredTabs,
      };
    }).filter((group) => group.tabs.length > 0);
  }, [isAdmin, isSuperAdmin]);

  // Identify which group owns the currently active tab
  const activeGroup = useMemo(() => {
    return (
      visibleGroups.find((g) => g.tabs.some((t) => t.id === activeTab)) ||
      visibleGroups[0]
    );
  }, [visibleGroups, activeTab]);

  // The active tab's definition
  const activeTabDef = useMemo(() => {
    for (const group of visibleGroups) {
      const match = group.tabs.find((t) => t.id === activeTab);
      if (match) return match;
    }
    return visibleGroups[0]?.tabs[0];
  }, [visibleGroups, activeTab]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdownId(null);
        setMobileDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnter = useCallback((groupId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpenDropdownId(groupId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdownId(null);
    }, 150);
  }, []);

  const handleGroupClick = (group: (typeof visibleGroups)[0]) => {
    // If a group only has 1 tab, clicking the head selects that tab immediately
    if (group.tabs.length === 1) {
      onSelectTab(group.tabs[0].id);
      setOpenDropdownId(null);
      return;
    }

    // Toggle dropdown open/closed
    setOpenDropdownId((prev) => (prev === group.id ? null : group.id));
  };

  const handleSelectTab = (tabId: AdminTab) => {
    onSelectTab(tabId);
    setOpenDropdownId(null);
    setMobileDrawerOpen(false);
  };

  return (
    <div ref={containerRef} className="border-t border-line/60 bg-white">
      {/* =========================================================================
          Desktop & Tablet Navigation (> 768px)
          Organized into clean Group Heads with hover/click dropdown menus
         ========================================================================= */}
      <div className="hidden md:block">
        {/* Row 1: Group Heads */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav
            aria-label="Admin Sections"
            className="flex items-center justify-between gap-1 py-1 relative"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              {visibleGroups.map((group, groupIndex) => {
                const GroupIcon = group.icon;
                const isCurrentGroup = activeGroup?.id === group.id;
                const isDropdownOpen = openDropdownId === group.id;
                const hasMultiple = group.tabs.length > 1;

                // Position dropdown cleanly to prevent edge overflow
                const alignRight =
                  groupIndex >= Math.max(1, visibleGroups.length - 2);

                return (
                  <div
                    key={group.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(group.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Group Head Button */}
                    <button
                      type="button"
                      onClick={() => handleGroupClick(group)}
                      aria-haspopup={hasMultiple ? "true" : "false"}
                      aria-expanded={isDropdownOpen}
                      className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isCurrentGroup
                          ? "bg-brand-green-50 text-primary border border-brand-green-200/80 shadow-2xs font-bold"
                          : "text-neutral-700 hover:text-primary hover:bg-sand-100 border border-transparent"
                      }`}
                    >
                      <GroupIcon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isCurrentGroup
                            ? "text-primary"
                            : "text-neutral-500 group-hover:text-primary"
                        }`}
                      />
                      <span>{group.label}</span>

                      {/* Pill showing current active sub-tab for context */}
                      {isCurrentGroup && (
                        <span className="hidden xl:inline-flex items-center text-[10px] font-medium text-brand-green-800 bg-brand-green-100/80 px-1.5 py-0.5 rounded-md">
                          {activeTabDef?.label}
                        </span>
                      )}

                      {/* Dropdown Chevron indicator */}
                      {hasMultiple && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isDropdownOpen
                              ? "rotate-180 text-primary"
                              : isCurrentGroup
                              ? "text-primary/70"
                              : "text-neutral-400 group-hover:text-primary"
                          }`}
                        />
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {hasMultiple && isDropdownOpen && (
                      <div
                        className={`absolute top-full mt-1.5 w-80 bg-white rounded-2xl border border-line shadow-luxury p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150 ${
                          alignRight ? "right-0" : "left-0"
                        }`}
                      >
                        {/* Dropdown Header */}
                        <div className="px-3 py-2 border-b border-line/60 mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                            {group.label}
                          </span>
                          <span className="text-[10px] font-medium text-ink-muted">
                            {group.tabs.length} modules
                          </span>
                        </div>

                        {/* Dropdown List */}
                        <div className="space-y-1">
                          {group.tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            const isTabActive = activeTab === tab.id;

                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleSelectTab(tab.id)}
                                className={`w-full text-left px-3 py-2 rounded-xl flex items-start gap-3 transition-colors ${
                                  isTabActive
                                    ? "bg-brand-green-50 text-primary border border-brand-green-200/70"
                                    : "hover:bg-sand-100 text-neutral-800 border border-transparent"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                    isTabActive
                                      ? "bg-primary text-white shadow-2xs"
                                      : "bg-sand-100 text-neutral-600 group-hover:text-primary"
                                  }`}
                                >
                                  <TabIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span
                                      className={`text-xs font-semibold truncate ${
                                        isTabActive
                                          ? "text-primary font-bold"
                                          : "text-neutral-900"
                                      }`}
                                    >
                                      {tab.label}
                                    </span>
                                    {isTabActive && (
                                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-ink-muted leading-tight mt-0.5 line-clamp-1">
                                    {tab.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick overview indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-ink-muted text-xs shrink-0 pl-2">
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px]">
                Active: <strong className="text-ink font-semibold">{activeTabDef?.label}</strong>
              </span>
            </div>
          </nav>
        </div>

        {/* Row 2: Secondary Contextual Sub-Nav Bar (instant switching within active group) */}
        {activeGroup && activeGroup.tabs.length > 1 && (
          <div className="border-t border-line/40 bg-sand-50/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted shrink-0 mr-1 hidden sm:inline">
                {activeGroup.label}:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {activeGroup.tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isSelected = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleSelectTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                        isSelected
                          ? "bg-primary text-white shadow-2xs font-bold"
                          : "text-neutral-600 hover:text-primary hover:bg-white bg-white/70 border border-line/70"
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          Mobile Navigation (< 768px)
          Eliminates horizontal scrolling with an active section selector + slide sheet
         ========================================================================= */}
      <div className="block md:hidden">
        {/* Mobile Header Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {activeTabDef ? (
                <activeTabDef.icon className="w-4 h-4" />
              ) : (
                <Package className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-ink-muted truncate">
                {activeGroup.label}
              </p>
              <p className="text-xs font-bold text-primary truncate">
                {activeTabDef?.label}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sand-100 hover:bg-sand-200 text-neutral-800 border border-line transition-all shrink-0"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>All Sections</span>
          </button>
        </div>

        {/* Mobile Sub-pills (only active group's tabs, max 4 items, zero horizontal overflow) */}
        {activeGroup.tabs.length > 1 && (
          <div className="border-t border-line/40 bg-sand-50/70 px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
            {activeGroup.tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? "bg-primary text-white shadow-2xs font-bold"
                      : "text-neutral-700 bg-white border border-line/70"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile Navigation Drawer / Modal */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200">
            <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col border-t border-line shadow-luxury animate-in slide-in-from-bottom duration-200">
              {/* Drawer Header */}
              <div className="p-4 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-base font-bold text-ink">
                    Admin Navigation
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:bg-sand-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content: Grouped Heads with Sub-items */}
              <div className="p-4 space-y-5 overflow-y-auto">
                {visibleGroups.map((group) => {
                  const GroupIcon = group.icon;

                  return (
                    <div key={group.id} className="space-y-1.5">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider px-1">
                        <GroupIcon className="w-3.5 h-3.5 text-primary" />
                        <span>{group.label}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-1">
                        {group.tabs.map((tab) => {
                          const TabIcon = tab.icon;
                          const isSelected = activeTab === tab.id;

                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => handleSelectTab(tab.id)}
                              className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors ${
                                isSelected
                                  ? "bg-brand-green-50 text-primary border border-brand-green-200/80 font-bold"
                                  : "hover:bg-sand-100 text-neutral-800 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? "bg-primary text-white"
                                      : "bg-sand-100 text-neutral-600"
                                  }`}
                                >
                                  <TabIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold truncate">
                                    {tab.label}
                                  </p>
                                  <p className="text-[11px] text-ink-muted truncate">
                                    {tab.description}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-primary shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
