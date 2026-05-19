import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { statusAntrean } from "../../api/sesi";
import { Button, Card, StatusBadge } from "../../components/UI";
import { Colors, Spacing, Typography } from "../../constants/theme";

export default function StatusAntreanScreen() {
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleCek = async () => {
    if (!kode.trim()) {
      setError("Masukkan nomor antrean terlebih dahulu");
      return;
    }
    setError("");
    setLoading(true);
    try {
      console.log("📥 Checking status untuk nomor:", kode.trim().toUpperCase());
      const res = await statusAntrean(kode.trim().toUpperCase());
      console.log("✅ Status antrean received:", res.data.data);
      console.log("   - status:", res.data.data.status);
      console.log("   - status_validasi:", res.data.data.status_validasi);
      console.log("   - alasan_penolakan:", res.data.data.alasan_penolakan);
      setData(res.data.data);
    } catch (e) {
      console.log("❌ Error checking status:", e.message);
      console.log("   Response data:", e.response?.data);
      setError(
        "Nomor antrean tidak ditemukan. Pastikan nomor yang Anda masukkan benar.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Status Antrean</Text>
        <Text style={styles.headerSubtitle}>Cek posisi antrean Anda</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Search Card */}
        <Card>
          <Text style={styles.searchTitle}>🔍 Cek Nomor Antrean</Text>
          <Text style={styles.searchSubtitle}>
            Masukkan nomor antrean yang Anda terima setelah scan barcode
          </Text>
          <TextInput
            style={[styles.searchInput, error && styles.searchInputError]}
            placeholder="Contoh: ANT-001-070526"
            placeholderTextColor={Colors.textLight}
            value={kode}
            onChangeText={(t) => {
              setKode(t);
              setError("");
            }}
            autoCapitalize="characters"
          />
          {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
          <Button
            title="Cek Status"
            icon="🔍"
            variant="primary"
            onPress={handleCek}
            loading={loading}
          />
        </Card>

        {/* Hasil */}
        {data && (
          <>
            {/* Nomor Antrean */}
            <View style={styles.nomorCard}>
              <Text style={styles.nomorLabel}>Nomor Antrean Anda</Text>
              <Text style={styles.nomorValue}>{data.nomor_antrean}</Text>
              <StatusBadge status={data.status} type="antrean" />
            </View>

            {/* Validasi Satpam */}
            <Card>
              <Text style={styles.sectionLabel}>Status Validasi Satpam</Text>
              <View style={styles.validasiRow}>
                <StatusBadge status={data.status_validasi} type="validasi" />
              </View>
              {data.status_validasi === "ditolak" && data.alasan_penolakan && (
                <View style={styles.penolakanBox}>
                  <Text style={styles.penolakanTitle}>Alasan Penolakan:</Text>
                  <Text style={styles.penolakanText}>
                    {data.alasan_penolakan}
                  </Text>
                </View>
              )}
            </Card>

            {/* Data Kendaraan */}
            <Card>
              <Text style={styles.sectionLabel}>Data Kendaraan</Text>
              {[
                {
                  icon: "👤",
                  label: "Nama Supir",
                  value: data.kendaraan?.nama_supir,
                },
                {
                  icon: "🚗",
                  label: "No. Polisi",
                  value: data.kendaraan?.nomor_polisi,
                },
                {
                  icon: "🚛",
                  label: "Jenis",
                  value: data.kendaraan?.jenis_kendaraan,
                },
                {
                  icon: "⛽",
                  label: "Kapasitas",
                  value: data.kendaraan?.kapasitas_tangki,
                },
                {
                  icon: "🏢",
                  label: "Perusahaan",
                  value: data.kendaraan?.perusahaan ?? "-",
                },
              ].map((item) => (
                <View key={item.label} style={styles.dataRow}>
                  <Text style={styles.dataIcon}>{item.icon}</Text>
                  <Text style={styles.dataLabel}>{item.label}</Text>
                  <Text style={styles.dataValue}>{item.value}</Text>
                </View>
              ))}
            </Card>

            {/* Waktu */}
            <Card>
              <Text style={styles.sectionLabel}>Riwayat Waktu</Text>
              {[
                { label: "Mendaftar", value: data.waktu_daftar },
                { label: "Dipanggil", value: data.waktu_dipanggil },
              ].map((item) => (
                <View key={item.label} style={styles.dataRow}>
                  <Text style={styles.dataLabel}>{item.label}</Text>
                  <Text style={styles.dataValue}>
                    {item.value
                      ? new Date(item.value).toLocaleTimeString("id-ID")
                      : "-"}
                  </Text>
                </View>
              ))}
            </Card>

            <Button
              title="Perbarui Status"
              icon="🔄"
              variant="secondary"
              onPress={handleCek}
              loading={loading}
            />
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    paddingTop: 50,
  },
  headerTitle: { ...Typography.h3, color: Colors.white },
  headerSubtitle: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  content: { padding: Spacing.md, gap: 12 },
  searchTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom: 4 },
  searchSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  searchInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    marginBottom: 8,
    letterSpacing: 1,
  },
  searchInputError: { borderColor: Colors.danger },
  errorText: { ...Typography.caption, color: Colors.danger, marginBottom: 8 },
  nomorCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: "center",
    gap: 8,
  },
  nomorLabel: { ...Typography.bodySmall, color: "rgba(255,255,255,0.7)" },
  nomorValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
    letterSpacing: 1,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  validasiRow: { marginBottom: 4 },
  penolakanBox: {
    backgroundColor: Colors.danger + "15",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  penolakanTitle: {
    ...Typography.caption,
    color: Colors.danger,
    fontWeight: "700",
    marginBottom: 2,
  },
  penolakanText: { ...Typography.bodySmall, color: Colors.danger },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dataIcon: { fontSize: 14, width: 24 },
  dataLabel: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1 },
  dataValue: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
});
