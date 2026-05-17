import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const storedTokens = localStorage.getItem("authTokens");
  if (storedTokens) {
    const tokens = JSON.parse(storedTokens);
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const storedTokens = localStorage.getItem("authTokens");

      if (storedTokens) {
        const tokens = JSON.parse(storedTokens);
        if (tokens?.refresh) {
          try {
            const refreshResponse = await axios.post(
              `${apiClient.defaults.baseURL}/token/refresh/`,
              { refresh: tokens.refresh }
            );
            const nextTokens = {
              ...tokens,
              ...refreshResponse.data,
            };
            localStorage.setItem("authTokens", JSON.stringify(nextTokens));
            originalRequest.headers.Authorization = `Bearer ${nextTokens.access}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem("authTokens");
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
