"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  CheckCheck,
  Loader2,
  ShoppingBag,
  Stethoscope,
  Droplets,
  Inbox,
  AlertCircle,
} from "lucide-react";

interface AdminNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
}

const POLL_INTERVAL_MS = 20_000;

const TYPE_STYLES: Record<string, { icon: typeof Bell; className: string }> = {
  ORDER: { icon: ShoppingBag, className: "bg-info-soft text-info" },
  CONSULTATION: { icon: Stethoscope, className: "bg-brand-green-50 text-primary" },
  HIJAMA: { icon: Droplets, className: "bg-secondary/10 text-brand-gold-800" },
  INQUIRY: { icon: Inbox, className: "bg-surface-sunken text-ink-body" },
};

function relativeTime(value: string) {
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return "";

  const diffSeconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?limit=30", {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load notifications.");
      }
      setNotifications(json.data || []);
      setUnreadCount(json.unreadCount || 0);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof Error ? err.message : "Failed to load notifications."
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Poll so new bookings/orders show up without a page refresh.
  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadNotifications(true);
      }
    }, POLL_INTERVAL_MS);

    const onFocus = () => loadNotifications(true);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadNotifications]);

  // Close the panel when clicking anywhere outside it.
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to mark notifications read.");
      }

      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => (n.readAt ? n : { ...n, readAt: now }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark notifications read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = async (notification: AdminNotificationItem) => {
    setIsOpen(false);

    if (!notification.readAt) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id }),
      }).catch(() => {
        // Non-critical: the unread badge will resync on the next poll.
      });
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) loadNotifications(true);
        }}
        className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
          unreadCount > 0
            ? "text-danger bg-danger-soft border-danger/30 hover:bg-danger-soft"
            : "text-neutral-700 hover:bg-surface border-line"
        }`}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-3.5 h-3.5" />
        ) : (
          <Bell className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">Alerts</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] bg-white rounded-2xl border border-line shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line bg-surface/60">
            <div>
              <p className="text-sm font-bold text-primary">Notifications</p>
              <p className="text-[11px] text-ink-muted">
                {unreadCount > 0
                  ? `${unreadCount} unread alert${unreadCount === 1 ? "" : "s"}`
                  : "You are all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                disabled={markingAll}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-primary hover:bg-brand-green-50 disabled:opacity-50 transition-colors"
              >
                {markingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto divide-y divide-sand-100">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-ink-muted">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading alerts...</span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-2 px-4 py-5 text-xs text-danger">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center px-6">
                <Inbox className="w-8 h-8 text-ink-subtle" />
                <p className="text-xs font-semibold text-ink">No notifications yet</p>
                <p className="text-[11px] text-ink-muted">
                  New orders, consultations and Hijama bookings will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const style = TYPE_STYLES[notification.type] || TYPE_STYLES.INQUIRY;
                const Icon = style.icon;
                const isUnread = !notification.readAt;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface ${
                      isUnread ? "bg-brand-green-50/40" : "bg-white"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.className}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-ink leading-snug">
                          {notification.title}
                        </span>
                        {isUnread && (
                          <span className="mt-1 w-2 h-2 rounded-full bg-danger shrink-0" />
                        )}
                      </span>
                      <span className="block text-[11px] text-ink-body mt-0.5 break-words">
                        {notification.message}
                      </span>
                      <span className="block text-[10px] text-ink-subtle mt-1">
                        {relativeTime(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
