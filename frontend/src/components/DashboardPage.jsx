import React from "react";
import { Outlet } from "react-router-dom";
import DashboardShell from "../layouts/DashboardShell";

const DashboardPage = () => {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
};

export default DashboardPage;
