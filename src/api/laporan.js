import storage from "../utils/storage";
import api from "./config";

const getBaseUrl = () => {
  // Ambil base URL dari environment variable atau derive dari api config
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";
  return apiUrl.replace("/api", "");
};

export const getLaporan = (params) => api.get("/laporan", { params });

export const getDetailLaporan = (id) => api.get(`/laporan/${id}`);

export const createLaporan = (formData) =>
  api.post("/laporan", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const verifikasiLaporan = (id, data) =>
  api.post(`/laporan/${id}/verifikasi`, data);

export const deleteLaporan = (id) => api.delete(`/laporan/${id}`);

// ✅ BARU: Upload foto ke laporan
export const uploadFotoLaporan = (id, formData) =>
  api.post(`/laporan/${id}/foto`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ✅ BARU: Hapus foto laporan
export const hapusFotoLaporan = (laporanId, fotoId) =>
  api.delete(`/laporan/${laporanId}/foto/${fotoId}`);

// ✅ BARU: Get URL foto
export const getFotoUrl = (pathFoto) => {
  if (!pathFoto) return null;
  if (pathFoto.startsWith("http")) return pathFoto;
  return `${getBaseUrl()}/storage/${pathFoto}`;
};

// ✅ BARU: Export Excel
export const getExportLaporanUrl = async (dari, sampai) => {
  const token = await storage.getItem("token");
  const base = getBaseUrl();
  let url = `${base}/api/export/laporan`;
  if (dari && sampai) {
    url += `?dari_tanggal=${dari}&sampai_tanggal=${sampai}`;
  }
  return { url, token };
};

export const getExportAntreanUrl = async (dari, sampai) => {
  const token = await storage.getItem("token");
  const base = getBaseUrl();
  let url = `${base}/api/export/antrean`;
  if (dari && sampai) {
    url += `?dari_tanggal=${dari}&sampai_tanggal=${sampai}`;
  }
  return { url, token };
};

export const getExportPengisianUrl = async (dari, sampai) => {
  const token = await storage.getItem("token");
  const base = getBaseUrl();
  let url = `${base}/api/export/antrean`;
  if (dari && sampai) {
    url += `?dari_tanggal=${dari}&sampai_tanggal=${sampai}`;
  }
  return { url, token };
};
