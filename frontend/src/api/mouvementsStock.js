import api from "./axios";
import { invalidateDashboard } from "./dashboard";

export async function getMouvementsStock(params = {}) {
  const { data } = await api.get("/mouvements-stock", { params });
  return data;
}

export async function createMouvementStock(mouvement) {
  const { data } = await api.post("/mouvements-stock", mouvement);
  invalidateDashboard();
  return data;
}
