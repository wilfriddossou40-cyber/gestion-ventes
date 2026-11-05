import api from "./axios";
import { invalidateDashboard } from "./dashboard";

export async function getCategories() {
  const { data } = await api.get("/categories");
  return data;
}

export async function createCategorie(categorie) {
  const { data } = await api.post("/categories", categorie);
  invalidateDashboard();
  return data;
}

export async function updateCategorie(id, categorie) {
  const { data } = await api.put(`/categories/${id}`, categorie);
  invalidateDashboard();
  return data;
}

export async function deleteCategorie(id) {
  const response = await api.delete(`/categories/${id}`);
  invalidateDashboard();
  return response;
}
