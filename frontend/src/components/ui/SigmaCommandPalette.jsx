import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUsers, FiMap, FiBox, FiCheckSquare, FiArrowRight, FiCommand } from "react-icons/fi";
import { globalSearch } from "../../services/api/crm";

const RECENT_KEY = "sigma-cmd-recent";
const MAX_RECENT = 6;

const TYPE_CONFIG = {
  lead: { icon: FiUsers, label: "Leads", color: "text-sky-300", basePath: "/dashboard/leads" },
  dealer: { icon: FiMap, label: "Dealers", color: "text-emerald-300", basePath: "/dashboard/dealers" },
  product: { icon: FiBox, label: "Products", color: "text-amber-300", basePath: "/dashboard/products" },
  task: { icon: FiCheckSquare, label: "Tasks", color: "text-violet-300", basePath: "/dashboard/tasks" },
};

const SHORTCUTS = [
  { label: "Go to Leads", path: "/dashboard/leads", shortcut: "G L" },
  { label: "Go to Dealers", path: "/dashboard/dealers", shortcut: "G D" },
  { label: "Go to Analytics", path: "/dashboard/analytics", shortcut: "G A" },
  { label: "Go to Settings", path: "/dashboard/settings", shortcut: "G S" },
];

const getRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};

const addRecent = (item) => {
  const current = getRecent().filter((r) => r.id !== item.id);
  current.unshift(item);
  localStorage.setItem(RECENT_KEY, JSON.stringify(current.slice(0, MAX_RECENT)));
};

const SigmaCommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await globalSearch(query);
        const items = data?.results || data || [];
        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const allItems = useMemo(() => {
    if (query.trim()) {
      return results.map((r) => ({
        id: r.id || `${r.type}-${r.entity_id}`,
        label: r.title || r.name || r.full_name || r.lead_id || "Untitled",
        sublabel: r.type || r.entity_type || "",
        type: r.type || r.entity_type || "lead",
        path: null,
        raw: r,
      }));
    }

    const recent = getRecent();
    if (recent.length) {
      return [
        ...recent.map((r) => ({ ...r, section: "Recent" })),
        ...SHORTCUTS.map((s) => ({
          id: s.path,
          label: s.label,
          sublabel: s.shortcut,
          type: "shortcut",
          path: s.path,
          section: "Shortcuts",
        })),
      ];
    }

    return SHORTCUTS.map((s) => ({
      id: s.path,
      label: s.label,
      sublabel: s.shortcut,
      type: "shortcut",
      path: s.path,
      section: "Shortcuts",
    }));
  }, [query, results]);

  const handleSelect = useCallback(
    (item) => {
      setOpen(false);
      if (item.path) {
        navigate(item.path);
        return;
      }
      const config = TYPE_CONFIG[item.type];
      if (config) {
        addRecent({ id: item.id, label: item.label, sublabel: item.sublabel, type: item.type });
        navigate(config.basePath);
      }
    },
    [navigate]
  );

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(allItems.length, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + allItems.length) % Math.max(allItems.length, 1));
        break;
      case "Enter":
        e.preventDefault();
        if (allItems[activeIndex]) handleSelect(allItems[activeIndex]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-[15%] z-[61] w-full max-w-xl -translate-x-1/2 rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)] shadow-2xl"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-[var(--sigma-border)] px-4 py-3">
              <FiSearch className="h-5 w-5 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search leads, dealers, products, tasks..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              <kbd className="hidden rounded border border-[var(--sigma-border)] bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500 sm:inline">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--sigma-accent)] border-t-transparent" />
                </div>
              )}

              {!loading && query.trim() && allItems.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-500">
                  No results found for "{query}"
                </div>
              )}

              {!loading &&
                allItems.map((item, idx) => {
                  const config = TYPE_CONFIG[item.type];
                  const Icon = config?.icon || FiArrowRight;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition
                        ${idx === activeIndex ? "bg-white/5 text-white" : "text-slate-300 hover:bg-white/5"}`}
                    >
                      <Icon
                        className={`h-4 w-4 flex-shrink-0 ${config?.color || "text-slate-400"}`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.sublabel && (
                        <span className="text-xs text-slate-500">
                          {item.sublabel}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[var(--sigma-border)] px-4 py-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <FiCommand className="h-3 w-3" />
                <span>Navigate with ↑ ↓ and Enter</span>
              </div>
              <span>⌘K to toggle</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SigmaCommandPalette;
