import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  FiActivity, FiClock, FiMap, FiTarget, FiTrendingUp, FiUsers, FiZap,
} from "react-icons/fi";
import { getEnterpriseAnalytics } from "../services/api/crm";
import NavigationCards from "./NavigationCards";

const statusLabels = {
  new: "New", attempted_contact: "Attempted", contacted: "Contacted",
  interested: "Interested", negotiation: "Negotiation",
  dealer_assigned: "Dealer Assigned", converted: "Converted",
  lost: "Lost", closed: "Closed",
};

const fallback = {
  kpis: { total_leads: 0, leads_today: 0, pending_followups: 0, converted_leads: 0, conversion_rate: 0, monthly_revenue: 0, active_dealers: 0, open_tasks: 0, followup_efficiency: 0, overdue_followups: 0 },
  lead_funnel: {}, state_wise_leads: [], product_inquiries: [], dealer_ranking: [], activity_feed: [],
};

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");
const fmtCur = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const tooltipStyle = { background: "#11131d", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 12 };

const metricCards = [
  { key: "total_leads", label: "Total Leads", icon: FiUsers, tone: "from-red-500 to-orange-400" },
  { key: "pending_followups", label: "Pending Follow-ups", icon: FiClock, tone: "from-amber-400 to-yellow-300" },
  { key: "conversion_rate", label: "Conversion Rate", icon: FiTarget, suffix: "%", tone: "from-emerald-400 to-teal-300" },
  { key: "monthly_revenue", label: "Dealer Revenue", icon: FiTrendingUp, currency: true, tone: "from-sky-400 to-cyan-300" },
];

const Dashboard = () => {
  const { data = fallback, isLoading } = useQuery({
    queryKey: ["enterprise-analytics"],
    queryFn: getEnterpriseAnalytics,
    staleTime: 300_000,
  });

  const funnelData = Object.entries(data.lead_funnel || {}).map(([status, count]) => ({
    status: statusLabels[status] || status, count,
  }));
  const stateData = (data.state_wise_leads || []).map((item) => ({ state: item.state || "Unknown", leads: item.count }));
  const productData = (data.product_inquiries || []).map((item) => ({ name: item.sku, inquiries: item.inquiries }));
  const activity = data.activity_feed || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation Cards */}
      <NavigationCards />

      {/* Hero */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase text-red-300">Sigma Audio Command Center</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-white md:text-4xl">
                Dealer inquiry & sales intelligence cockpit
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Live operating view for website inquiries, WhatsApp demand, dealer performance, product interest, and regional sales execution across India.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-center">
                <p className="text-2xl font-semibold text-amber-200">{fmt(data.kpis.overdue_followups)}</p>
                <p className="text-xs text-amber-300/80">Overdue</p>
              </div>
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center">
                <p className="text-2xl font-semibold text-emerald-200">{data.kpis.followup_efficiency}%</p>
                <p className="text-xs text-emerald-300/80">F/U Rate</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-6">
          <p className="text-xs uppercase text-slate-400">Operations Pulse</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-semibold text-white">{fmt(data.kpis.leads_today)}</p>
              <p className="text-sm text-slate-400">Leads today</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">{fmt(data.kpis.active_dealers)}</p>
              <p className="text-sm text-slate-400">Active dealers</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">{fmt(data.kpis.open_tasks)}</p>
              <p className="text-sm text-slate-400">Open tasks</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">{fmt(data.kpis.converted_leads)}</p>
              <p className="text-sm text-slate-400">Converted</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const rawValue = data.kpis[card.key];
          const value = card.currency ? fmtCur(rawValue) : `${fmt(rawValue)}${card.suffix || ""}`;
          return (
            <div key={card.key} className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{isLoading ? "--" : value}</p>
                </div>
                <div className={`rounded-lg bg-gradient-to-br ${card.tone} p-3 text-black`}><Icon /></div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Funnel + Product */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-sm font-semibold text-white">Lead Funnel</p><p className="text-xs text-slate-400">Pipeline movement from inquiry to conversion</p></div>
            <FiActivity className="text-red-300" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData}>
                <defs><linearGradient id="leadFunnel" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} /></linearGradient></defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="status" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#f97316" fill="url(#leadFunnel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-sm font-semibold text-white">Product Demand</p><p className="text-xs text-slate-400">Inquiry split across Sigma amplifiers</p></div>
            <FiTarget className="text-amber-300" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productData} dataKey="inquiries" nameKey="name" innerRadius={58} outerRadius={90}>
                  {productData.map((entry, index) => (<Cell key={entry.name} fill={["#ef4444", "#f97316", "#f59e0b", "#22c55e"][index % 4]} />))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* State + Dealer + Activity */}
      <section className="grid gap-4 xl:grid-cols-[0.6fr_0.6fr_0.8fr]">
        <div className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-sm font-semibold text-white">State-wise Leads</p><p className="text-xs text-slate-400">Regional demand density</p></div>
            <FiMap className="text-sky-300" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="state" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="leads" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-sm font-semibold text-white">Dealer Performance</p><p className="text-xs text-slate-400">Top revenue contributors</p></div>
            <FiTrendingUp className="text-emerald-300" />
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {(data.dealer_ranking || []).length ? data.dealer_ranking.map((dealer, i) => (
              <div key={dealer.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-xs font-semibold text-red-200">{i + 1}</span>
                  <div><p className="text-sm font-medium text-white">{dealer.name}</p><p className="text-xs text-slate-400">{dealer.city}, {dealer.state}</p></div>
                </div>
                <p className="text-sm font-medium text-emerald-300">{fmtCur(dealer.revenue_generated)}</p>
              </div>
            )) : <p className="text-sm text-slate-400">Dealer data appears as sales activity is captured.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-sm font-semibold text-white">Live Activity</p><p className="text-xs text-slate-400">Recent CRM events</p></div>
            <FiZap className="text-violet-300" />
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {activity.length ? activity.map(event => (
              <div key={event.id} className="flex items-start gap-3 rounded-lg bg-white/5 px-3 py-2.5">
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{event.label}</p>
                  <p className="text-xs text-slate-500">{event.user_name} · {new Date(event.created_at).toLocaleString()}</p>
                </div>
              </div>
            )) : <p className="text-sm text-slate-400">Activity events will appear as the team works.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
