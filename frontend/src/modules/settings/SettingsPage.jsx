import React, { useContext } from "react";
import { FiLock, FiMail, FiShield, FiUser } from "react-icons/fi";
import AuthContext from "../../context/AuthContext";
import Breadcrumb from "../../components/Breadcrumb";

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-4 rounded-lg bg-white/5 px-4 py-3">
    <Icon className="text-slate-400" />
    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-white">{value || "Not set"}</p>
    </div>
  </div>
);

const SettingsPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumb items={[{ label: "Settings" }]} showBackButton={false} />
      
      <div>
        <p className="text-xs uppercase text-red-300">Account</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Profile details, role information, and system preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-amber-400 text-2xl font-bold text-black">
              {user?.username ? user.username[0].toUpperCase() : "SA"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user?.username || "Sigma User"}</h2>
              <p className="mt-1 text-sm text-slate-400">{user?.email || "team@sigmaaudio.com"}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <InfoRow label="Username" value={user?.username} icon={FiUser} />
            <InfoRow label="Email" value={user?.email} icon={FiMail} />
            <InfoRow label="Role" value={user?.role || "Sales Executive"} icon={FiShield} />
            <InfoRow label="User ID" value={user?.user_id} icon={FiLock} />
          </div>
        </div>

        {/* Permissions & System Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-6">
            <h3 className="text-sm font-semibold text-white">Permissions</h3>
            <p className="mt-1 text-xs text-slate-400">Your role-based access scope</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(user?.permissions || ["*"]).map((perm, i) => (
                <span key={i} className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200">
                  {perm === "*" ? "Full Access" : perm}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-6">
            <h3 className="text-sm font-semibold text-white">System Information</h3>
            <p className="mt-1 text-xs text-slate-400">Platform details</p>
            <div className="mt-4 space-y-3">
              <InfoRow label="Platform" value="Sigma Audio Dealer & Sales Intelligence CRM" icon={FiShield} />
              <InfoRow label="Version" value="2.0.0 — Phase 4" icon={FiLock} />
              <InfoRow label="Environment" value={import.meta.env.MODE} icon={FiUser} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
