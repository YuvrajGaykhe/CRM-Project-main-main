import { useEffect, useRef, useState } from "react";
import { FiArrowUp, FiArrowDown, FiMinus } from "react-icons/fi";

const useCountUp = (target, duration = 800) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const numTarget = Number(target) || 0;
    startRef.current = null;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * numTarget));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
};

const TREND_ICONS = {
  up: FiArrowUp,
  down: FiArrowDown,
  neutral: FiMinus,
};

const TREND_COLORS = {
  up: "text-emerald-400",
  down: "text-red-400",
  neutral: "text-slate-500",
};

const SigmaStatCard = ({
  label,
  value,
  icon: Icon,
  iconColor = "from-indigo-500 to-violet-500",
  trend,
  trendDirection = "neutral",
  suffix = "",
  prefix = "",
  className = "",
}) => {
  const animatedValue = useCountUp(value);
  const TrendIcon = TREND_ICONS[trendDirection] || TREND_ICONS.neutral;
  const trendColor = TREND_COLORS[trendDirection] || TREND_COLORS.neutral;

  return (
    <div
      className={`rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5 transition-colors hover:border-slate-700 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-medium text-white">
            {prefix}
            {animatedValue}
            {suffix}
          </p>
          {trend !== undefined && trend !== null && (
            <div className={`mt-1.5 flex items-center gap-1 text-xs ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${iconColor} text-white`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SigmaStatCard;
