import api from "./config";

export const getAntrean = (tanggal) =>
  api.get("/antrean", { params: { tanggal } });

export const getDetailAntrean = (id) => api.get(`/antrean/${id}`);

export const updateStatusAntrean = (id, status, keterangan) =>
  api.put(`/antrean/${id}/status`, { status, keterangan });

export const panggilBerikutnya = () => api.get("/antrean/panggil-berikutnya");

export const updateEstimasi = (id, estimasi_menit) =>
  api.put(`/antrean/${id}/estimasi`, { estimasi_menit });

export const setEstimasiPengisianOperator = (id, estimasi_pengisian_operator) =>
  api.post(`/antrean/${id}/estimasi-pengisian-operator`, {
    estimasi_pengisian_operator,
  });

export const updatePrioritas = (id, data) =>
  api.put(`/antrean/${id}/prioritas`, data);

export const selesaikanPengisian = (id, data) =>
  api.post(`/antrean/${id}/selesai-pengisian`, data);
