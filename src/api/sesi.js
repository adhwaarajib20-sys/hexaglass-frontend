import api from "./config";

// Tanpa auth - Public endpoints
export const validasiBarcode = (kode_barcode) =>
  api.post("/supir/validasi-barcode", { kode_barcode });

export const daftarAntrean = (data) => api.post("/supir/daftar-antrean", data);

export const statusAntrean = (kode) => api.get(`/supir/status-antrean/${kode}`);

// Dengan auth - Protected endpoints (satpam)
export const generateBarcode = () => api.post("/sesi/generate-barcode");

export const statusBarcode = () => api.get("/sesi/status-barcode");
