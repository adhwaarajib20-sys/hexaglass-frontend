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
import { getLaporan, verifikasiLaporan } from "../../api/laporan";
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
import { formatTanggal } from "../../utils/helpers";

export default function AdminLaporanScreen() {
  const { logout } = useAuth();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("semua");
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [catatan, setCatatan] = useState("");
  const [aksi, setAksi] = useState("");

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    try {
      const res = await getLaporan();
      setLaporan(res.data.data);
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const openModal = (item, action) => {
    setSelected(item);
    setAksi(action);
    setCatatan("");
    setModalVisible(true);
  };

  const handleVerifikasi = async () => {
    try {
      await verifikasiLaporan(selected.id, {
        status: aksi,
        catatan_admin: catatan,
      });
      Alert.alert(
        "Berhasil",
        `Laporan berhasil ${aksi === "diverifikasi" ? "diverifikasi" : "ditolak"}`,
      );
      setModalVisible(false);
      fetchLaporan();
    } catch (e) {
      Alert.alert("Gagal", "Gagal memperbarui laporan");
    }
  };

  const filters = ["semua", "terkirim", "diverifikasi", "ditolak"];

  const filteredLaporan =
    filter === "semua" ? laporan : laporan.filter((l) => l.status === filter);

  const klasifikasiIcon = {
    keselamatan: "⛑️",
    lingkungan: "🌿",
    kualitas: "🎯",
    prosedur: "📋",
    lainnya: "📌",
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.klasIcon}>
            {klasifikasiIcon[item.klasifikasi] ?? "📌"}
          </Text>
          <View>
            <Text style={styles.klasLabel}>
              {item.klasifikasi.charAt(0).toUpperCase() +
                item.klasifikasi.slice(1)}
            </Text>
            <Text style={styles.tanggal}>
              📅 {formatTanggal(item.tanggal_kejadian)}
            </Text>
          </View>
        </View>
        <StatusBadge status={item.status} type="laporan" />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>👤</Text>
        <Text style={styles.infoText}>{item.nama_pelapor}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📍</Text>
        <Text style={styles.infoText}>{item.lokasi}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📝</Text>
        <Text style={styles.infoText} numberOfLines={2}>
          {item.deskripsi}
        </Text>
      </View>

      {item.catatan_admin && (
        <View style={styles.catatanBox}>
          <Text style={styles.catatanLabel}>Catatan Admin:</Text>
          <Text style={styles.catatanText}>{item.catatan_admin}</Text>
        </View>
      )}

      {item.status === "terkirim" && (
        <View style={styles.actionRow}>
          <Button
            title="Verifikasi"
            icon="✅"
            variant="success"
            size="sm"
            onPress={() => openModal(item, "diverifikasi")}
            style={styles.halfBtn}
            fullWidth={false}
          />
          <Button
            title="Tolak"
            icon="❌"
            variant="danger"
            size="sm"
            onPress={() => openModal(item, "ditolak")}
            style={styles.halfBtn}
            fullWidth={false}
          />
        </View>
      )}
    </Card>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Verifikasi Laporan"
        subtitle={`${laporan.filter((l) => l.status === "terkirim").length} menunggu verifikasi`}
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <Button
            key={f}
            title={f.charAt(0).toUpperCase() + f.slice(1)}
            variant={filter === f ? "primary" : "ghost"}
            size="sm"
            onPress={() => setFilter(f)}
            fullWidth={false}
            style={styles.filterBtn}
          />
        ))}
      </View>

      <FlatList
        data={filteredLaporan}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchLaporan();
            }}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📝"
            title="Tidak Ada Laporan"
            subtitle="Belum ada laporan yang masuk"
          />
        }
        contentContainerStyle={styles.list}
      />

      {/* Modal Verifikasi */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {aksi === "diverifikasi"
                ? "✅ Verifikasi Laporan"
                : "❌ Tolak Laporan"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selected?.klasifikasi} — {selected?.nama_pelapor}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Catatan admin (opsional)"
              placeholderTextColor={Colors.textLight}
              value={catatan}
              onChangeText={setCatatan}
              multiline
              numberOfLines={3}
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
                title={aksi === "diverifikasi" ? "Verifikasi" : "Tolak"}
                variant={aksi === "diverifikasi" ? "success" : "danger"}
                size="sm"
                onPress={handleVerifikasi}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterContainer: {
    flexDirection: "row",
    gap: 6,
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBtn: { paddingHorizontal: 8 },
  list: { padding: Spacing.md, gap: 10 },
  card: { marginBottom: 0 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  klasIcon: { fontSize: 28 },
  klasLabel: { ...Typography.h4, color: Colors.textPrimary },
  tanggal: { ...Typography.caption, color: Colors.textSecondary },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  infoRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  infoIcon: { fontSize: 14, width: 20 },
  infoText: { ...Typography.bodySmall, color: Colors.textPrimary, flex: 1 },
  catatanBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  catatanLabel: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: "700",
    marginBottom: 2,
  },
  catatanText: { ...Typography.bodySmall, color: Colors.primary },
  actionRow: { flexDirection: "row", gap: 8, marginTop: Spacing.sm },
  halfBtn: { flex: 1 },
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
    minHeight: 80,
    textAlignVertical: "top",
    color: Colors.textPrimary,
    fontSize: 15,
    marginBottom: Spacing.md,
  },
  modalActions: { flexDirection: "row", gap: 8 },
});
