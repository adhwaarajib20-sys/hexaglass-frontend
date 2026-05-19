export const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatWaktu = (waktu) => {
  if (!waktu) return "-";
  const date = new Date(waktu);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatStatus = (status) => {
  const map = {
    menunggu: "Menunggu",
    dipanggil: "Dipanggil",
    dilayani: "Sedang Dilayani",
    selesai: "Selesai",
    batal: "Batal",
  };
  return map[status] ?? status;
};

export const formatKlasifikasi = (klasifikasi) => {
  const map = {
    keselamatan: "Keselamatan",
    lingkungan: "Lingkungan",
    kualitas: "Kualitas",
    prosedur: "Prosedur",
    lainnya: "Lainnya",
  };
  return map[klasifikasi] ?? klasifikasi;
};
