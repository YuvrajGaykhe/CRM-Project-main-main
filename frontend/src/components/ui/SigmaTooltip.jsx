import { useState, useRef } from "react";

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const SigmaTooltip = ({
  content,
  position = "top",
  children,
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  const show = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 200);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  if (!content) return children;

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-[var(--sigma-surface-raised)] px-2.5 py-1.5 text-xs text-slate-200 shadow-lg border border-[var(--sigma-border)] animate-scale-in
            ${positionClasses[position] || positionClasses.top}`}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default SigmaTooltip;
