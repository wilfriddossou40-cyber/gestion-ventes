import api from "./axios";

export const DASHBOARD_INVALIDATED_EVENT = "dashboard:invalidated";

export async function getDashboard() {
  const { data } = await api.get("/dashboard");
  return data;
}

export function invalidateDashboard() {
  window.dispatchEvent(new Event(DASHBOARD_INVALIDATED_EVENT));
}
