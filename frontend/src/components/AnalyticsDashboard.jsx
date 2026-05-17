import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Line, LineChart, Pie, PieChart, RadialBar, RadialBarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  FiActivity, FiAward, FiBarChart2, FiCalendar, FiFilter,
  FiMap, FiTarget, FiTrendingUp, FiUsers, FiZap,
} from "react-icons/fi";
import { getLeadAnalytics, getDealerAnalytics, getProductAnalytics, getEmployeeAnalytics, getActivityFeed } from "../services/api/crm";
import StatusBadge, { pretty } from "./ui/StatusBadge";

const RANGES = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "1 year", value: "365d" },
];

const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#06b6d4", "#8b5cf6", "#ec4899", "#64748b", "#10b981"];

const tooltipStyle = {
  background: "#11131d",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5 ${className}`}>{children}</div>
);

const CardHeader = ({ title, subtitle, icon: Icon, iconColor = "text-red-300" }) => (
  <div className="mb-4 flex items-center justify-between">
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
    {Icon && <Icon className={iconColor} />}
  </div>
);

const KpiCard = ({ label, value, icon: Icon, tone, trend }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        {trend !== undefined && (
          <p className={`mt-1 text-xs ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? "+" : ""}{trend}% vs prior
          </p>
        )}
      </div>
      <div className={`rounded-lg bg-gradient-to-br ${tone} p-3 text-black`}>
        <Icon />
      </div>
    </div>
  </Card>
);

const AnalyticsDashboard = () => {
  const [range, setRange] = useState("30d");
  const params = { range };

  const leadQ = useQuery({ queryKey: ["analytics-leads", params], queryFn: () => getLeadAnalytics(params) });
  const dealerQ = useQuery({ queryKey: ["analytics-dealers", params], queryFn: () => getDealerAnalytics(params) });
  const productQ = useQuery({ queryKey: ["analytics-products", params], queryFn: () => getProductAnalytics(params) });
  const employeeQ = useQuery({ queryKey: ["analytics-employees", params], queryFn: () => getEmployeeAnalytics(params) });
  const activityQ = useQuery({ queryKey: ["analytics-activity"], queryFn: () => getActivityFeed({ limit: 30 }) });

  const funnel = leadQ.data?.funnel?.funnel || [];
  const funnelKpis = leadQ.data?.funnel || {};
  const dailyTrends = leadQ.data?.trends?.daily || [];
  const sourceBreakdown = leadQ.data?.trends?.source_breakdown || [];
  const statusBreakdown = leadQ.data?.trends?.status_breakdown || [];

  const dealerData = dealerQ.data || {};
  const products = productQ.data?.products || [];
  const employees = employeeQ.data || [];
  const activity = activityQ.data || [];

  const funnelChart = useMemo(() =>
    funnel.filter(s => !["lost","closed"].includes(s.stage)).map(s => ({
      stage: pretty(s.stage), count: s.count, pct: s.percentage,
    })), [funnel]);

  const sourceChart = useMemo(() =>
    sourceBreakdown.map(s => ({ name: pretty(s.lead_source), value: s.count })), [sourceBreakdown]);

  const regionChart = useMemo(() =>
    (dealerData.regional_revenue || []).map(r => ({
      region: r.region, revenue: Number(r.total_revenue || 0), dealers: r.count,
    })), [dealerData]);

  const productChart = useMemo(() =>
    products.map(p => ({ sku: p.sku, demand: p.demand_score, inquiries: p.period_inquiries })), [products]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase text-red-300">Sales Intelligence</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Analytics Workbench</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Executive analytics for lead conversion, regional demand, dealer contribution, and product pull.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--sigma-border)] bg-white/5 p-1">
          {RANGES.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition ${range === r.value ? "bg-red-500 text-white" : "text-slate-400 hover:text-white"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Leads" value={funnelKpis.total_leads || 0} icon={FiUsers} tone="from-red-500 to-orange-400" />
        <KpiCard label="Conversion Rate" value={`${funnelKpis.conversion_rate || 0}%`} icon={FiTarget} tone="from-emerald-400 to-teal-300" />
        <KpiCard label="Active Dealers" value={dealerData.active_dealers || 0} icon={FiMap} tone="from-sky-400 to-cyan-300" />
        <KpiCard label="Follow-up Efficiency" value={`${employees.length ? Math.round(employees.reduce((s,e) => s + e.followup_efficiency, 0) / employees.length) : 0}%`} icon={FiZap} tone="from-amber-400 to-yellow-300" />
      </div>

      {/* Lead Trend + Source */}
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader title="Lead Acquisition Trend" subtitle="Daily new leads over selected period" icon={FiTrendingUp} />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} fill="url(#trendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Lead Sources" subtitle="Distribution by inquiry channel" icon={FiFilter} iconColor="text-amber-300" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {sourceChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {sourceChart.map((s, i) => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Funnel + Status */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title="Conversion Funnel" subtitle="Stage-by-stage lead progression" icon={FiActivity} />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChart} layout="vertical" barSize={20}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="stage" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={110} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, _, p) => [`${v} (${p.payload.pct}%)`, "Leads"]} />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 6, 6, 0]}>
                  {funnelChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Product Demand" subtitle="Inquiry volume vs demand score" icon={FiBarChart2} iconColor="text-amber-300" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productChart}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="sku" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="demand" fill="#ef4444" radius={[6, 6, 0, 0]} name="Demand Score" />
                <Bar dataKey="inquiries" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Inquiries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Regional Revenue + Employee */}
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader title="Regional Revenue" subtitle="Dealer revenue by territory" icon={FiMap} iconColor="text-sky-300" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionChart}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="region" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`Rs. ${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Employee Leaderboard" subtitle="Sales team performance ranking" icon={FiAward} iconColor="text-emerald-300" />
          <div className="overflow-hidden rounded-lg border border-[var(--sigma-border)]">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Leads</th>
                  <th className="px-4 py-3 font-medium">Conv.</th>
                  <th className="px-4 py-3 font-medium">F/U %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-200">
                {employees.length ? employees.slice(0, 8).map(emp => (
                  <tr key={emp.id}>
                    <td className="px-4 py-3 font-medium text-white">{emp.username}</td>
                    <td className="px-4 py-3">{emp.leads_assigned}</td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-300">{emp.conversion_rate}%</span>
                    </td>
                    <td className="px-4 py-3">{emp.followup_efficiency}%</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="px-4 py-6 text-slate-400">Employee metrics appear when leads are assigned.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader title="Recent Activity" subtitle="Latest system events across all modules" icon={FiCalendar} iconColor="text-violet-300" />
        <div className="grid gap-3 lg:grid-cols-2">
          {activity.length ? activity.slice(0, 12).map(event => (
            <div key={event.id} className="flex items-start gap-3 rounded-lg bg-white/5 p-3">
              <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{event.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{event.user_name} · {new Date(event.created_at).toLocaleString()}</p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-400 lg:col-span-2">Activity events will appear as the team captures leads and manages dealers.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
