import { pretty } from "./StatusBadge";

const COLOR_MAP = {
  /* Lead statuses */
  new: "bg-sky-500/15 text-sky-300",
  attempted_contact: "bg-amber-500/15 text-amber-300",
  contacted: "bg-indigo-500/15 text-indigo-300",
  interested: "bg-violet-500/15 text-violet-300",
  negotiation: "bg-fuchsia-500/15 text-fuchsia-300",
  dealer_assigned: "bg-cyan-500/15 text-cyan-300",
  converted: "bg-emerald-500/15 text-emerald-300",
  lost: "bg-red-500/15 text-red-300",
  closed: "bg-slate-500/15 text-slate-300",
  /* Dealer statuses */
  prospect: "bg-amber-500/15 text-amber-300",
  pending_approval: "bg-orange-500/15 text-orange-300",
  active: "bg-emerald-500/15 text-emerald-300",
  inactive: "bg-slate-500/15 text-slate-400",
  suspended: "bg-red-500/15 text-red-300",
  /* Task statuses */
  todo: "bg-slate-500/15 text-slate-300",
  in_progress: "bg-sky-500/15 text-sky-300",
  blocked: "bg-red-500/15 text-red-300",
  done: "bg-emerald-500/15 text-emerald-300",
  cancelled: "bg-zinc-500/15 text-zinc-400",
  /* Follow-up statuses */
  scheduled: "bg-indigo-500/15 text-indigo-300",
  completed: "bg-emerald-500/15 text-emerald-300",
  missed: "bg-red-500/15 text-red-300",
  rescheduled: "bg-amber-500/15 text-amber-300",
  /* Priority levels */
  low: "bg-slate-500/15 text-slate-300",
  medium: "bg-sky-500/15 text-sky-300",
  high: "bg-amber-500/15 text-amber-300",
  urgent: "bg-red-500/15 text-red-300",
  /* Dealer tiers */
  bronze: "bg-amber-700/15 text-amber-400",
  silver: "bg-slate-400/15 text-slate-300",
  gold: "bg-yellow-500/15 text-yellow-300",
  platinum: "bg-cyan-500/15 text-cyan-300",
  /* Notification types */
  lead_assignment: "bg-indigo-500/15 text-indigo-300",
  new_inquiry: "bg-sky-500/15 text-sky-300",
  followup_due: "bg-amber-500/15 text-amber-300",
  overdue_task: "bg-red-500/15 text-red-300",
  dealer_approval: "bg-emerald-500/15 text-emerald-300",
  system: "bg-slate-500/15 text-slate-300",
};

const PRIORITY_DOT = {
  low: "bg-slate-400",
  medium: "bg-sky-400",
  high: "bg-amber-400",
  urgent: "bg-red-400",
};

const SigmaBadge = ({ value, variant = "default", className = "" }) => {
  if (!value) return null;

  if (variant === "dot") {
    return (
      <span
        className={`inline-block h-2 w-2 rounded-full ${PRIORITY_DOT[value] || "bg-slate-400"} ${className}`}
        title={pretty(value)}
      />
    );
  }

  const colorClasses = COLOR_MAP[value] || "bg-white/10 text-slate-300";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colorClasses} ${className}`}
    >
      {pretty(value)}
    </span>
  );
};

export default SigmaBadge;
