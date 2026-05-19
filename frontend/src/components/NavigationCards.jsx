import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { MODULES, ROLE_ACCESS } from "@shared/constants";

const COLOR_MAP = {
  leads: "from-red-500 to-orange-400",
  dealers: "from-sky-500 to-cyan-400",
  products: "from-amber-500 to-yellow-400",
  tasks: "from-violet-500 to-purple-400",
  analytics: "from-emerald-500 to-teal-400",
  notifications: "from-pink-500 to-rose-400",
  audit: "from-slate-500 to-gray-400",
  settings: "from-zinc-500 to-slate-400",
};

const NavigationCards = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const userRole = user.role || "support-staff";
  const accessibleModules = ROLE_ACCESS[userRole] || [];

  const visibleCards = MODULES.filter((card) => accessibleModules.includes(card.id));

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Modules</h2>
        <p className="mt-1 text-sm text-slate-400">Quick access to all available features</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          const color = COLOR_MAP[card.id] || "from-slate-500 to-gray-400";
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => navigate(card.path)}
              className="group rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5 text-left transition hover:border-red-400/50 hover:bg-[var(--sigma-surface)]"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}>
                <Icon className="text-lg" />
              </div>
              <h3 className="font-semibold text-white">{card.label}</h3>
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
