import React from "react";

const EmptyState = ({ action, children, title }) => (
  <div className="rounded-lg border border-dashed border-[var(--sigma-border)] bg-white/5 p-6 text-center">
    <p className="font-semibold text-white">{title}</p>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{children}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

export default EmptyState;
