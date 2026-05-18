import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiBell, FiCheckCircle, FiFilter } from "react-icons/fi";

import EmptyState from "../../components/ui/EmptyState";
import { ActionButton, Select } from "../../components/ui/SigmaForm";
import StatusBadge, { pretty } from "../../components/ui/StatusBadge";
import { getNotifications, markNotificationRead } from "../../services/api/crm";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const notificationsQuery = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => getNotifications({ page_size: 100, unread: filter === "unread" ? "true" : undefined }),
  });

  const notificationsData = notificationsQuery.data;
  const notifications = notificationsData?.results || notificationsData || [];
  const unreadCount = useMemo(() => {
    const currentNotifications = notificationsData?.results || notificationsData || [];
    return currentNotifications.filter((notification) => !notification.read_at).length;
  }, [notificationsData]);

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase text-red-300">Operational Alerts</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Notifications</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Lead assignments, overdue follow-ups, dealer approval events, and workflow reminders.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--sigma-border)] bg-white/5 px-4 py-3 text-sm text-slate-300">
          {unreadCount} unread
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-4">
        <FiFilter className="text-slate-400" />
        <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All notifications</option>
          <option value="unread">Unread only</option>
        </Select>
      </div>

      <div className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80">
        {notificationsQuery.isLoading ? (
          <p className="p-6 text-slate-400">Loading notifications...</p>
        ) : notifications.length ? (
          <div className="divide-y divide-white/10">
            {notifications.map((notification) => (
              <div key={notification.id} className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-start">
                <div className="rounded-lg bg-red-500/15 p-3 text-red-200">
                  {notification.read_at ? <FiCheckCircle /> : <FiBell />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{notification.title}</p>
                    <StatusBadge value={notification.notification_type} />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{notification.message || pretty(notification.notification_type)}</p>
                  <p className="mt-2 text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
                <ActionButton
                  tone={notification.read_at ? "secondary" : "primary"}
                  onClick={() => readMutation.mutate(notification.id)}
                  disabled={Boolean(notification.read_at) || readMutation.isPending}
                >
                  <FiCheckCircle />
                  Mark Read
                </ActionButton>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <EmptyState title="No notifications yet">Assignment alerts and follow-up reminders will appear here.</EmptyState>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
