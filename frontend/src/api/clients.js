import api from "./axios";

export async function getClients(params = {}) {
  const { data } = await api.get("/clients", { params });
  return data;
}

export async function createClient(client) {
  const { data } = await api.post("/clients", client);
  return data;
}

export async function updateClient(id, client) {
  const { data } = await api.put(`/clients/${id}`, client);
  return data;
}

export async function deleteClient(id) {
  return api.delete(`/clients/${id}`);
}
