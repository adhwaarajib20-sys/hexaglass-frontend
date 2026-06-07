import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import api from "../../api/config";
import {
    Button,
    Card,
    EmptyState,
    Header,
    LoadingScreen,
    LogoutButton,
    StatusBadge,
} from "../../components/UI";
import { Colors, Radius, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function ValidasiScreen() {
  const { user, logout } = useAuth();
  const [antrean, setAntrean] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [estimasiModalVisible, setEstimasiModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedNama, setSelectedNama] = useState("");
  const [alasan, setAlasan] = useState("");
  const [estimasiMenit, setEstimasiMenit] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log("ValidasiScreen mounted - calling fetchAntrean");
    fetchAntrean();
  }, []);

  const fetchAntrean = async () => {
    try {
      console.log("Fetching pending antrians from /satpam/antrean-pending");
      const res = await api.get("/satpam/antrean-pending");
      console.log("Antrians fetched successfully:", res.data);
      setAntrean(res.data.data);
    } catch (e) {
      console.log("Error fetching antrians:", e.message);
      console.log("Error response:", e.response?.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleSetujui = (id, nama) => {
    // Show estimasi input modal instead of alert
    setSelectedId(id);
    setSelectedNama(nama);
    setEstimasiMenit("");
    setEstimasiModalVisible(true);
  };

  const handleKonfirmasiSetujui = async () => {
    setSubmitting(true);
    console.log("Starting handleKonfirmasiSetujui for id:", selectedId);

    // Validate estimasi input
    const estimasi = estimasiMenit.trim() ? parseInt(estimasiMenit, 10) : null;
    if (estimasi && (isNaN(estimasi) || estimasi < 1 || estimasi > 120)) {
      Alert.alert("Validasi", "Estimasi harus antara 1 - 120 menit");
      setSubmitting(false);
      return;
    }

    try {
      console.log("Sending POST request to /satpam/validasi/" + selectedId);
      const res = await api.post(`/satpam/validasi/${selectedId}`, {
        status_validasi: "disetujui",
        estimasi_validasi_satpam: estimasi,
      });
      console.log("API Response received:", res.data);
      if (res.data?.status) {
        Alert.alert("Berhasil", "Antrean telah disetujui");
        setEstimasiModalVisible(false);
        fetchAntrean();
      } else {
        console.log("API returned status false:", res.data);
        Alert.alert("Gagal", res.data?.message ?? "Gagal menyetujui antrean");
      }
    } catch (e) {
      console.log("Error setujui:", e.message);
      console.log("Error response data:", e.response?.data);
      Alert.alert(
        "Gagal",
        e.response?.data?.message ?? e.message ?? "Gagal menyetujui antrean",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTolak = (id) => {
    setSelectedId(id);
    setAlasan("");
    setModalVisible(true);
  };

  const handleKonfirmasiTolak = async () => {
    setSubmitting(true);
    console.log("Starting handleKonfirmasiTolak for id:", selectedId);
    try {
      console.log("Sending POST request to /satpam/validasi/" + selectedId);
      const res = await api.post(`/satpam/validasi/${selectedId}`, {
        status_validasi: "ditolak",
        alasan_penolakan: alasan,
      });
      console.log("API Response received:", res.data);
      if (res.data?.status) {
        Alert.alert("Berhasil", "Antrean telah ditolak");
        setModalVisible(false);
        fetchAntrean();
      } else {
        console.log("API returned status false:", res.data);
        Alert.alert("Gagal", res.data?.message ?? "Gagal menolak antrean");
      }
    } catch (e) {
      console.log("Error tolak:", e.message);
      console.log("Error response data:", e.response?.data);
      console.log("Full error:", JSON.stringify(e, null, 2));
      Alert.alert(
        "Gagal",
        e.response?.data?.message ?? e.message ?? "Gagal menolak antrean",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.nomor}>{item.nomor_antrean}</Text>
          <View style={styles.waktuRow}>
            <MaterialIcons
              name="access-time"
              size={14}
              color={Colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.waktu}>
              {item.waktu_daftar
                ? new Date(item.waktu_daftar).toLocaleTimeString("id-ID")
                : "-"}
            </Text>
          </View>
        </View>
        <StatusBadge status="menunggu_validasi" type="validasi" />
      </View>

      <View style={styles.divider} />

      {/* Data Kendaraan */}
      <View style={styles.dataGrid}>
        <DataRow
          icon="person"
          label="Nama Supir"
          value={item.kendaraan?.nama_supir}
        />
        <DataRow
          icon="phone"
          label="No. HP"
          value={item.kendaraan?.no_hp_supir}
        />
        <DataRow
          icon="directions-car"
          label="No. Polisi"
          value={item.kendaraan?.nomor_polisi}
        />
        <DataRow
          icon="local-shipping"
          label="Jenis"
          value={item.kendaraan?.jenis_kendaraan}
        />
        <DataRow
          icon="local-gas-station"
          label="Kapasitas"
          value={item.kendaraan?.kapasitas_tangki}
        />
        <DataRow
          icon="business"
          label="Perusahaan"
          value={item.kendaraan?.perusahaan ?? "-"}
        />
      </View>

      <View style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Button
          title="Setujui"
          icon="check-circle"
          variant="success"
          size="sm"
          onPress={() => {
            console.log("SETUJUI BUTTON PRESSED - item.id:", item.id);
            handleSetujui(item.id, item.kendaraan?.nama_supir);
          }}
          style={styles.halfBtn}
          fullWidth={false}
          loading={submitting}
          disabled={submitting}
        />
        <Button
          title="Tolak"
          icon="close-circle"
          variant="danger"
          size="sm"
          onPress={() => {
            console.log("TOLAK BUTTON PRESSED - item.id:", item.id);
            handleTolak(item.id);
          }}
          style={styles.halfBtn}
          fullWidth={false}
          loading={submitting}
          disabled={submitting}
        />
      </View>
    </Card>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Validasi Antrean"
        subtitle={`${antrean.length} menunggu validasi`}
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

      {/* DEBUG INFO */}
      {antrean.length === 0 && !loading && (
        <View
          style={{
            padding: Spacing.md,
            backgroundColor: "#fff3cd",
            borderBottomWidth: 1,
            borderBottomColor: "#ffdbac",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialIcons name="info" size={16} color="#856404" />
            <Text style={{ fontSize: 12, color: "#856404", fontWeight: "600" }}>
              Tidak ada antrean. Pastikan data sudah di-register oleh supir.
            </Text>
          </View>
        </View>
      )}

      {antrean.length > 0 && (
        <View
          style={{
            padding: Spacing.md,
            backgroundColor: "#d4edda",
            borderBottomWidth: 1,
            borderBottomColor: "#c3e6cb",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialIcons name="check-circle" size={16} color="#155724" />
            <Text style={{ fontSize: 12, color: "#155724", fontWeight: "600" }}>
              Ada {antrean.length} antrean menunggu validasi. Klik Setujui atau
              Tolak.
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={antrean}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAntrean();
            }}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="check-circle"
            title="Semua Antrean Tervalidasi"
            subtitle="Tidak ada antrean yang menunggu validasi saat ini"
          />
        }
        contentContainerStyle={styles.list}
      />

      {/* Modal Tolak */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="cancel" size={24} color={Colors.danger} />
              <Text style={styles.modalTitle}>Alasan Penolakan</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Berikan alasan yang jelas agar supir dapat memahami penolakan ini
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contoh: Dokumen tidak lengkap, kendaraan tidak sesuai..."
              placeholderTextColor={Colors.textLight}
              value={alasan}
              onChangeText={setAlasan}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <Button
                title="Batal"
                variant="ghost"
                size="sm"
                onPress={() => setModalVisible(false)}
                style={styles.halfBtn}
                fullWidth={false}
              />
              <Button
                title="Tolak Antrean"
                variant="danger"
                size="sm"
                onPress={handleKonfirmasiTolak}
                style={styles.halfBtn}
                fullWidth={false}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Estimasi Validasi */}
      <Modal visible={estimasiModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="schedule" size={24} color={Colors.primary} />
              <Text style={styles.modalTitle}>Estimasi Waktu Validasi</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Berapa menit estimasi untuk memvalidasi antrean atas nama:{"\n"}
              <Text style={{ fontWeight: "bold" }}>{selectedNama}</Text>
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contoh: 15 (1-120 menit)"
              placeholderTextColor={Colors.textLight}
              value={estimasiMenit}
              onChangeText={setEstimasiMenit}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.estimasiHint}>
              {estimasiMenit
                ? `Estimasi: ${estimasiMenit} menit`
                : "Boleh kosong jika tidak ada estimasi"}
            </Text>
            <View style={styles.modalActions}>
              <Button
                title="Batal"
                variant="ghost"
                size="sm"
                onPress={() => setEstimasiModalVisible(false)}
                style={styles.halfBtn}
                fullWidth={false}
                disabled={submitting}
              />
              <Button
                title="Setujui"
                variant="success"
                size="sm"
                onPress={handleKonfirmasiSetujui}
                style={styles.halfBtn}
                fullWidth={false}
                loading={submitting}
                disabled={submitting}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DataRow({ icon, label, value }) {
  return (
    <View style={dataStyles.row}>
      {icon && (
        <MaterialIcons
          name={icon}
          size={14}
          color={Colors.primary}
          style={dataStyles.iconView}
        />
      )}
      <Text style={dataStyles.label}>{label}</Text>
      <Text style={dataStyles.value}>{value}</Text>
    </View>
  );
}

const dataStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 5 },
  iconView: { width: 24, marginRight: 2 },
  label: { ...Typography.caption, color: Colors.textSecondary, width: 90 },
  value: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: "600",
    flex: 1,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, gap: 10 },
  card: { marginBottom: 0 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nomor: { ...Typography.h4, color: Colors.primary },
  waktuRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  waktu: { ...Typography.caption, color: Colors.textSecondary },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  dataGrid: { gap: 2 },
  actionRow: { flexDirection: "row", gap: 8 },
  halfBtn: { flex: 1 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: Spacing.md,
  },
  modalTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 4 },
  modalSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    minHeight: 100,
    textAlignVertical: "top",
    color: Colors.textPrimary,
    fontSize: 15,
    marginBottom: Spacing.md,
  },
  estimasiHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontStyle: "italic",
  },
  modalActions: { flexDirection: "row", gap: 8 },
});
