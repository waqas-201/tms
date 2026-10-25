"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { ROLES, Role } from "@/lib/rbac-base";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  city: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    consultations: number;
    hijamaBookings: number;
  };
}

interface UserCounts {
  total: number;
  active: number;
  staff: number;
  customers: number;
  suspended: number;
  deleted: number;
}

const ROLE_CONFIG: Record<
  string,
  { label: string; badge: string; icon: React.ElementType; description: string }
> = {
  admin: {
    label: "Primary Admin",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    icon: ShieldAlert,
    description: "Full platform control and security governance",
  },
  hakim: {
    label: "Hakim (Physician)",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: ShieldCheck,
    description: "Clinical consults, nabz diagnosis, and remedies",
  },
  editor: {
    label: "Staff Editor",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Shield,
    description: "Product catalog, inventory adjustments, and content",
  },
  contributor: {
    label: "Contributor",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: Shield,
    description: "Limited support and order processing operations",
  },
  user: {
    label: "Customer / Patient",
    badge: "bg-surface-sunken text-ink-body border-line-strong",
    icon: Users,
    description: "Standard registered user with order & consult history",
  },
};

type ViewFilter = "ALL" | "STAFF" | "CUSTOMER" | "SUSPENDED" | "DELETED";

export default function UsersTab({ currentUserId }: { currentUserId?: string }) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [counts, setCounts] = useState<UserCounts>({
    total: 0,
    active: 0,
    staff: 0,
    customers: 0,
    suspended: 0,
    deleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State for Add User
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phone: "",
    city: "Karachi",
  });

  // Form State for Edit User
  const [editForm, setEditForm] = useState({
    name: "",
    role: "user",
    phone: "",
    city: "",
    isActive: true,
  });

  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());

        if (viewFilter === "DELETED") {
          params.set("status", "DELETED");
        } else if (viewFilter === "SUSPENDED") {
          params.set("status", "SUSPENDED");
        } else {
          params.set("status", "ALL");
        }

        if (viewFilter === "STAFF") {
          params.set("role", "STAFF");
        } else if (viewFilter === "CUSTOMER") {
          params.set("role", "CUSTOMER");
        } else if (roleFilter !== "ALL") {
          params.set("role", roleFilter);
        }

        const res = await fetch(`/api/admin/users?${params.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load users directory.");
        }

        setUsers(json.data || []);
        if (json.counts) {
          setCounts(json.counts);
        }
      } catch (err: any) {
        setError(err instanceof Error ? err.message : "Failed to load users.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, viewFilter, roleFilter]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Action notification dismissal
  useEffect(() => {
    if (!actionSuccess) return;
    const t = setTimeout(() => setActionSuccess(null), 5000);
    return () => clearTimeout(t);
  }, [actionSuccess]);

  // Handle Toggle Suspend / Active
  const handleToggleSuspend = async (user: UserItem) => {
    if (user.role === ROLES.ADMIN) {
      alert("Cannot suspend the primary Admin account.");
      return;
    }

    const nextState = !user.isActive;
    const confirmMessage = nextState
      ? `Re-activate login access for '${user.name}'?`
      : `Suspend account for '${user.name}'? All current login sessions will be terminated immediately.`;

    if (!window.confirm(confirmMessage)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update account status.");
      }
      setActionSuccess(json.message);
      fetchUsers(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Soft Delete / Archive
  const handleSoftDelete = async (user: UserItem) => {
    if (user.role === ROLES.ADMIN) {
      alert("Cannot delete the primary Admin account.");
      return;
    }

    if (
      !window.confirm(
        `Archive '${user.name}' (${user.email}) to Deleted Accounts? All active sessions will end immediately. Consultation and order records will be preserved.`
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to archive user.");
      }
      setActionSuccess(json.message);
      fetchUsers(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Restore
  const handleRestore = async (user: UserItem) => {
    if (!window.confirm(`Restore account for '${user.name}' (${user.email}) back to active status?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to restore account.");
      }
      setActionSuccess(json.message);
      fetchUsers(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Permanent Hard Delete
  const handlePermanentDelete = async (user: UserItem) => {
    const totalRecords =
      user._count.orders + user._count.consultations + user._count.hijamaBookings;

    if (totalRecords > 0) {
      alert(
        `Cannot permanently delete '${user.name}' because they have ${totalRecords} linked orders/consultations. Soft deletion is preserved for clinical and financial compliance.`
      );
      return;
    }

    if (
      !window.confirm(
        `PERMANENT DELETE WARNING: This will permanently purge '${user.name}' (${user.email}) from the database. This action cannot be undone. Proceed?`
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}?permanent=true`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to permanently delete user.");
      }
      setActionSuccess(json.message);
      fetchUsers(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      phone: user.phone || "",
      city: user.city || "Karachi",
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update user.");
      }
      setActionSuccess(json.message);
      setIsEditModalOpen(false);
      fetchUsers(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Add User
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.password) {
      alert("Name, email, and password are required.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create user account.");
      }
      setActionSuccess(json.message);
      setIsAddModalOpen(false);
      setAddForm({
        name: "",
        email: "",
        password: "",
        role: "user",
        phone: "",
        city: "Karachi",
      });
      fetchUsers(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Success Toast */}
      {actionSuccess && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="p-1 hover:bg-emerald-100 rounded text-emerald-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => {
            setViewFilter("ALL");
            setRoleFilter("ALL");
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            viewFilter === "ALL" && roleFilter === "ALL"
              ? "bg-primary/5 border-primary shadow-xs"
              : "bg-white border-line hover:border-line-strong"
          }`}
        >
          <div className="flex items-center gap-2 text-ink-muted mb-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Total Directory</span>
          </div>
          <p className="text-xl font-serif font-bold text-ink">{counts.total}</p>
        </button>

        <button
          onClick={() => {
            setViewFilter("STAFF");
            setRoleFilter("ALL");
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            viewFilter === "STAFF"
              ? "bg-purple-50/60 border-purple-400 shadow-xs"
              : "bg-white border-line hover:border-line-strong"
          }`}
        >
          <div className="flex items-center gap-2 text-purple-700 mb-1">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Staff & Hakims</span>
          </div>
          <p className="text-xl font-serif font-bold text-purple-900">{counts.staff}</p>
        </button>

        <button
          onClick={() => {
            setViewFilter("CUSTOMER");
            setRoleFilter("ALL");
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            viewFilter === "CUSTOMER"
              ? "bg-blue-50/60 border-blue-400 shadow-xs"
              : "bg-white border-line hover:border-line-strong"
          }`}
        >
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Patients & Buyers</span>
          </div>
          <p className="text-xl font-serif font-bold text-blue-900">{counts.customers}</p>
        </button>

        <button
          onClick={() => {
            setViewFilter("SUSPENDED");
            setRoleFilter("ALL");
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            viewFilter === "SUSPENDED"
              ? "bg-amber-50/70 border-amber-400 shadow-xs"
              : "bg-white border-line hover:border-line-strong"
          }`}
        >
          <div className="flex items-center gap-2 text-amber-700 mb-1">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Suspended</span>
          </div>
          <p className="text-xl font-serif font-bold text-amber-900">{counts.suspended}</p>
        </button>

        <button
          onClick={() => {
            setViewFilter("DELETED");
            setRoleFilter("ALL");
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            viewFilter === "DELETED"
              ? "bg-rose-50/70 border-rose-400 shadow-xs"
              : "bg-white border-line hover:border-line-strong"
          }`}
        >
          <div className="flex items-center gap-2 text-rose-700 mb-1">
            <Archive className="w-4 h-4 text-rose-600" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Deleted / Archived</span>
          </div>
          <p className="text-xl font-serif font-bold text-rose-900">{counts.deleted}</p>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white rounded-2xl border border-line p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone number, or city..."
              className="w-full pl-9 pr-3 py-2 bg-surface border border-line rounded-xl text-xs text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              className="p-2 border border-line rounded-xl hover:bg-surface text-ink-muted hover:text-ink transition-colors flex items-center gap-1.5 text-xs"
              title="Refresh users directory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium text-xs flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User / Staff</span>
            </button>
          </div>
        </div>

        {/* View Tabs & Sub-Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-line/60">
          <span className="text-[11px] font-semibold text-ink-muted mr-1.5">View:</span>
          {(
            [
              { id: "ALL", label: `All Users (${counts.total})` },
              { id: "STAFF", label: `Staff & Practitioners (${counts.staff})` },
              { id: "CUSTOMER", label: `Patients / Customers (${counts.customers})` },
              { id: "SUSPENDED", label: `Suspended (${counts.suspended})` },
              { id: "DELETED", label: `Archived / Deleted (${counts.deleted})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewFilter === tab.id
                  ? "bg-ink text-white shadow-xs"
                  : "bg-surface text-ink-body hover:bg-surface-sunken"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users List / Table */}
      <div className="bg-white rounded-2xl border border-line overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-xs text-ink-muted">Loading user accounts directory...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-danger mx-auto" />
            <p className="text-xs text-danger font-medium">{error}</p>
            <button
              onClick={() => fetchUsers(true)}
              className="text-xs font-semibold text-primary underline"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-ink-subtle mx-auto" />
            <p className="text-sm font-semibold text-ink">No user accounts found</p>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              {search
                ? `No accounts match "${search}" with current view filters.`
                : "No accounts match this selected category."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/80 border-b border-line text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Role & Access</th>
                  <th className="py-3 px-4">Location / Contact</th>
                  <th className="py-3 px-4">Records & History</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs text-ink">
                {users.map((user) => {
                  const roleMeta = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
                  const isCurrentAdmin = user.role === ROLES.ADMIN;
                  const isSelf = user.id === currentUserId;
                  const isDeleted = Boolean(user.deletedAt);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-surface/50 transition-colors ${
                        isDeleted
                          ? "bg-rose-50/20"
                          : !user.isActive
                          ? "bg-amber-50/20"
                          : ""
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sand-200 border border-sand-300 flex items-center justify-center font-bold text-ink text-xs shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-ink text-xs">{user.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded bg-surface-sunken text-[10px] font-bold text-ink-muted">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-ink-muted block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${roleMeta.badge}`}
                          title={roleMeta.description}
                        >
                          <roleMeta.icon className="w-3 h-3" />
                          <span>{roleMeta.label}</span>
                        </span>
                      </td>

                      {/* Contact / Phone */}
                      <td className="py-3 px-4 text-ink-body">
                        <div className="space-y-0.5 text-[11px]">
                          {user.phone ? (
                            <div className="flex items-center gap-1 text-ink">
                              <Phone className="w-3 h-3 text-ink-subtle" />
                              <span>{user.phone}</span>
                            </div>
                          ) : (
                            <span className="text-ink-subtle italic">No phone</span>
                          )}
                          <div className="flex items-center gap-1 text-ink-muted">
                            <MapPin className="w-3 h-3 text-ink-subtle" />
                            <span>{user.city || "Karachi"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Orders & Consultations Counts */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-surface border border-line text-ink-body font-medium">
                            {user._count.orders} Orders
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface border border-line text-ink-body font-medium">
                            {user._count.consultations} Consults
                          </span>
                          {user._count.hijamaBookings > 0 && (
                            <span className="px-2 py-0.5 rounded bg-surface border border-line text-ink-body font-medium">
                              {user._count.hijamaBookings} Hijama
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isDeleted ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <Archive className="w-3 h-3 text-rose-600" />
                              <span>Deleted / Archived</span>
                            </span>
                            <span className="text-[10px] text-ink-subtle block">
                              {new Date(user.deletedAt!).toLocaleDateString()}
                            </span>
                          </div>
                        ) : !user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestore(user)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors"
                                title="Restore account to active"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(user)}
                                disabled={actionLoading}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                                title="Permanently wipe record (only if 0 orders/consults)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => openEditModal(user)}
                                disabled={actionLoading}
                                className="p-1.5 text-ink-body hover:text-ink hover:bg-surface border border-line rounded-lg transition-colors"
                                title="Edit Role & Profile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {!isCurrentAdmin && (
                                <button
                                  onClick={() => handleToggleSuspend(user)}
                                  disabled={actionLoading}
                                  className={`p-1.5 border rounded-lg transition-colors ${
                                    user.isActive
                                      ? "text-amber-700 hover:bg-amber-50 border-amber-200"
                                      : "text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                  }`}
                                  title={user.isActive ? "Suspend login access" : "Reactivate login access"}
                                >
                                  {user.isActive ? (
                                    <Lock className="w-3.5 h-3.5" />
                                  ) : (
                                    <Unlock className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}

                              {!isCurrentAdmin && (
                                <button
                                  onClick={() => handleSoftDelete(user)}
                                  disabled={actionLoading}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                                  title="Archive / Soft Delete account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Add User / Staff */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-line shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                <h3 className="font-serif font-bold text-sm text-ink">Register User or Staff</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-ink-muted hover:text-ink rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Full Name</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Hakeem Asadullah or Ahmed Khan"
                  className="w-full px-3 py-2 text-xs border border-line rounded-xl focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Email Address</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="staff@tameeresehat.com"
                  className="w-full px-3 py-2 text-xs border border-line rounded-xl focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Initial Password</label>
                <input
                  type="text"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Temporary login password (min 8 chars)"
                  className="w-full px-3 py-2 text-xs border border-line rounded-xl focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Role & Access Tier</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-line rounded-xl focus:border-primary focus:outline-none bg-white"
                >
                  <option value="user">Customer / Patient (Standard User)</option>
                  <option value="hakim">Hakim (Physician / Clinical Consultations)</option>
                  <option value="editor">Staff Editor (Catalog & Stock Management)</option>
                  <option value="contributor">Contributor (Order Operations)</option>
                </select>
                <p className="text-[11px] text-ink-muted">
                  Primary Admin role cannot be assigned. Only one primary admin exists in the system.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Phone</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 text-xs border border-line rounded-xl focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">City</label>
                  <input
                    type="text"
                    value={addForm.city}
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                    placeholder="Karachi"
                    className="w-full px-3 py-2 text-xs border border-line rounded-xl focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-xl hover:bg-primary-hover flex items-center gap-1.5 shadow-xs"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit User / Role */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-line shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-primary" />
                <h3 className="font-serif font-bold text-sm text-ink">
                  Edit Profile: {selectedUser.name}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-ink-muted hover:text-ink rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-line rounded-xl focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Email (Account identifier)</label>
                <input
                  type="email"
                  disabled
                  value={selectedUser.email}
                  className="w-full px-3 py-2 text-xs border border-line rounded-xl bg-surface-sunken text-ink-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Role</label>
                {selectedUser.role === ROLES.ADMIN ? (
                  <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Primary Admin Account (Role cannot be changed)</span>
                  </div>
                ) : (
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-line rounded-xl focus:border-primary focus:outline-none bg-white"
                  >
                    <option value="user">Customer / Patient</option>
                    <option value="hakim">Hakim (Physician)</option>
                    <option value="editor">Staff Editor</option>
                    <option value="contributor">Contributor</option>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-line rounded-xl focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-line rounded-xl focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {selectedUser.role !== ROLES.ADMIN && (
                <div className="p-3 bg-surface border border-line rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ink">Account Login Status</p>
                    <p className="text-[11px] text-ink-muted">
                      {editForm.isActive ? "User can log in normally" : "User login is suspended"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      editForm.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {editForm.isActive ? "Active" : "Suspended"}
                  </button>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-xl hover:bg-primary-hover flex items-center gap-1.5 shadow-xs"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
