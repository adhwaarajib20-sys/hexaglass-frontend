import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createLaporanPublic } from "../../api/laporan";
import { Header } from "../../components/UI";
import { Colors } from "../../constants/theme";

const KLASIFIKASI = [
  "keselamatan",
  "lingkungan",
  "kualitas",
  "prosedur",
  "lainnya",
];

export default function FormLaporanScreen() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama_pelapor: "",
    perusahaan: "",
    tanggal_kejadian: new Date().toISOString().split("T")[0],
    waktu_kejadian: new Date().toTimeString().split(" ")[0],
    lokasi: "",
    klasifikasi: "keselamatan",
    deskripsi: "",
    rekomendasi: "",
  });

  // 📝 Supir - Tidak perlu token, bisa langsung buat laporan
  console.log("[FormLaporan] Supir mode - bisa buat laporan tanpa login");

  // Supir tidak perlu logout (tidak ada login)
  // const handleLogout = async () => {
  //   Alert.alert("Konfirmasi Keluar", "Apakah Anda yakin ingin keluar?", [
  //     { text: "Batal", style: "cancel" },
  //     {
  //       text: "Keluar",
  //       style: "destructive",
  //       onPress: async () => {
  //         await logout();
  //         router.replace("/login");
  //       },
  //     },
  //   ]);
  // };

  const handleSubmit = async () => {
    if (!form.lokasi.trim() || !form.deskripsi.trim()) {
      Alert.alert("⚠️ Data Tidak Lengkap", "Lokasi dan deskripsi wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      console.log("[FormLaporan] Submitting laporan...", {
        lokasi: form.lokasi,
        klasifikasi: form.klasifikasi,
      });

      // Gunakan public API - supir tidak perlu token
      await createLaporanPublic(formData);

      Alert.alert("✅ Berhasil", "Laporan berhasil dikirim!", [
        {
          text: "OK",
          onPress: () => {
            setForm((prev) => ({
              ...prev,
              lokasi: "",
              deskripsi: "",
              rekomendasi: "",
            }));
          },
        },
      ]);
    } catch (error) {
      console.log("[FormLaporan] Error:", error);
      console.log("[FormLaporan] Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      let errorMessage = "Gagal mengirim laporan";

      // Cek jenis error
      if (!error.response) {
        // Network error
        if (error.code === "ECONNABORTED") {
          errorMessage = "⏱️ Request timeout. Cek koneksi internet Anda.";
        } else if (error.message.includes("Network")) {
          errorMessage = "🌐 Error jaringan. Backend tidak terkoneksi.";
        } else {
          errorMessage = `🔌 Koneksi error: ${error.message}`;
        }
      } else if (error.response?.status === 422) {
        // Validation error
        const errors = error.response?.data?.errors;
        if (errors) {
          const errorMessages = Object.entries(errors)
            .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
            .join("\n");
          errorMessage = `❌ Validasi gagal:\n${errorMessages}`;
        } else {
          errorMessage = error.response?.data?.message ?? "Data tidak valid";
        }
      } else if (error.response?.status >= 500) {
        errorMessage = `❌ Server error (${error.response.status}). Hubungi admin.`;
      } else {
        errorMessage =
          error.response?.data?.message ?? "Gagal mengirim laporan";
      }

      Alert.alert("❌ Gagal", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title="Buat Laporan" subtitle="Supir" showLogo />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            📝 Laporkan kejadian atau temuan Anda. Semua laporan akan
            ditindaklanjuti oleh tim terkait.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nama Pelapor</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.nama_pelapor}
              onChangeText={(val) => setForm({ ...form, nama_pelapor: val })}
              placeholder="Nama lengkap"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Perusahaan</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Nama perusahaan (opsional)"
              placeholderTextColor="#9ca3af"
              value={form.perusahaan}
              onChangeText={(val) => setForm({ ...form, perusahaan: val })}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Tanggal Kejadian</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.tanggal_kejadian}
              onChangeText={(val) =>
                setForm({ ...form, tanggal_kejadian: val })
              }
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Waktu Kejadian</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.waktu_kejadian}
              onChangeText={(val) => setForm({ ...form, waktu_kejadian: val })}
              placeholder="HH:MM:SS"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Lokasi <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Contoh: Area timur, dekat gate 2"
              placeholderTextColor="#9ca3af"
              value={form.lokasi}
              onChangeText={(val) => setForm({ ...form, lokasi: val })}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Klasifikasi</Text>
            <View style={styles.klasifikasiContainer}>
              {KLASIFIKASI.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.klasifikasiBtn,
                    form.klasifikasi === item && styles.klasifikasiActive,
                  ]}
                  onPress={() => setForm({ ...form, klasifikasi: item })}
                >
                  <Text
                    style={[
                      styles.klasifikasiText,
                      form.klasifikasi === item && styles.klasifikasiTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Deskripsi <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.fieldInput, styles.textarea]}
              placeholder="Jelaskan kejadian secara detail"
              placeholderTextColor="#9ca3af"
              value={form.deskripsi}
              onChangeText={(val) => setForm({ ...form, deskripsi: val })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Rekomendasi</Text>
            <TextInput
              style={[styles.fieldInput, styles.textarea]}
              placeholder="Saran tindak lanjut (opsional)"
              placeholderTextColor="#9ca3af"
              value={form.rekomendasi}
              onChangeText={(val) => setForm({ ...form, rekomendasi: val })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.requiredNote}>* Field wajib diisi</Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Kirim Laporan</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16 },

  infoBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoBoxText: { color: Colors.primary, fontSize: 13, textAlign: "center" },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  required: { color: Colors.danger },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#f9fafb",
    color: Colors.textPrimary,
  },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  requiredNote: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 16,
    marginTop: 4,
  },

  klasifikasiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  klasifikasiBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    margin: 4,
  },
  klasifikasiActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  klasifikasiText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  klasifikasiTextActive: { color: Colors.white },

  primaryBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: Colors.white, fontWeight: "bold", fontSize: 15 },
});
