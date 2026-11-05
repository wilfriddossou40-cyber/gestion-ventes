import api from "./axios";

export async function getCategories() {
  const { data } = await api.get("/categories");
  return data;
}

export async function createCategorie(categorie) {
  const { data } = await api.post("/categories", categorie);
  return data;
}

export async function updateCategorie(id, categorie) {
  const { data } = await api.put(`/categories/${id}`, categorie);
  return data;
}

export async function deleteCategorie(id) {
  return api.delete(`/categories/${id}`);
}
