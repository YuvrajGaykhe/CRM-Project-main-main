import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert2";

import apiClient from "../services/api/client";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCurrentUser = useCallback(async () => {
    const response = await apiClient.get("/auth/me/");
    setUser(response.data);
    setIsAuthenticated(true);
    return response.data;
  }, []);

  const loginUser = async (email, password) => {
    try {
      const response = await apiClient.post("/token/", { email, password });
      if (response.status === 200) {
        await fetchCurrentUser();
        navigate("/dashboard");
        swal.fire({
          title: "Login Success",
          icon: "success",
          toast: true,
          timer: 6000,
          position: "top-right",
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }
    } catch (error) {
      // Handled by error toast below.
    }

    swal.fire({
      title: "Email - Password does not exist",
      icon: "error",
      toast: true,
      timer: 6000,
      position: "top-right",
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  const registerUser = async (
    full_name,
    email,
    username,
    password,
    password2
  ) => {
    try {
      const response = await apiClient.post("/register/", {
        full_name,
        email,
        username,
        password,
        password2,
      });
      if (response.status === 201) {
        navigate("/login");
        swal.fire({
          title: "Registration Success",
          icon: "success",
          toast: true,
          timer: 6000,
          position: "top-right",
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }
    } catch (error) {
      // Handled by error toast below.
    }

    swal.fire({
      title: "There was a server error",
      icon: "error",
      toast: true,
      timer: 6000,
      position: "top-right",
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  const logoutUser = async () => {
    try {
      await apiClient.post("/token/logout/", {});
    } catch (error) {
      // Always clear local auth state, even if logout endpoint fails.
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
      swal.fire({
        title: "You have been logged out",
        icon: "success",
        toast: true,
        timer: 6000,
        position: "top-right",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await fetchCurrentUser();
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    bootstrapAuth();
  }, [fetchCurrentUser]);

  const contextData = {
    user,
    setUser,
    isAuthenticated,
    authTokens: isAuthenticated ? { access: true } : null,
    registerUser,
    loginUser,
    logoutUser,
    refreshUser: fetchCurrentUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
