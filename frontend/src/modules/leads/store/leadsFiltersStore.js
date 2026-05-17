import { create } from "zustand";
import { persist } from "zustand/middleware";

const useLeadsFiltersStore = create(
  persist(
    (set) => ({
      search: "",
      status: "",
      source: "",
      sortBy: "updated_at",
      sortDirection: "desc",
      setFilter: (key, value) => set({ [key]: value }),
      setFilters: (next) => set(next),
      resetFilters: () =>
        set({
          search: "",
          status: "",
          source: "",
          sortBy: "updated_at",
          sortDirection: "desc",
        }),
    }),
    {
      name: "leads-filters-v1",
      partialize: (state) => ({
        search: state.search,
        status: state.status,
        source: state.source,
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
      }),
    }
  )
);

export default useLeadsFiltersStore;
