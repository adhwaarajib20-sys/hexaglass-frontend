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
  const [selectedId, setSelectedId] = useState(null);
  const [alasan, setAlasan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log("📱 ValidasiScreen mounted - calling fetchAntrean");
    fetchAntrean();
  }, []);

  const fetchAntrean = async () => {
    try {
      console.log("📥 Fetching pending antrians from /satpam/antrean-pending");
      const res = await api.get("/satpam/antrean-pending");
      console.log("✅ Antrians fetched successfully:", res.data);
      setAntrean(res.data.data);
    } catch (e) {
      console.log("❌ Error fetching antrians:", e.message);
      console.log("📋 Error response:", e.response?.data);
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
    console.log("\n🎯🎯🎯 handleSetujui CALLED with id:", id, "nama:", nama);
    Alert.alert(
      "✅ Konfirmasi Persetujuan",
      `Setujui antrean atas nama ${nama}?`,
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: () => console.log("❌ User clicked Batal in alert"),
        },
        {
          text: "Setujui",
          onPress: async () => {
            setSubmitting(true);
            console.log("\n🟢🟢🟢 Alert Setujui button PRESSED for id:", id);
            try {
              console.log("📤 Sending POST request to /satpam/validasi/" + id);
              const res = await api.post(`/satpam/validasi/${id}`, {
                status_validasi: "disetujui",
              });
              console.log("✅ API Response received:", res.data);
              if (res.data?.status) {
                Alert.alert("✅ Berhasil", "Antrean telah disetujui");
                fetchAntrean();
              } else {
                console.log("⚠️ API returned status false:", res.data);
                Alert.alert(
                  "❌ Gagal",
                  res.data?.message ?? "Gagal menyetujui antrean",
                );
              }
            } catch (e) {
              console.log("❌ Error setujui:", e.message);
              console.log("📋 Error response data:", e.response?.data);
              console.log("📋 Full error:", JSON.stringify(e, null, 2));
              Alert.alert(
                "❌ Gagal",
                e.response?.data?.message ??
                  e.message ??
                  "Gagal menyetujui antrean",
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const handleTolak = (id) => {
    setSelectedId(id);
    setAlasan("");
    setModalVisible(true);
  };

  const handleKonfirmasiTolak = async () => {
    setSubmitting(true);
    console.log("🔵 Starting handleKonfirmasiTolak for id:", selectedId);
    try {
      console.log("📤 Sending POST request to /satpam/validasi/" + selectedId);
      const res = await api.post(`/satpam/validasi/${selectedId}`, {
        status_validasi: "ditolak",
        alasan_penolakan: alasan,
      });
      console.log("✅ API Response received:", res.data);
      if (res.data?.status) {
        Alert.alert("✅ Berhasil", "Antrean telah ditolak");
        setModalVisible(false);
        fetchAntrean();
      } else {
        console.log("⚠️ API returned status false:", res.data);
        Alert.alert("❌ Gagal", res.data?.message ?? "Gagal menolak antrean");
      }
    } catch (e) {
      console.log("❌ Error tolak:", e.message);
      console.log("📋 Error response data:", e.response?.data);
      console.log("📋 Full error:", JSON.stringify(e, null, 2));
      Alert.alert(
        "❌ Gagal",
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
          <Text style={styles.waktu}>
            🕐{" "}
            {item.waktu_daftar
              ? new Date(item.waktu_daftar).toLocaleTimeString("id-ID")
              : "-"}
          </Text>
        </View>
        <StatusBadge status="menunggu_validasi" type="validasi" />
      </View>

      <View style={styles.divider} />

      {/* Data Kendaraan */}
      <View style={styles.dataGrid}>
        <DataRow
          icon="👤"
          label="Nama Supir"
          value={item.kendaraan?.nama_supir}
        />
        <DataRow icon="📞" label="No. HP" value={item.kendaraan?.no_hp_supir} />
        <DataRow
          icon="🚗"
          label="No. Polisi"
          value={item.kendaraan?.nomor_polisi}
        />
        <DataRow
          icon="🚛"
          label="Jenis"
          value={item.kendaraan?.jenis_kendaraan}
        />
        <DataRow
          icon="⛽"
          label="Kapasitas"
          value={item.kendaraan?.kapasitas_tangki}
        />
        <DataRow
          icon="🏢"
          label="Perusahaan"
          value={item.kendaraan?.perusahaan ?? "-"}
        />
      </View>

      <View style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Button
          title="Setujui"
          icon="✅"
          variant="success"
          size="sm"
          onPress={() => {
            console.log("\n🔘🔘🔘 SETUJUI BUTTON PRESSED - item.id:", item.id);
            handleSetujui(item.id, item.kendaraan?.nama_supir);
          }}
          style={styles.halfBtn}
          fullWidth={false}
          loading={submitting}
          disabled={submitting}
        />
        <Button
          title="Tolak"
          icon="❌"
          variant="danger"
          size="sm"
          onPress={() => {
            console.log("\n🔘🔘🔘 TOLAK BUTTON PRESSED - item.id:", item.id);
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
          <Text style={{ fontSize: 12, color: "#856404", fontWeight: "600" }}>
            ℹ️ Tidak ada antrean. Pastikan data sudah di-register oleh supir.
          </Text>
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
          <Text style={{ fontSize: 12, color: "#155724", fontWeight: "600" }}>
            ✅ Ada {antrean.length} antrean menunggu validasi. Klik Setujui atau
            Tolak.
          </Text>
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
            icon="✅"
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
            <Text style={styles.modalTitle}>❌ Alasan Penolakan</Text>
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
    </View>
  );
}

function DataRow({ icon, label, value }) {
  return (
    <View style={dataStyles.row}>
      <Text style={dataStyles.icon}>{icon}</Text>
      <Text style={dataStyles.label}>{label}</Text>
      <Text style={dataStyles.value}>{value}</Text>
    </View>
  );
}

const dataStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 5 },
  icon: { fontSize: 14, width: 24 },
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
  waktu: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
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
  modalActions: { flexDirection: "row", gap: 8 },
});
