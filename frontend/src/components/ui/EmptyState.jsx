import { FiInbox } from "react-icons/fi";
import SigmaButton from "./SigmaButton";

const EmptyState = ({
  title = "No data found",
  icon: Icon = FiInbox,
  subtitle,
  children,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--sigma-border)] bg-[var(--sigma-surface)]/40 px-6 py-12 text-center ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {(subtitle || children) && (
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          {subtitle || children}
        </p>
      )}
      {actionLabel && onAction && (
        <SigmaButton variant="secondary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </SigmaButton>
      )}
    </div>
  );
};

export default EmptyState;
