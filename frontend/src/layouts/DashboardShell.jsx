import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiActivity, FiBarChart2, FiBell, FiBox, FiLogOut,
  FiMap, FiHome, FiSearch, FiSettings, FiShield, FiX,
} from "react-icons/fi";
import { HiOutlineSignal } from "react-icons/hi2";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "../context/AuthContext";
import useUiStore from "../app/store/uiStore";
import { getUnreadNotificationCount, globalSearch } from "../services/api/crm";

const navItems = [
  { label: "Overview", to: "/dashboard", icon: FiHome },
  { label: "Leads", to: "/dashboard/leads", icon: HiOutlineSignal, permission: "leads" },
  { label: "Dealers", to: "/dashboard/dealers", icon: FiMap, permission: "dealers" },
  { label: "Products", to: "/dashboard/products", icon: FiBox, permission: "products" },
  { label: "Tasks", to: "/dashboard/tasks", icon: HiOutlineSignal, permission: "tasks" },
  { label: "Analytics", to: "/dashboard/analytics", icon: FiBarChart2, permission: "analytics" },
  { label: "Notifications", to: "/dashboard/notifications", icon: FiBell, permission: "notifications" },
  { label: "Audit Log", to: "/dashboard/audit", icon: FiShield, permission: "analytics" },
  { label: "Settings", to: "/dashboard/settings", icon: FiSettings },
];

const DashboardShell = ({ children }) => {
  const { logoutUser, user } = useContext(AuthContext);
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUiStore();
  const navigate = useNavigate();
  const permissions = user?.permissions || [];
  const canView = (permission) =>
    !permission ||
    permissions.includes("*") ||
    permissions.some((item) => item === `${permission}.view` || item.startsWith(`${permission}.`) || item.includes(`${permission}.`));
  const visibleNavItems = navItems.filter((item) => canView(item.permission));

  // Notification badge
  const { data: notifData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000,
  });
  const unreadCount = notifData?.unread_count || 0;

  // Global search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await globalSearch(searchQuery.trim());
        setSearchResults(data);
        setSearchOpen(true);
      } catch { setSearchResults(null); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleResultClick = (result) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(result.url);
  };

  const typeColors = { lead: "bg-red-400/20 text-red-200", dealer: "bg-sky-400/20 text-sky-200", product: "bg-amber-400/20 text-amber-200", task: "bg-violet-400/20 text-violet-200" };

  return (
    <div className="min-h-screen bg-[var(--sigma-bg)] bg-[linear-gradient(135deg,#08090f_0%,#10121b_48%,#171016_100%)] text-[var(--sigma-text)]">
      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-[var(--sigma-border)] bg-[var(--sigma-surface)]/95 backdrop-blur transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex h-full flex-col px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-[var(--sigma-bg)] text-lg font-semibold">SA</div>
              </div>
              <div>
                <p className="text-sm uppercase text-red-300">Sigma Audio</p>
                <p className="text-lg font-semibold">Dealer CRM</p>
              </div>
            </div>

            <div className="mt-8 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.to === "/dashboard"}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-red-500/20 text-red-200" : "text-slate-200/80 hover:bg-white/5 hover:text-white"}`
                    }>
                    <Icon className="text-lg" />
                    {item.label}
                    {item.label === "Notifications" && unreadCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-auto space-y-3">
              <div className="rounded-lg border border-[var(--sigma-border)] bg-white/5 p-4">
                <p className="text-xs uppercase text-slate-400">This Week</p>
                <p className="mt-2 text-sm font-semibold">Dealer Inquiry SLA</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Target 2h</span>
                  <span className="text-emerald-300">91%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-300" />
                </div>
              </div>
              <button type="button" onClick={logoutUser}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/20">
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex w-full flex-col md:pl-72">
          <header className="sticky top-0 z-30 border-b border-[var(--sigma-border)] bg-[var(--sigma-bg)]/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <button type="button" onClick={toggleSidebar}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--sigma-border)] bg-white/5 text-slate-200 md:hidden">
                  <FiActivity />
                </button>
                <div>
                  <p className="text-xs uppercase text-slate-400">Sigma Audio Intelligence</p>
                  <p className="text-lg font-semibold">Sales Command Center</p>
                </div>
              </div>

              {/* Global Search */}
              <div className="relative hidden md:block" ref={searchRef}>
                <div className="flex items-center gap-3 rounded-lg border border-[var(--sigma-border)] bg-white/5 px-4 py-2 text-sm text-slate-200">
                  <FiSearch className="text-base text-slate-400" />
                  <input type="text" value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults && setSearchOpen(true)}
                    placeholder="Search leads, dealers, products..."
                    className="w-64 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none" />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-slate-400 hover:text-white"><FiX size={14} /></button>
                  )}
                </div>
                {searchOpen && searchResults && (
                  <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)] shadow-2xl shadow-black/50">
                    <div className="px-4 py-3 text-xs text-slate-400">
                      {searchResults.results.length} results for "{searchResults.query}"
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                      {searchResults.results.length ? searchResults.results.map((result, i) => (
                        <button key={`${result.type}-${result.id}-${i}`} onClick={() => handleResultClick(result)}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/5">
                          <span className={`mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${typeColors[result.type] || "bg-white/10 text-slate-200"}`}>{result.type}</span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{result.title}</p>
                            <p className="truncate text-xs text-slate-400">{result.subtitle}</p>
                          </div>
                        </button>
                      )) : (
                        <p className="px-4 py-6 text-sm text-slate-400">No results found.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <NavLink to="/dashboard/notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--sigma-border)] bg-white/5 text-slate-200">
                  <FiBell />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
                  )}
                </NavLink>
                <div className="flex items-center gap-3 rounded-lg border border-[var(--sigma-border)] bg-white/5 px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-amber-400 text-sm font-semibold text-black">
                    {user?.username ? user.username[0].toUpperCase() : "SA"}
                  </div>
                  <div className="hidden text-left text-xs md:block">
                    <p className="font-semibold text-slate-100">{user?.username || "Sigma Team"}</p>
                    <p className="text-slate-400">{user?.role || "Sales"}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>

          <footer className="border-t border-[var(--sigma-border)] px-6 py-6 text-xs text-slate-500">
            Sigma Audio Dealer & Sales Intelligence Platform
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
