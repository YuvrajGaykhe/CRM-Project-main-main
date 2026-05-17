import React from "react";

export const Field = ({ label, children }) => (
  <label className="block text-sm">
    <span className="text-slate-400">{label}</span>
    <div className="mt-2">{children}</div>
  </label>
);

export const inputClass =
  "w-full rounded-lg border border-[var(--sigma-border)] bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-red-400";

export const Input = (props) => <input {...props} className={`${inputClass} ${props.className || ""}`} />;

export const Textarea = (props) => (
  <textarea {...props} className={`${inputClass} min-h-24 resize-y ${props.className || ""}`} />
);

export const Select = ({ children, ...props }) => (
  <select {...props} className={`${inputClass} ${props.className || ""}`}>
    {children}
  </select>
);

export const ActionButton = ({ children, tone = "primary", ...props }) => {
  const tones = {
    primary: "bg-red-500 text-white hover:bg-red-400",
    secondary: "border border-[var(--sigma-border)] bg-white/5 text-slate-200 hover:bg-white/10",
    success: "bg-emerald-500 text-black hover:bg-emerald-400",
  };

  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${props.className || ""}`}
    >
      {children}
    </button>
  );
};
