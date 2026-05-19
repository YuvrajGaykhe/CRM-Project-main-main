import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SigmaDropdown = ({
  trigger,
  items = [],
  align = "right",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    const actionableItems = items.filter((i) => !i.divider && !i.disabled);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev + 1;
          return next >= actionableItems.length ? 0 : next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? actionableItems.length - 1 : next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && actionableItems[activeIndex]) {
          actionableItems[activeIndex].onClick?.();
          close();
        }
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      default:
        break;
    }
  };

  const alignClass =
    align === "left" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0";

  let actionIndex = -1;

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex ${className}`}
      onKeyDown={handleKeyDown}
    >
      <div onClick={() => setOpen((prev) => !prev)} role="button" tabIndex={0}>
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className={`absolute top-full z-50 mt-1 min-w-[180px] rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface-raised)] p-1 shadow-xl ${alignClass}`}
          >
            {items.map((item, i) => {
              if (item.divider) {
                return (
                  <div
                    key={`div-${i}`}
                    className="my-1 h-px bg-[var(--sigma-border)]"
                  />
                );
              }

              actionIndex += 1;
              const currentActionIndex = actionIndex;
              const isActive = currentActionIndex === activeIndex;

              return (
                <button
                  key={item.id || item.label || i}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.();
                    close();
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors
                    ${item.danger ? "text-red-300 hover:bg-red-500/10" : "text-slate-200 hover:bg-white/5"}
                    ${item.disabled ? "opacity-40 pointer-events-none" : ""}
                    ${isActive ? (item.danger ? "bg-red-500/10" : "bg-white/5") : ""}`}
                >
                  {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                  <span className="truncate">{item.label}</span>
                  {item.shortcut && (
                    <span className="ml-auto text-xs text-slate-500">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SigmaDropdown;
