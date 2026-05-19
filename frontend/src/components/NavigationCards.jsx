import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiMap, FiBox, FiCheckSquare, FiBell, FiShield, FiSettings, FiBarChart2,
} from "react-icons/fi";
import AuthContext from "../context/AuthContext";

const ROLE_ACCESS = {
  "super-admin": ["leads", "dealers", "products", "tasks", "analytics", "notifications", "audit", "settings"],
  "admin": ["leads", "dealers", "products", "tasks", "analytics", "notifications", "audit", "settings"],
  "sales-manager": ["leads", "dealers", "tasks", "analytics", "notifications", "audit", "settings"],
  "dealer-manager": ["leads", "dealers", "tasks", "notifications", "settings"],
  "sales-executive": ["leads", "tasks", "notifications", "settings"],
  "support-staff": ["leads", "notifications", "settings"],
};

const NAV_CARDS = [
  {
    id: "leads",
    title: "Leads",
    description: "Manage and track all customer leads",
    icon: FiUsers,
    path: "/dashboard/leads",
    color: "from-red-500 to-orange-400",
  },
  {
    id: "dealers",
    title: "Dealers",
    description: "Dealer network and territory management",
    icon: FiMap,
    path: "/dashboard/dealers",
    color: "from-sky-500 to-cyan-400",
  },
  {
    id: "products",
    title: "Products",
    description: "Product catalogue and demand tracking",
    icon: FiBox,
    path: "/dashboard/products",
    color: "from-amber-500 to-yellow-400",
  },
  {
    id: "tasks",
    title: "Tasks",
    description: "Assigned tasks and follow-up actions",
    icon: FiCheckSquare,
    path: "/dashboard/tasks",
    color: "from-violet-500 to-purple-400",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Real-time KPIs and performance metrics",
    icon: FiBarChart2,
    path: "/dashboard/analytics",
    color: "from-emerald-500 to-teal-400",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Alerts and in-app notifications",
    icon: FiBell,
    path: "/dashboard/notifications",
    color: "from-pink-500 to-rose-400",
  },
  {
    id: "audit",
    title: "Audit Log",
    description: "Immutable system activity trail",
    icon: FiShield,
    path: "/dashboard/audit",
    color: "from-slate-500 to-gray-400",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Account and system preferences",
    icon: FiSettings,
    path: "/dashboard/settings",
    color: "from-zinc-500 to-slate-400",
  },
];

const NavigationCards = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const userRole = user.role || "support-staff";
  const accessibleModules = ROLE_ACCESS[userRole] || [];

  const visibleCards = NAV_CARDS.filter((card) => accessibleModules.includes(card.id));

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Modules</h2>
        <p className="mt-1 text-sm text-slate-400">Quick access to all available features</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => navigate(card.path)}
              className="group rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5 text-left transition hover:border-red-400/50 hover:bg-[var(--sigma-surface)]"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                <Icon className="text-lg" />
              </div>
              <h3 className="font-semibold text-white">{card.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{card.description}</p>
              <p className="mt-3 text-xs font-medium text-red-300 group-hover:text-red-200">Go to →</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationCards;
