import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiClock, FiFilter, FiSearch, FiShield } from "react-icons/fi";
import { ActionButton, Select } from "../../components/ui/SigmaForm";
import StatusBadge, { pretty } from "../../components/ui/StatusBadge";
import { getAuditLogs } from "../../services/api/crm";

const ENTITY_TYPES = [
  "", "leads.lead", "dealers.dealer", "products.product",
  "tasks.task", "followups.followup", "system",
];

const AuditLogPage = () => {
  const [filters, setFilters] = useState({ search: "", entity_type: "", page: 1 });

  const params = {
    page_size: 30,
    page: filters.page,
    search: filters.search || undefined,
    entity_type: filters.entity_type || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => getAuditLogs(params),
  });

  const logs = data?.results || data || [];
  const totalCount = data?.count || logs.length;
  const totalPages = Math.ceil(totalCount / 30) || 1;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <p className="text-xs uppercase text-red-300">Security & Compliance</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Audit Trail</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Complete log of system actions — lead updates, dealer approvals, status changes, assignments, and API activity.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-4 lg:grid-cols-[1fr_200px]">
        <label className="flex items-center gap-3 rounded-lg border border-[var(--sigma-border)] bg-white/5 px-3 py-2 text-sm text-slate-300">
          <FiSearch className="text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((c) => ({ ...c, search: e.target.value, page: 1 }))}
            className="w-full bg-transparent outline-none placeholder:text-slate-500"
            placeholder="Search action, entity, user..."
          />
        </label>
        <Select
          value={filters.entity_type}
          onChange={(e) => setFilters((c) => ({ ...c, entity_type: e.target.value, page: 1 }))}
        >
          <option value="">All entities</option>
          {ENTITY_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{pretty(t.split(".").pop())}</option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {isLoading ? (
              <tr><td colSpan="5" className="px-4 py-6 text-slate-400">Loading audit trail...</td></tr>
            ) : logs.length ? (
              logs.map((log) => (
                <tr key={log.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <FiClock size={12} />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{log.user_name || "System"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {pretty(log.entity_type.split(".").pop())} #{log.entity_id}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{log.ip_address || "—"}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">No audit log entries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 px-4 py-3">
          <p className="text-sm text-slate-400">{totalCount} total entries</p>
          <div className="flex gap-2">
            <ActionButton tone="secondary" disabled={filters.page <= 1}
              onClick={() => setFilters((c) => ({ ...c, page: c.page - 1 }))}>Prev</ActionButton>
            <span className="flex items-center px-3 text-sm text-slate-300">Page {filters.page} of {totalPages}</span>
            <ActionButton tone="secondary" disabled={filters.page >= totalPages}
              onClick={() => setFilters((c) => ({ ...c, page: c.page + 1 }))}>Next</ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
