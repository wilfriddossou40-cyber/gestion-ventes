import api from "./axios";
import { invalidateDashboard } from "./dashboard";

export async function getProduits(params = {}) {
  const { data } = await api.get("/produits", { params });
  return data;
}

export async function getProduitsAlertes() {
  const { data } = await api.get("/produits/alertes");
  return data;
}

export async function createProduit(produit) {
  const { data } = await api.post("/produits", produit);
  invalidateDashboard();
  return data;
}

export async function updateProduit(id, produit) {
  const { data } = await api.put(`/produits/${id}`, produit);
  invalidateDashboard();
  return data;
}

export async function deleteProduit(id) {
  const response = await api.delete(`/produits/${id}`);
  invalidateDashboard();
  return response;
}
