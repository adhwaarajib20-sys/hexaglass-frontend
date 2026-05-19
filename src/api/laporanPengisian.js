// src/api/laporanPengisian.js
import api from "./config";

export const getLaporanPengisian = () => api.get("/laporan-pengisian");

export const getLaporanPengisianDetail = (id) =>
  api.get(`/laporan-pengisian/${id}`);

export const updateLaporanPengisian = (id, data) =>
  api.put(`/laporan-pengisian/${id}`, data);

export const deleteLaporanPengisian = (id) =>
  api.delete(`/laporan-pengisian/${id}`);

export const getStatistikLaporan = (bulan, tahun) =>
  api.get(`/laporan-pengisian/statistik/${bulan ?? ""}/${tahun ?? ""}`);
