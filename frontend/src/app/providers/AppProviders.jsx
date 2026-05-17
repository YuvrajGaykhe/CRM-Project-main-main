import React from "react";
import QueryProvider from "./QueryProvider";

const AppProviders = ({ children }) => {
  return <QueryProvider>{children}</QueryProvider>;
};

export default AppProviders;
