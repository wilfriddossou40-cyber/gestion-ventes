import api from "./axios";

export async function getProduits(params = {}) {
  const { data } = await api.get("/produits", { params });
  return data;
}

export async function createProduit(produit) {
  const { data } = await api.post("/produits", produit);
  return data;
}

export async function updateProduit(id, produit) {
  const { data } = await api.put(`/produits/${id}`, produit);
  return data;
}

export async function deleteProduit(id) {
  return api.delete(`/produits/${id}`);
}
