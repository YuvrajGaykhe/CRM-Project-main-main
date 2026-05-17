import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import useLeadsFiltersStore from "../store/leadsFiltersStore";

const ALLOWED_SORTS = [
  "updated_at",
  "created_at",
  "full_name",
  "next_followup_at",
  "status",
];

const useLeadsFiltersSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hydratedRef = useRef(false);

  const {
    search,
    source,
    status,
    sortBy,
    sortDirection,
    setFilters,
    setFilter,
    resetFilters,
  } = useLeadsFiltersStore();

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const nextSortBy = searchParams.get("sortBy");
    const nextSortDirection = searchParams.get("sortDirection");

    setFilters({
      search: searchParams.get("search") || search,
      status: searchParams.get("status") || status,
      source: searchParams.get("source") || source,
      sortBy: ALLOWED_SORTS.includes(nextSortBy) ? nextSortBy : sortBy,
      sortDirection: nextSortDirection === "asc" ? "asc" : sortDirection,
    });
  }, [searchParams, setFilters, search, source, status, sortBy, sortDirection]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const next = new URLSearchParams(searchParams);

    const sync = (key, value, fallback = "") => {
      if (value && value !== fallback) next.set(key, value);
      else next.delete(key);
    };

    sync("search", search);
    sync("status", status);
    sync("source", source);
    sync("sortBy", sortBy, "updated_at");
    sync("sortDirection", sortDirection, "desc");

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [
    search,
    source,
    status,
    sortBy,
    sortDirection,
    searchParams,
    setSearchParams,
  ]);

  const queryParams = useMemo(
    () => ({
      page_size: 100,
      search: search || undefined,
      status: status || undefined,
      source: source || undefined,
      ordering: `${sortDirection === "desc" ? "-" : ""}${sortBy}`,
    }),
    [search, source, status, sortBy, sortDirection]
  );

  return {
    filters: { search, source, status, sortBy, sortDirection },
    setFilter,
    resetFilters,
    queryParams,
  };
};

export default useLeadsFiltersSync;
