import React from "react";

const tones = {
  new: "bg-sky-400/10 text-sky-200",
  attempted_contact: "bg-violet-400/10 text-violet-200",
  contacted: "bg-emerald-400/10 text-emerald-200",
  interested: "bg-amber-400/10 text-amber-200",
  negotiation: "bg-orange-400/10 text-orange-200",
  dealer_assigned: "bg-cyan-400/10 text-cyan-200",
  converted: "bg-green-400/10 text-green-200",
  lost: "bg-red-400/10 text-red-200",
  closed: "bg-slate-400/10 text-slate-200",
  active: "bg-green-400/10 text-green-200",
  pending_approval: "bg-amber-400/10 text-amber-200",
  prospect: "bg-sky-400/10 text-sky-200",
  suspended: "bg-red-400/10 text-red-200",
  done: "bg-green-400/10 text-green-200",
  todo: "bg-sky-400/10 text-sky-200",
  scheduled: "bg-amber-400/10 text-amber-200",
  completed: "bg-green-400/10 text-green-200",
};

export const pretty = (value) => (value || "").replaceAll("_", " ");

const StatusBadge = ({ value }) => (
  <span className={`rounded-md px-2 py-1 text-xs capitalize ${tones[value] || "bg-white/10 text-slate-200"}`}>
    {pretty(value)}
  </span>
);

export default StatusBadge;
