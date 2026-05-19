import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import AppProviders from "./app/providers/AppProviders.jsx";
import { router } from "./routes";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router}></RouterProvider>
    </AppProviders>
  </React.StrictMode>
);
