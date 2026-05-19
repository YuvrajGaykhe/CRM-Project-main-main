import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "sigma-ui-v2",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

export default useUiStore;
