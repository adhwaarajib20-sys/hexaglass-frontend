import api from "./config";

export const getDashboard = (params) => api.get("/dashboard", { params });

export const getRekap = (dari_tanggal, sampai_tanggal) =>
  api.get("/dashboard/rekap", { params: { dari_tanggal, sampai_tanggal } });
