import {
  FiUsers,
  FiMap,
  FiBox,
  FiCheckSquare,
  FiBarChart2,
  FiBell,
  FiShield,
  FiSettings,
} from "react-icons/fi";

export const MODULES = [
  {
    id: "leads",
    label: "Leads",
    description: "Manage and track all customer leads",
    path: "/dashboard/leads",
    icon: FiUsers,
  },
  {
    id: "dealers",
    label: "Dealers",
    description: "Dealer network and territory management",
    path: "/dashboard/dealers",
    icon: FiMap,
  },
  {
    id: "products",
    label: "Products",
    description: "Product catalogue and demand tracking",
    path: "/dashboard/products",
    icon: FiBox,
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Assigned tasks and follow-up actions",
    path: "/dashboard/tasks",
    icon: FiCheckSquare,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Real-time KPIs and performance metrics",
    path: "/dashboard/analytics",
    icon: FiBarChart2,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and in-app notifications",
    path: "/dashboard/notifications",
    icon: FiBell,
  },
  {
    id: "audit",
    label: "Audit Log",
    description: "Immutable system activity trail",
    path: "/dashboard/audit",
    icon: FiShield,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Account and system preferences",
    path: "/dashboard/settings",
    icon: FiSettings,
  },
];
