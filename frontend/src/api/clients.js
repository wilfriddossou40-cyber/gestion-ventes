import api from "./axios";
import { invalidateDashboard } from "./dashboard";

export async function getClients(params = {}) {
  const { data } = await api.get("/clients", { params });
  return data;
}

export async function createClient(client) {
  const { data } = await api.post("/clients", client);
  invalidateDashboard();
  return data;
}

export async function updateClient(id, client) {
  const { data } = await api.put(`/clients/${id}`, client);
  invalidateDashboard();
  return data;
}

export async function deleteClient(id) {
  const response = await api.delete(`/clients/${id}`);
  invalidateDashboard();
  return response;
}
