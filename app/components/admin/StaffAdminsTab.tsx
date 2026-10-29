"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Power,
  RotateCw,
  KeyRound,
  ArrowRightLeft,
  Skull,
  Lock,
  Mail,
  User,
  X,
  AlertTriangle,
} from "lucide-react";

interface AdminItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  city: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function StaffAdminsTab({
  isSuperAdmin,
  currentUserEmail,
}: {
  isSuperAdmin: boolean;
  currentUserEmail?: string;
}) {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [maxQuota, setMaxQuota] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create / Promote Admin Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"pick" | "create">("pick");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [selectedUserToPromote, setSelectedUserToPromote] = useState<any | null>(null);
  const [promoteLoading, setPromoteLoading] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createCity, setCreateCity] = useState("Karachi");
  const [creating, setCreating] = useState(false);

  // Super Admin Cell State
  const [cellModalAction, setCellModalAction] = useState<"transfer" | "decommission" | null>(null);
  const [cellPassword, setCellPassword] = useState("");
  const [cellTargetEmail, setCellTargetEmail] = useState("");
  const [cellConfirmationText, setCellConfirmationText] = useState("");
  const [cellSubmitting, setCellSubmitting] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load staff admin list.");
      }
      setAdmins(data.admins || []);
      setActiveCount(data.activeCount || 0);
      setMaxQuota(data.maxQuota || 3);
    } catch (err: any) {
      setError(err.message || "Unable to fetch staff admins.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Live Search Users for Promotion
  useEffect(() => {
    if (!isCreateModalOpen || modalMode !== "pick") return;
    let ignore = false;
    const timer = setTimeout(async () => {
      setUserSearchLoading(true);
      try {
        const query = userSearchQuery.trim();
        const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}&status=ALL`);
        const data = await res.json();
        if (!ignore && data.success && Array.isArray(data.data)) {
          // Filter out super_admin and existing operational admins
          const nonAdmins = data.data.filter(
            (u: any) => u.role !== "super_admin" && u.role !== "admin" && !u.deletedAt
          );
          setUserSearchResults(nonAdmins);
        }
      } catch (err) {
        console.error("User search failed:", err);
      } finally {
        if (!ignore) setUserSearchLoading(false);
      }
    }, 250);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [userSearchQuery, isCreateModalOpen, modalMode]);

  const handlePromoteSelectedUser = async () => {
    if (!selectedUserToPromote) return;
    setError(null);
    setSuccess(null);
    setPromoteLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserToPromote.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to promote user.");
      }
      setSuccess(`'${selectedUserToPromote.name}' has been promoted to Admin successfully!`);
      setIsCreateModalOpen(false);
      setSelectedUserToPromote(null);
      setUserSearchQuery("");
      fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to promote user.");
    } finally {
      setPromoteLoading(false);
    }
  };

  const handleDemoteAdmin = async (admin: AdminItem) => {
    if (!window.confirm(`Are you sure you want to demote admin '${admin.name}' back to a standard user? Their administrative access will be revoked immediately and their seat quota restored.`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/staff/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "demote" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to demote admin.");
      }

      setSuccess(`'${admin.name}' demoted to standard user and seat quota restored.`);
      fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to demote admin.");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          phone: createPhone.trim() || undefined,
          city: createCity.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create Admin.");
      }

      setSuccess(`Admin '${createName}' provisioned successfully!`);
      setIsCreateModalOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreatePhone("");
      fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to provision Admin.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (admin: AdminItem) => {
    setError(null);
    setSuccess(null);
    const newStatus = !admin.isActive;

    try {
      const res = await fetch(`/api/admin/staff/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update admin status.");
      }

      setSuccess(`Admin '${admin.name}' ${newStatus ? "activated" : "deactivated"} successfully.`);
      fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to toggle status.");
    }
  };

  const handleDeleteAdmin = async (admin: AdminItem) => {
    if (!window.confirm(`Are you sure you want to permanently remove admin '${admin.name}'? This will free up their seat in the Admin Quota.`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/staff/${admin.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove admin.");
      }

      setSuccess(`Admin '${admin.name}' removed and seat quota restored.`);
      fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to remove admin.");
    }
  };

  const handleCellActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellModalAction) return;

    setError(null);
    setSuccess(null);
    setCellSubmitting(true);

    try {
      const res = await fetch("/api/admin/staff/super-cell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: cellModalAction,
          password: cellPassword,
          targetEmail: cellTargetEmail.trim() || undefined,
          confirmationText: cellConfirmationText.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute Super Admin Cell action.");
      }

      setSuccess(data.message || "Super Admin Cell operation completed successfully.");
      setCellModalAction(null);
      setCellPassword("");
      setCellTargetEmail("");
      setCellConfirmationText("");

      if (cellModalAction === "decommission" || cellModalAction === "transfer") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        fetchStaff();
      }
    } catch (err: any) {
      setError(err.message || "Super Admin Cell operation failed.");
    } finally {
      setCellSubmitting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-8 text-center my-6">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Restricted to Super Admin</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Operational Admins are restricted from viewing or managing staff credentials. Only the sovereign Super Admin possesses privileges to provision Admins or access the Super Admin Cell.
        </p>
      </div>
    );
  }

  const isQuotaFull = activeCount >= maxQuota;

  return (
    <div className="space-y-8">
      {/* Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-3 text-sm text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-start gap-3 text-sm text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Admin Quota Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" /> Sovereign Governance
            </div>
            <h2 className="text-2xl font-bold text-white font-serif">Administrative Staff & Quota</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Super Admin can provision up to exactly <strong>3 concurrent active Admins</strong>. Deactivating or deleting an admin re-opens a seat in the quota.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchStaff();
              }}
              disabled={refreshing}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh staff"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isQuotaFull}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                isQuotaFull
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-800/30 active:scale-95"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isQuotaFull ? "Admin Quota Full (3/3)" : "Provision New Admin"}</span>
            </button>
          </div>
        </div>

        {/* Quota Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs font-medium text-slate-400 mb-2">
            <span>Active Admin Seats In Use</span>
            <span className={`font-mono font-bold ${isQuotaFull ? "text-amber-400" : "text-emerald-400"}`}>
              {activeCount} / {maxQuota} Seats Active
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isQuotaFull
                  ? "bg-gradient-to-r from-amber-500 to-rose-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400"
              }`}
              style={{ width: `${Math.min(100, (activeCount / maxQuota) * 100)}%` }}
            />
          </div>
          {isQuotaFull && (
            <p className="mt-2 text-xs text-amber-400/90 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Maximum operational admin limit reached. To add a new administrator, toggle an existing admin to inactive or delete their account.
            </p>
          )}
        </div>
      </div>

      {/* Staff Admins List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <span>Operational Administrators ({admins.length})</span>
        </h3>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <p className="text-sm">Loading admin staff directory...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium">No secondary operational Admins provisioned yet.</p>
            <p className="text-xs text-slate-400 mt-1">Use the "Provision New Admin" button above to grant staff access.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className={`p-5 rounded-2xl border transition-all ${
                  admin.isActive
                    ? "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                    : "bg-slate-950/30 border-rose-950/40 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-base">{admin.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{admin.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      admin.isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {admin.isActive ? "Active" : "Suspended"}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>Role: <strong>Admin</strong></span>
                  <span>Joined: {new Date(admin.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="mt-4 pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(admin)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
                      admin.isActive
                        ? "bg-amber-950/30 text-amber-400 hover:bg-amber-900/40 border border-amber-500/30"
                        : "bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-500/30"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{admin.isActive ? "Deactivate" : "Reactivate"}</span>
                  </button>

                  <button
                    onClick={() => handleDemoteAdmin(admin)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-amber-950/50 text-slate-400 hover:text-amber-400 border border-slate-800 transition"
                    title="Demote to Standard User"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteAdmin(admin)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                    title="Remove Admin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Super Admin Cell (Sovereign Security Compartment) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-rose-500/20 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-1">
              <Skull className="w-4 h-4" /> Sovereign Governance Compartment
            </div>
            <h3 className="text-xl font-bold text-white font-serif">Super Administrator Cell</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Per system security rules, the Super Admin cannot be removed or altered by any standard admin endpoint. The only programmatic path is through this cell with mandatory password re-verification, or direct database administration.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Super Admin</span>
            <p className="text-white font-semibold text-sm">{currentUserEmail || "Primary Super Admin"}</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setCellModalAction("transfer");
                setCellPassword("");
                setCellTargetEmail("");
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />
              <span>Transfer Role</span>
            </button>

            <button
              onClick={() => {
                setCellModalAction("decommission");
                setCellPassword("");
                setCellConfirmationText("");
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold transition border border-rose-500/40"
            >
              <Power className="w-3.5 h-3.5 text-rose-400" />
              <span>Decommission</span>
            </button>
          </div>
        </div>
      </div>

      {/* Provision Admin Modal (Pick Existing User or Create New) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setSelectedUserToPromote(null);
                setUserSearchQuery("");
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif">Add Operational Admin</h3>
                <p className="text-xs text-slate-400">Quota: Seat {activeCount + 1} of {maxQuota}</p>
              </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => setModalMode("pick")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  modalMode === "pick"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pick Existing User</span>
              </button>
              <button
                type="button"
                onClick={() => setModalMode("create")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  modalMode === "create"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create New Account</span>
              </button>
            </div>

            {modalMode === "pick" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                    Search Registered Users
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Type name, email, or phone to search..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Search Results List */}
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {userSearchLoading ? (
                    <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Searching users...</span>
                    </div>
                  ) : userSearchResults.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                      {userSearchQuery ? "No matching non-admin users found." : "Start typing to search existing users."}
                    </div>
                  ) : (
                    userSearchResults.map((u) => {
                      const isSelected = selectedUserToPromote?.id === u.id;
                      return (
                        <div
                          key={u.id}
                          onClick={() => setSelectedUserToPromote(u)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-emerald-950/40 border-emerald-500/50"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
                              {u.name ? u.name[0]?.toUpperCase() : "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                              {u.phone && <p className="text-[10px] text-slate-500">{u.phone}</p>}
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                            {u.role || "user"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Selected User Summary & Action */}
                {selectedUserToPromote && (
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-400 font-semibold">Selected for Promotion</span>
                      <button
                        type="button"
                        onClick={() => setSelectedUserToPromote(null)}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white">{selectedUserToPromote.name}</p>
                    <p className="text-xs text-slate-300 font-mono">{selectedUserToPromote.email}</p>
                    <p className="text-[11px] text-slate-400">
                      Their existing password will remain unchanged. They will receive an email notifying them of their new Admin access.
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePromoteSelectedUser}
                    disabled={!selectedUserToPromote || promoteLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {promoteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Promote '{selectedUserToPromote ? selectedUserToPromote.name : "User"}' to Admin</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Hakim Tahir Hameed"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="admin@tameeresehat.com"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Phone (Optional)</label>
                    <input
                      type="text"
                      value={createPhone}
                      onChange={(e) => setCreatePhone(e.target.value)}
                      placeholder="0335-XXXXXXX"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">City</label>
                    <input
                      type="text"
                      value={createCity}
                      onChange={(e) => setCreateCity(e.target.value)}
                      placeholder="Karachi"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>Provision Operational Admin</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Super Admin Cell Modal (Transfer / Decommission) */}
      {cellModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setCellModalAction(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                {cellModalAction === "transfer" ? <ArrowRightLeft className="w-5 h-5" /> : <Skull className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif">
                  {cellModalAction === "transfer" ? "Transfer Super Admin Role" : "Decommission Super Admin"}
                </h3>
                <p className="text-xs text-rose-400 font-semibold">Super Administrator Cell Action</p>
              </div>
            </div>

            <form onSubmit={handleCellActionSubmit} className="space-y-4">
              {cellModalAction === "transfer" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                    Target Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={cellTargetEmail}
                    onChange={(e) => setCellTargetEmail(e.target.value)}
                    placeholder="new-super-admin@tameeresehat.com"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Recipient must be an active existing user in good standing.</p>
                </div>
              )}

              {cellModalAction === "decommission" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                    Type 'DECOMMISSION_SUPER_ADMIN' to confirm *
                  </label>
                  <input
                    type="text"
                    required
                    value={cellConfirmationText}
                    onChange={(e) => setCellConfirmationText(e.target.value)}
                    placeholder="DECOMMISSION_SUPER_ADMIN"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-rose-950 rounded-xl text-rose-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-[11px] text-rose-300/80 mt-1">
                    This deactivates your Super Admin role and wipes active sessions. To re-establish a Super Admin, a new bootstrap key must be generated or database manual update performed.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Confirm Current Password (Re-authentication) *
                </label>
                <input
                  type="password"
                  required
                  value={cellPassword}
                  onChange={(e) => setCellPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={cellSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition shadow-lg shadow-rose-900/40 disabled:opacity-50"
                >
                  {cellSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : cellModalAction === "transfer" ? (
                    <ArrowRightLeft className="w-4 h-4" />
                  ) : (
                    <Power className="w-4 h-4" />
                  )}
                  <span>
                    {cellModalAction === "transfer" ? "Authorize Role Transfer" : "Confirm Decommission"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
