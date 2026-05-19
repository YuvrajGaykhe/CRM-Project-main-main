import React, { Suspense, lazy } from "react";
import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";

import App from "../App.jsx";
import LoginPage from "../components/LoginPage.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import DashboardPage from "../components/DashboardPage.jsx";
import HeroPage from "../components/HeroPage.jsx";
import ProtectedRoute from "../app/routes/ProtectedRoute.jsx";

const Dashboard = lazy(() => import("../components/Dashboard.jsx"));
const LeadsListScreen = lazy(() => import("../modules/leads/screens/LeadsListScreen.jsx"));
const LeadsKanbanScreen = lazy(() => import("../modules/leads/screens/LeadsKanbanScreen.jsx"));
const DealersPage = lazy(() => import("../modules/dealers/DealersPage.jsx"));
const ProductsPage = lazy(() => import("../modules/products/ProductsPage.jsx"));
const SigmaTasksPage = lazy(() => import("../modules/tasks/SigmaTasksPage.jsx"));
const AnalyticsDashboard = lazy(() => import("../components/AnalyticsDashboard.jsx"));
const NotificationsPage = lazy(() => import("../modules/notifications/NotificationsPage.jsx"));
const AuditLogPage = lazy(() => import("../modules/audit/AuditLogPage.jsx"));
const SettingsPage = lazy(() => import("../modules/settings/SettingsPage.jsx"));

const SuspenseFallback = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      <p className="text-sm text-slate-400">Loading module...</p>
    </div>
  </div>
);

const LazyRoute = ({ children }) => (
  <Suspense fallback={<SuspenseFallback />}>{children}</Suspense>
);

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}>
        <Route index element={<HeroPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterForm />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />}>
            <Route index element={<LazyRoute><Dashboard /></LazyRoute>} />
            <Route path="leads" element={<LazyRoute><LeadsListScreen /></LazyRoute>} />
            <Route path="leads/kanban" element={<LazyRoute><LeadsKanbanScreen /></LazyRoute>} />
            <Route path="dealers" element={<LazyRoute><DealersPage /></LazyRoute>} />
            <Route path="products" element={<LazyRoute><ProductsPage /></LazyRoute>} />
            <Route path="tasks" element={<LazyRoute><SigmaTasksPage /></LazyRoute>} />
            <Route path="analytics" element={<LazyRoute><AnalyticsDashboard /></LazyRoute>} />
            <Route path="notifications" element={<LazyRoute><NotificationsPage /></LazyRoute>} />
            <Route path="audit" element={<LazyRoute><AuditLogPage /></LazyRoute>} />
            <Route path="settings" element={<LazyRoute><SettingsPage /></LazyRoute>} />
          </Route>
        </Route>
      </Route>
    </>
  )
);
