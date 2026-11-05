import api from "./axios";
import { invalidateDashboard } from "./dashboard";

export async function getVentes(params = {}) {
  const { data } = await api.get("/ventes", { params });
  return data;
}

export async function getVente(id) {
  const { data } = await api.get(`/ventes/${id}`);
  return data;
}

export async function createVente(vente) {
  const { data } = await api.post("/ventes", vente);
  invalidateDashboard();
  return data;
}

export async function deleteVente(id) {
  const response = await api.delete(`/ventes/${id}`);
  invalidateDashboard();
  return response;
}
