import { apiClient } from "./index";

const unwrap = (response) => response.data;

export const getContacts = async () => {
  const response = await apiClient.get("/contacts/");
  return response.data;
};

export const getRecords = async () => {
  const response = await apiClient.get("/records/");
  return response.data;
};

export const getTasks = async () => {
  const response = await apiClient.get("/tasks/");
  return response.data;
};

export const getUsers = async () => {
  const response = await apiClient.get("/users/");
  return response.data;
};

export const getAnalytics = async () => {
  const response = await apiClient.get("/analytics/");
  return response.data;
};

export const getMe = async () => unwrap(await apiClient.get("/auth/me/"));

export const getEnterpriseUsers = async (params = {}) =>
  unwrap(await apiClient.get("/v1/users/", { params }));

export const getEnterpriseAnalytics = async () =>
  unwrap(await apiClient.get("/v1/analytics/overview/"));

// --- Lead APIs ---

export const getLeads = async (params = {}) =>
  unwrap(await apiClient.get("/v1/leads/", { params }));

export const getLeadById = async (id) =>
  unwrap(await apiClient.get(`/v1/leads/${id}/`));

export const createLead = async (payload) =>
  unwrap(await apiClient.post("/v1/leads/", payload));

export const updateLead = async (id, payload) =>
  unwrap(await apiClient.patch(`/v1/leads/${id}/`, payload));

export const moveLead = async (id, status) =>
  unwrap(await apiClient.post(`/v1/leads/${id}/move/`, { status }));

export const assignLeadDealer = async (id, dealerId) =>
  unwrap(await apiClient.post(`/v1/leads/${id}/assign_dealer/`, { dealer_id: dealerId }));

export const getLeadTimeline = async (id) =>
  unwrap(await apiClient.get(`/v1/leads/${id}/timeline/`));

export const addLeadNote = async (id, payload) =>
  unwrap(await apiClient.post(`/v1/leads/${id}/notes/`, payload));

export const getLeadNotes = async (id) =>
  unwrap(await apiClient.get(`/v1/leads/${id}/notes/`));

export const exportLeadsCSV = async (params = {}) => {
  const response = await apiClient.get("/v1/leads/export_csv/", {
    params,
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "sigma_leads_export.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const importLeadsCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return unwrap(
    await apiClient.post("/v1/leads/import_csv/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

// --- Dealer APIs ---

export const getDealers = async (params = {}) =>
  unwrap(await apiClient.get("/v1/dealers/", { params }));

export const createDealer = async (payload) =>
  unwrap(await apiClient.post("/v1/dealers/", payload));

export const updateDealer = async (id, payload) =>
  unwrap(await apiClient.patch(`/v1/dealers/${id}/`, payload));

export const approveDealer = async (id) =>
  unwrap(await apiClient.post(`/v1/dealers/${id}/approve/`));

// --- Product APIs ---

export const getProducts = async (params = {}) =>
  unwrap(await apiClient.get("/v1/products/", { params }));

export const createProduct = async (payload) =>
  unwrap(await apiClient.post("/v1/products/", payload));

export const updateProduct = async (id, payload) =>
  unwrap(await apiClient.patch(`/v1/products/${id}/`, payload));

// --- Task APIs ---

export const getSigmaTasks = async (params = {}) =>
  unwrap(await apiClient.get("/v1/tasks/", { params }));

export const createSigmaTask = async (payload) =>
  unwrap(await apiClient.post("/v1/tasks/", payload));

export const updateSigmaTask = async (id, payload) =>
  unwrap(await apiClient.patch(`/v1/tasks/${id}/`, payload));

export const completeSigmaTask = async (id) =>
  unwrap(await apiClient.post(`/v1/tasks/${id}/complete/`));

// --- Follow-up APIs ---

export const getFollowups = async (params = {}) =>
  unwrap(await apiClient.get("/v1/followups/", { params }));

export const createFollowup = async (payload) =>
  unwrap(await apiClient.post("/v1/followups/", payload));

export const updateFollowup = async (id, payload) =>
  unwrap(await apiClient.patch(`/v1/followups/${id}/`, payload));

export const completeFollowup = async (id, outcome = "") =>
  unwrap(await apiClient.post(`/v1/followups/${id}/complete/`, { outcome }));

// --- Notification APIs ---

export const getNotifications = async (params = {}) =>
  unwrap(await apiClient.get("/v1/notifications/", { params }));

export const markNotificationRead = async (id) =>
  unwrap(await apiClient.post(`/v1/notifications/${id}/read/`));

export const markAllNotificationsRead = async () =>
  unwrap(await apiClient.post("/v1/notifications/mark_all_read/"));

export const getUnreadNotificationCount = async () =>
  unwrap(await apiClient.get("/v1/notifications/unread_count/"));

// --- Analytics APIs (Phase 3) ---

export const getLeadAnalytics = async (params = {}) =>
  unwrap(await apiClient.get("/v1/analytics/leads/", { params }));

export const getDealerAnalytics = async (params = {}) =>
  unwrap(await apiClient.get("/v1/analytics/dealers/", { params }));

export const getProductAnalytics = async (params = {}) =>
  unwrap(await apiClient.get("/v1/analytics/products/", { params }));

export const getEmployeeAnalytics = async (params = {}) =>
  unwrap(await apiClient.get("/v1/analytics/employees/", { params }));

export const getActivityFeed = async (params = {}) =>
  unwrap(await apiClient.get("/v1/analytics/activity/", { params }));

// --- Global Search (Phase 3) ---

export const globalSearch = async (query) =>
  unwrap(await apiClient.get("/v1/search/", { params: { q: query } }));

// --- Audit Logs (Phase 4) ---

export const getAuditLogs = async (params = {}) =>
  unwrap(await apiClient.get("/v1/audit-logs/", { params }));
