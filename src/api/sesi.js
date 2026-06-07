import api from "./config";

// Tanpa auth - Public endpoints
export const validasiBarcode = (kode_barcode) =>
  api.post("/supir/validasi-barcode", { kode_barcode });

export const daftarAntrean = (data) => api.post("/supir/daftar-antrean", data);

export const statusAntrean = (kode) => api.get(`/supir/status-antrean/${kode}`);

// Fetch daftar perusahaan VIP dan jenis kendaraan (tanpa auth)
export const daftarPerusahaan = () => api.get("/supir/daftar-perusahaan");

export const jenisKendaraan = () => api.get("/supir/jenis-kendaraan");

// Dengan auth - Protected endpoints (satpam)
export const generateBarcode = () => api.post("/sesi/generate-barcode");

export const statusBarcode = () => api.get("/sesi/status-barcode");

// Validasi satpam dengan estimasi waktu validasi
export const validasiSatpam = (id, data) =>
  api.post(`/satpam/validasi/${id}`, data);

// Operator set estimasi pengisian yang dikirim ke supir
export const setEstimasiPengisianOperator = (id, estimasi_pengisian_operator) =>
  api.post(`/antrean/${id}/estimasi-pengisian-operator`, {
    estimasi_pengisian_operator,
  });
