import api, { publicApi } from "./config";

export const getLaporan = (params) => api.get("/laporan", { params });

export const getDetailLaporan = (id) => api.get(`/laporan/${id}`);

// PUBLIC - untuk supir membuat laporan tanpa login
export const createLaporanPublic = (formData) =>
  publicApi.post("/laporan", formData);

// PROTECTED - untuk create laporan dengan auth
export const createLaporan = (formData) => api.post("/laporan", formData);

export const verifikasiLaporan = (id, data) =>
  api.post(`/laporan/${id}/verifikasi`, data);

export const deleteLaporan = (id) => api.delete(`/laporan/${id}`);
