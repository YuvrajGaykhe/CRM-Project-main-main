import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SigmaDrawer = ({
  open = false,
  onClose,
  title,
  subtitle,
  width = "max-w-lg",
  children,
  className = "",
}) => {
  const handleEsc = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[var(--sigma-border)] bg-[var(--sigma-bg)] shadow-2xl ${width} ${className}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--sigma-border)] px-6 py-4">
              <div className="min-w-0">
                {title && (
                  <h2 className="truncate text-lg font-medium text-white">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-0.5 truncate text-sm text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="ml-4 rounded-md p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Close drawer"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default SigmaDrawer;
