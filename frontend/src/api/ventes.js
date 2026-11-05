import api from "./axios";

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
  return data;
}

export async function deleteVente(id) {
  return api.delete(`/ventes/${id}`);
}
