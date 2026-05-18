export const Card = ({ className = "", children, ...props }) => (
  <div
    className={`rounded-xl border border-white/10 bg-[var(--sigma-surface)]/90 shadow-[0_10px_24px_rgba(2,6,23,0.35)] ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
);
