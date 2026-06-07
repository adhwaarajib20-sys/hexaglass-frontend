import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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
import { Button, Card, Header, LogoutButton } from "../../components/UI";
import { Colors, Spacing } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

// ─── STATUS CONFIG ─────────────────────────────────────────
const STATUS_CONFIG = {
  // Status validasi satpam
  menunggu_validasi: {
    label: "Menunggu Validasi Satpam",
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: "schedule",
    desc: "Data kendaraan Anda sedang menunggu validasi dari petugas satpam",
  },
  disetujui: {
    label: "Disetujui Satpam",
    color: "#10b981",
    bg: "#d1fae5",
    icon: "verified",
    desc: "Data kendaraan telah disetujui, menunggu dipanggil operator",
  },
  ditolak: {
    label: "Ditolak Satpam",
    color: "#ef4444",
    bg: "#fee2e2",
    icon: "cancel",
    desc: "Data kendaraan ditolak oleh satpam",
  },
};

const ANTREAN_STATUS_CONFIG = {
  menunggu: {
    label: "Menunggu Dipanggil",
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: "hourglass-empty",
  },
  dipanggil: {
    label: "Sedang Dipanggil",
    color: "#3b82f6",
    bg: "#dbeafe",
    icon: "campaign",
  },
  dilayani: {
    label: "Sedang Dilayani",
    color: "#8b5cf6",
    bg: "#ede9fe",
    icon: "local-gas-station",
  },
  selesai: {
    label: "Pengisian Selesai",
    color: "#10b981",
    bg: "#d1fae5",
    icon: "check-circle",
  },
  batal: {
    label: "Dibatalkan",
    color: "#ef4444",
    bg: "#fee2e2",
    icon: "cancel",
  },
};

// ─── TIMELINE STEPS ────────────────────────────────────────
const getTimelineSteps = (data) => {
  const validasi = data.status_validasi ?? data.status_validasi_satpam;
  const status = data.status;
  const isRejected = validasi === "ditolak" || status === "batal";

  return [
    {
      key: "daftar",
      label: "Pendaftaran",
      desc: "Data kendaraan berhasil didaftarkan",
      icon: "how-to-reg",
      // Selalu aktif jika data ada
      state: "done",
      time: data.waktu_daftar
        ? new Date(data.waktu_daftar).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    },
    {
      key: "validasi",
      label: "Validasi Satpam",
      desc:
        validasi === "disetujui"
          ? "Data telah diverifikasi oleh satpam"
          : validasi === "ditolak"
            ? "Data ditolak oleh satpam"
            : "Menunggu verifikasi dari satpam",
      icon:
        validasi === "disetujui"
          ? "verified-user"
          : validasi === "ditolak"
            ? "gpp-bad"
            : "pending",
      // done = hijau, pending = kuning, rejected = merah, inactive = abu
      state:
        validasi === "disetujui"
          ? "done"
          : validasi === "ditolak"
            ? "rejected"
            : "pending",
      time: null,
    },
    {
      key: "panggil",
      label: "Dipanggil Operator",
      desc: ["dipanggil", "dilayani", "selesai"].includes(status)
        ? "Operator telah memanggil nomor antrean Anda"
        : "Menunggu giliran dipanggil",
      icon: "campaign",
      state: isRejected
        ? "inactive"
        : ["dipanggil", "dilayani", "selesai"].includes(status)
          ? "done"
          : validasi === "disetujui"
            ? "pending"
            : "inactive",
      time: data.waktu_dipanggil
        ? new Date(data.waktu_dipanggil).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    },
    {
      key: "layani",
      label: "Sedang Dilayani",
      desc: ["dilayani", "selesai"].includes(status)
        ? "Kendaraan sedang dalam proses pengisian gas"
        : "Menunggu proses pengisian",
      icon: "local-gas-station",
      state: isRejected
        ? "inactive"
        : ["dilayani", "selesai"].includes(status)
          ? "done"
          : status === "dipanggil"
            ? "pending"
            : "inactive",
      time: null,
    },
    {
      key: "selesai",
      label: "Pengisian Selesai",
      desc:
        status === "selesai"
          ? "Proses pengisian gas telah selesai"
          : "Menunggu penyelesaian pengisian",
      icon: "check-circle",
      state: isRejected
        ? "inactive"
        : status === "selesai"
          ? "done"
          : status === "dilayani"
            ? "pending"
            : "inactive",
      time: data.waktu_selesai
        ? new Date(data.waktu_selesai).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    },
  ];
};

// ─── HELPER: STATE → COLOR ─────────────────────────────────
const stateColor = (state) => {
  switch (state) {
    case "done":
      return Colors.success ?? "#10b981";
    case "pending":
      return "#f59e0b";
    case "rejected":
      return "#ef4444";
    default:
      return "#d1d5db";
  }
};

const stateBg = (state) => {
  switch (state) {
    case "done":
      return "#d1fae5";
    case "pending":
      return "#fef3c7";
    case "rejected":
      return "#fee2e2";
    default:
      return "#f3f4f6";
  }
};

const stateIconColor = (state) => {
  switch (state) {
    case "done":
      return "#10b981";
    case "pending":
      return "#f59e0b";
    case "rejected":
      return "#ef4444";
    default:
      return "#9ca3af";
  }
};

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function StatusAntreanScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const laporan = data?.laporan_pengisian ?? data?.laporanPengisian;

  const handleCek = async () => {
    if (!kode.trim()) {
      setError("Masukkan nomor antrean terlebih dahulu");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await statusAntrean(kode.trim().toUpperCase());
      setData(res.data.data);
    } catch (e) {
      setError(
        "Nomor antrean tidak ditemukan. Pastikan nomor yang Anda masukkan benar.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const validasi = data?.status_validasi ?? data?.status_validasi_satpam;
  const validasiConfig =
    STATUS_CONFIG[validasi] ?? STATUS_CONFIG["menunggu_validasi"];
  const antreanConfig =
    ANTREAN_STATUS_CONFIG[data?.status] ?? ANTREAN_STATUS_CONFIG["menunggu"];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header
        title="Status Antrean"
        subtitle="Cek posisi antrean Anda secara real-time"
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

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
            placeholder="Contoh: ANT-20260501-001"
            placeholderTextColor="#9ca3af"
            value={kode}
            onChangeText={(t) => {
              setKode(t);
              setError("");
            }}
            autoCapitalize="characters"
          />
          {error && (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <Button
            title="Cek Status Antrean"
            variant="primary"
            onPress={handleCek}
            loading={loading}
          />
        </Card>

        {data && (
          <>
            {/* Nomor Antrean */}
            <View style={styles.nomorCard}>
              <Text style={styles.nomorLabel}>Nomor Antrean Anda</Text>
              <Text style={styles.nomorValue}>{data.nomor_antrean}</Text>
              <View
                style={[
                  styles.nomorBadge,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
              >
                <Text style={styles.nomorBadgeText}>
                  {new Date(data.waktu_daftar).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            {/* Status Validasi Satpam - UTAMA */}
            <View
              style={[
                styles.validasiCard,
                {
                  backgroundColor: validasiConfig.bg,
                  borderColor: validasiConfig.color + "40",
                },
              ]}
            >
              <View
                style={[
                  styles.validasiIconWrapper,
                  { backgroundColor: validasiConfig.color },
                ]}
              >
                <MaterialIcons
                  name={validasiConfig.icon}
                  size={28}
                  color="white"
                />
              </View>
              <View style={styles.validasiInfo}>
                <Text style={styles.validasiLabel}>Status Validasi Satpam</Text>
                <Text
                  style={[
                    styles.validasiStatus,
                    { color: validasiConfig.color },
                  ]}
                >
                  {validasiConfig.label}
                </Text>
                <Text style={styles.validasiDesc}>{validasiConfig.desc}</Text>
              </View>
            </View>

            {/* Alasan Penolakan */}
            {(validasi === "ditolak" || data?.status === "batal") &&
              data.alasan_penolakan && (
                <View style={styles.penolakanBox}>
                  <View style={styles.penolakanHeader}>
                    <MaterialIcons name="report" size={20} color="#ef4444" />
                    <Text style={styles.penolakanTitle}>Alasan Penolakan</Text>
                  </View>
                  <Text style={styles.penolakanText}>
                    {data.alasan_penolakan}
                  </Text>
                </View>
              )}

            {/* Status Antrean (hanya tampil jika sudah disetujui) */}
            {validasi === "disetujui" && (
              <View
                style={[
                  styles.antreanStatusCard,
                  {
                    backgroundColor: antreanConfig.bg,
                    borderColor: antreanConfig.color + "40",
                  },
                ]}
              >
                <View
                  style={[
                    styles.antreanIconWrapper,
                    { backgroundColor: antreanConfig.color },
                  ]}
                >
                  <MaterialIcons
                    name={antreanConfig.icon}
                    size={24}
                    color="white"
                  />
                </View>
                <View style={styles.antreanInfo}>
                  <Text style={styles.antreanLabel}>Status Antrean</Text>
                  <Text
                    style={[
                      styles.antreanStatus,
                      { color: antreanConfig.color },
                    ]}
                  >
                    {antreanConfig.label}
                  </Text>
                </View>
              </View>
            )}

            {/* Estimasi Validasi Satpam (jika ada) - Hanya tampil saat menunggu dipanggil */}
            {validasi === "disetujui" &&
              data.status === "menunggu" &&
              data.estimasi_validasi_satpam && (
                <View style={styles.estimasiSatpamCard}>
                  <View style={styles.estimasiSatpamHeader}>
                    <MaterialIcons name="schedule" size={22} color="#f59e0b" />
                    <Text style={styles.estimasiSatpamLabel}>
                      Estimasi Waktu Validasi Satpam
                    </Text>
                  </View>
                  <View style={styles.estimasiSatpamContent}>
                    <View style={styles.estimasiSatpamBox}>
                      <Text style={styles.estimasiSatpamValue}>
                        {data.estimasi_validasi_satpam}
                      </Text>
                      <Text style={styles.estimasiSatpamUnit}>menit</Text>
                    </View>
                    <Text style={styles.estimasiSatpamDesc}>
                      Waktu validasi yang diperkirakan oleh satpam untuk
                      pemanggilan pengisian kendaraan Anda
                    </Text>
                  </View>
                </View>
              )}

            {/* Estimasi Pengisian Operator (jika ada) - Hanya tampil saat menunggu dipanggil */}
            {validasi === "disetujui" &&
              data.status === "menunggu" &&
              data.estimasi_pengisian_operator && (
                <View style={styles.estimasiOperatorCard}>
                  <View style={styles.estimasiOperatorHeader}>
                    <MaterialIcons name="schedule" size={22} color="#3b82f6" />
                    <Text style={styles.estimasiOperatorLabel}>
                      Estimasi Waktu Pengisian Operator
                    </Text>
                  </View>
                  <View style={styles.estimasiOperatorContent}>
                    <View style={styles.estimasiOperatorBox}>
                      <Text style={styles.estimasiOperatorValue}>
                        {data.estimasi_pengisian_operator}
                      </Text>
                      <Text style={styles.estimasiOperatorUnit}>menit</Text>
                    </View>
                    <Text style={styles.estimasiOperatorDesc}>
                      Waktu pengisian yang diperkirakan oleh operator untuk
                      mengisi bahan bakar kendaraan Anda
                    </Text>
                  </View>
                </View>
              )}

            {/* Timeline */}
            <Card>
              <Text style={styles.sectionLabel}>PROGRES ANTREAN</Text>
              <View style={styles.timeline}>
                {getTimelineSteps(data).map((step, idx, arr) => (
                  <View key={step.key} style={styles.timelineItem}>
                    {/* Connector Line */}
                    {idx < arr.length - 1 && (
                      <View
                        style={[
                          styles.timelineConnector,
                          { backgroundColor: stateColor(step.state) },
                        ]}
                      />
                    )}

                    {/* Dot */}
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: stateBg(step.state),
                          borderColor: stateColor(step.state),
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={step.icon}
                        size={16}
                        color={stateIconColor(step.state)}
                      />
                    </View>

                    {/* Content */}
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Text
                          style={[
                            styles.timelineLabel,
                            {
                              color:
                                step.state === "inactive"
                                  ? "#9ca3af"
                                  : "#1f2937",
                            },
                          ]}
                        >
                          {step.label}
                        </Text>
                        {step.time && (
                          <Text style={styles.timelineTime}>{step.time}</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.timelineDesc,
                          {
                            color:
                              step.state === "inactive" ? "#d1d5db" : "#6b7280",
                          },
                        ]}
                      >
                        {step.desc}
                      </Text>

                      {/* State Badge */}
                      {step.state !== "inactive" && (
                        <View
                          style={[
                            styles.stateBadge,
                            { backgroundColor: stateColor(step.state) + "20" },
                          ]}
                        >
                          <View
                            style={[
                              styles.stateDot,
                              { backgroundColor: stateColor(step.state) },
                            ]}
                          />
                          <Text
                            style={[
                              styles.stateBadgeText,
                              { color: stateColor(step.state) },
                            ]}
                          >
                            {step.state === "done"
                              ? "✓ Selesai"
                              : step.state === "pending"
                                ? "⏳ Menunggu"
                                : "✗ Ditolak"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </Card>

            {/* Estimasi Waktu (jika ada dan sudah disetujui) */}
            {validasi === "disetujui" && data.estimasi_menit && (
              <View style={styles.estimasiCard}>
                <MaterialIcons
                  name="schedule"
                  size={22}
                  color={Colors.primary ?? "#1a7a2e"}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.estimasiLabel}>
                    Estimasi Waktu Pengisian
                  </Text>
                  <Text style={styles.estimasiValue}>
                    {data.estimasi_menit} menit
                  </Text>
                </View>
                {data.estimasi_selesai && (
                  <View style={styles.estimasiTime}>
                    <Text style={styles.estimasiTimeLabel}>
                      Estimasi Selesai
                    </Text>
                    <Text style={styles.estimasiTimeValue}>
                      {new Date(data.estimasi_selesai).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Prioritas (jika ada) */}
            {data.is_prioritas && (
              <View style={styles.prioritasCard}>
                <MaterialIcons name="bolt" size={22} color="#f59e0b" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.prioritasLabel}>
                    ⚡ Antrean Prioritas
                  </Text>
                  {data.alasan_prioritas && (
                    <Text style={styles.prioritasDesc}>
                      {data.alasan_prioritas}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Data Kendaraan */}
            <Card>
              <Text style={styles.sectionLabel}>DATA KENDARAAN</Text>
              {[
                {
                  icon: "person",
                  label: "Nama Supir",
                  value: data.kendaraan?.nama_supir,
                },
                {
                  icon: "directions-car",
                  label: "No. Polisi",
                  value: data.kendaraan?.nomor_polisi,
                },
                {
                  icon: "local-shipping",
                  label: "Jenis",
                  value: data.kendaraan?.jenis_kendaraan,
                },
                {
                  icon: "local-gas-station",
                  label: "Kapasitas",
                  value: data.kendaraan?.kapasitas_tangki,
                },
                {
                  icon: "business",
                  label: "Perusahaan",
                  value: data.kendaraan?.perusahaan ?? "-",
                },
              ].map((item, i, arr) => (
                <View
                  key={item.label}
                  style={[
                    styles.dataRow,
                    i === arr.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.dataIconWrapper}>
                    <MaterialIcons
                      name={item.icon}
                      size={16}
                      color={Colors.primary ?? "#1a7a2e"}
                    />
                  </View>
                  <Text style={styles.dataLabel}>{item.label}</Text>
                  <Text style={styles.dataValue}>{item.value || "-"}</Text>
                </View>
              ))}
            </Card>

            {/* Hasil Pengisian (jika selesai) */}
            {laporan && (
              <View style={styles.hasilCard}>
                <View style={styles.hasilHeader}>
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#10b981"
                  />
                  <Text style={styles.hasilTitle}>Hasil Pengisian Gas</Text>
                </View>
                <View style={styles.hasilGrid}>
                  <View style={styles.hasilItem}>
                    <Text style={styles.hasilItemLabel}>Jumlah Gas</Text>
                    <Text style={styles.hasilItemValue}>
                      {laporan.jumlah_gas_liter != null
                        ? new Intl.NumberFormat("id-ID", {
                            maximumFractionDigits: 3,
                          }).format(laporan.jumlah_gas_liter / 1000) + " m³"
                        : "-"}
                    </Text>
                  </View>
                  <View style={styles.hasilItem}>
                    <Text style={styles.hasilItemLabel}>Durasi</Text>
                    <Text style={styles.hasilItemValue}>
                      {laporan.durasi_menit != null
                        ? laporan.durasi_menit + " menit"
                        : "-"}
                    </Text>
                  </View>
                  <View style={[styles.hasilItem, { width: "100%" }]}>
                    <Text style={styles.hasilItemLabel}>Operator</Text>
                    <Text style={styles.hasilItemValue}>
                      {laporan.operator?.name ?? "-"}
                    </Text>
                  </View>
                  {laporan.catatan && (
                    <View style={[styles.hasilItem, { width: "100%" }]}>
                      <Text style={styles.hasilItemLabel}>Catatan</Text>
                      <Text style={styles.hasilItemValue}>
                        {laporan.catatan}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Refresh Button */}
            <Button
              title="🔄 Perbarui Status"
              variant="secondary"
              onPress={handleCek}
              loading={loading}
            />

            {/* Info */}
            <View style={styles.infoBox}>
              <MaterialIcons name="info-outline" size={16} color="#3b82f6" />
              <Text style={styles.infoText}>
                Tap "Perbarui Status" untuk mendapatkan informasi terkini
                tentang antrean Anda
              </Text>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── STYLES ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f5" },
  header: {
    backgroundColor: Colors.primary ?? "#1a7a2e",
    padding: Spacing.md,
    paddingTop: 50,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  content: { padding: Spacing.md, gap: 12 },

  // Search
  searchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  searchSubtitle: { fontSize: 13, color: "#6b7280", marginBottom: 14 },
  searchInput: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
    marginBottom: 8,
    letterSpacing: 1,
  },
  searchInputError: { borderColor: "#ef4444" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  errorText: { fontSize: 12, color: "#ef4444", flex: 1 },

  // Nomor Card
  nomorCard: {
    backgroundColor: Colors.primary ?? "#1a7a2e",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
    elevation: 4,
  },
  nomorLabel: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  nomorValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
  },
  nomorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  nomorBadgeText: { fontSize: 12, color: "#fff" },

  // Validasi Card
  validasiCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
  },
  validasiIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  validasiInfo: { flex: 1 },
  validasiLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  validasiStatus: { fontSize: 16, fontWeight: "800", marginBottom: 2 },
  validasiDesc: { fontSize: 12, color: "#6b7280", lineHeight: 16 },

  // Antrean Status Card
  antreanStatusCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  antreanIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  antreanInfo: { flex: 1 },
  antreanLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  antreanStatus: { fontSize: 15, fontWeight: "700" },

  // Penolakan
  penolakanBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  penolakanHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  penolakanTitle: { fontSize: 14, fontWeight: "700", color: "#ef4444" },
  penolakanText: { fontSize: 13, color: "#7f1d1d", lineHeight: 20 },

  // Timeline
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  timeline: { gap: 0 },
  timelineItem: {
    flexDirection: "row",
    gap: 14,
    paddingBottom: 20,
    position: "relative",
  },
  timelineConnector: {
    position: "absolute",
    left: 19,
    top: 38,
    width: 2,
    bottom: 0,
    zIndex: 0,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  timelineContent: { flex: 1, paddingTop: 8 },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  timelineLabel: { fontSize: 14, fontWeight: "700", flex: 1 },
  timelineTime: { fontSize: 11, color: "#9ca3af", marginLeft: 8 },
  timelineDesc: { fontSize: 12, lineHeight: 16, marginBottom: 6 },
  stateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  stateDot: { width: 6, height: 6, borderRadius: 3 },
  stateBadgeText: { fontSize: 11, fontWeight: "600" },

  // Estimasi
  estimasiCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  estimasiLabel: { fontSize: 12, color: "#6b7280" },
  estimasiValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary ?? "#1a7a2e",
  },
  estimasiTime: { alignItems: "flex-end" },
  estimasiTimeLabel: { fontSize: 11, color: "#6b7280" },
  estimasiTimeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary ?? "#1a7a2e",
  },

  // Estimasi Validasi Satpam
  estimasiSatpamCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  estimasiSatpamHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  estimasiSatpamLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
  },
  estimasiSatpamContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  estimasiSatpamBox: {
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    minWidth: 80,
  },
  estimasiSatpamValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  estimasiSatpamUnit: {
    fontSize: 11,
    color: "#fff",
    marginTop: 2,
  },
  estimasiSatpamDesc: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 16,
    flex: 1,
  },

  // Estimasi Pengisian Operator
  estimasiOperatorCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  estimasiOperatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  estimasiOperatorLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0c4a6e",
  },
  estimasiOperatorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  estimasiOperatorBox: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    minWidth: 80,
  },
  estimasiOperatorValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  estimasiOperatorUnit: {
    fontSize: 11,
    color: "#fff",
    marginTop: 2,
  },
  estimasiOperatorDesc: {
    fontSize: 12,
    color: "#0c4a6e",
    lineHeight: 16,
    flex: 1,
  },

  // Prioritas
  prioritasCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  prioritasLabel: { fontSize: 14, fontWeight: "700", color: "#92400e" },
  prioritasDesc: { fontSize: 12, color: "#92400e", marginTop: 2 },

  // Data Kendaraan
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },
  dataIconWrapper: {
    width: 28,
    height: 28,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  dataLabel: { fontSize: 13, color: "#6b7280", flex: 1 },
  dataValue: { fontSize: 13, color: "#1f2937", fontWeight: "600" },

  // Hasil Pengisian
  hasilCard: {
    backgroundColor: "#d1fae5",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#6ee7b7",
  },
  hasilHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  hasilTitle: { fontSize: 16, fontWeight: "700", color: "#065f46" },
  hasilGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  hasilItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    width: "47%",
  },
  hasilItemLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "600",
  },
  hasilItemValue: { fontSize: 16, fontWeight: "800", color: "#065f46" },

  // Info
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    padding: 12,
  },
  infoText: { fontSize: 12, color: "#1d4ed8", flex: 1, lineHeight: 16 },
});
