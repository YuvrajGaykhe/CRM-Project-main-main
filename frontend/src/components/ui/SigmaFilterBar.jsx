import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { Select } from "./SigmaForm";

const SigmaFilterBar = ({
  filters = [],
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onClearAll,
  className = "",
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange?.(val);
    }, 300);
  };

  const activeCount = filters.filter((f) => f.value).length + (searchValue ? 1 : 0);

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-3 ${className}`}
    >
      {/* Search */}
      {onSearchChange && (
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--sigma-border)] bg-white/5 px-3 py-2 text-sm text-slate-300 min-w-[200px]">
          <FiSearch className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <input
            value={localSearch}
            onChange={handleSearchInput}
            className="w-full bg-transparent outline-none placeholder:text-slate-500"
            placeholder={searchPlaceholder}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="text-slate-400 hover:text-white"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      )}

      {/* Filter selects */}
      {filters.map((filter) => (
        <div key={filter.key} className="min-w-[140px]">
          <Select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      ))}

      {/* Clear all */}
      {activeCount > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <FiX className="h-3 w-3" />
          Clear ({activeCount})
        </button>
      )}
    </div>
  );
};

export default SigmaFilterBar;
