// src/api/perusahaan.js
import api from "./config";

export const getPerusahaan = () => api.get("/perusahaan");

export const createPerusahaan = (data) => api.post("/perusahaan", data);

export const getPerusahaanDetail = (id) => api.get(`/perusahaan/${id}`);

export const updatePerusahaan = (id, data) =>
  api.put(`/perusahaan/${id}`, data);

export const deletePerusahaan = (id) => api.delete(`/perusahaan/${id}`);
