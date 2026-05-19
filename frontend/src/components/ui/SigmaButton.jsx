import { forwardRef } from "react";

const variants = {
  primary:
    "bg-[var(--sigma-accent)] text-white hover:bg-[var(--sigma-accent-hover)] focus-visible:ring-[var(--sigma-accent)]/40",
  secondary:
    "border border-[var(--sigma-border)] bg-white/5 text-slate-200 hover:bg-white/10 focus-visible:ring-white/20",
  ghost:
    "text-slate-300 hover:bg-white/5 hover:text-white focus-visible:ring-white/20",
  danger:
    "bg-red-500/90 text-white hover:bg-red-500 focus-visible:ring-red-500/40",
  success:
    "bg-emerald-500/90 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500/40",
};

const sizes = {
  xs: "px-2 py-1 text-xs gap-1",
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-sm gap-2",
};

const SigmaButton = forwardRef(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150
          focus-visible:outline-none focus-visible:ring-2
          disabled:opacity-50 disabled:pointer-events-none
          ${variants[variant] || variants.primary}
          ${sizes[size] || sizes.md}
          ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-75"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

SigmaButton.displayName = "SigmaButton";

export default SigmaButton;
