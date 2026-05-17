import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import AuthContext from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { authTokens } = useContext(AuthContext);
  const location = useLocation();

  if (!authTokens?.access) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
