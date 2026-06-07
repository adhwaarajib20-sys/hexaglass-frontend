import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    getExportLaporanUrl,
    getFotoUrl,
    getLaporan,
    verifikasiLaporan,
} from "../../api/laporan";
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
  const [modalVerif, setModalVerif] = useState(false);
  const [modalFoto, setModalFoto] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedFoto, setSelectedFoto] = useState(null);
  const [catatan, setCatatan] = useState("");
  const [aksi, setAksi] = useState("");
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [exporting, setExporting] = useState(false);

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

  const openVerif = (item, action) => {
    setSelected(item);
    setAksi(action);
    setCatatan("");
    setModalVerif(true);
  };

  const openFoto = (foto) => {
    setSelectedFoto(foto);
    setModalFoto(true);
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
      setModalVerif(false);
      fetchLaporan();
    } catch (e) {
      Alert.alert("Gagal", "Gagal memperbarui laporan");
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const { url, token } = await getExportLaporanUrl(dateFrom, dateTo);
      const fileName = `laporan-${dateFrom}-${dateTo}.xlsx`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Berhasil", `File ${fileName} berhasil diunduh`, [
        { text: "OK" },
      ]);
    } catch (error) {
      console.log("Export error:", error);
      Alert.alert("Gagal", "Gagal mengunduh file Excel");
    } finally {
      setExporting(false);
    }
  };

  const filters = ["semua", "terkirim", "diverifikasi", "ditolak"];
  const klasifikasiIcon = {
    keselamatan: "health-and-safety",
    lingkungan: "leaf",
    kualitas: "target",
    prosedur: "assignment",
    lainnya: "pushpin",
  };

  const filteredLaporan =
    filter === "semua" ? laporan : laporan.filter((l) => l.status === filter);

  const renderItem = ({ item }) => {
    const IconComponent = klasifikasiIcon[item.klasifikasi]
      ? MaterialCommunityIcons
      : MaterialIcons;
    const iconName =
      item.klasifikasi === "prosedur"
        ? "assignment"
        : item.klasifikasi === "lainnya"
          ? "pushpin"
          : klasifikasiIcon[item.klasifikasi] || "pushpin";

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            {item.klasifikasi === "keselamatan" ||
            item.klasifikasi === "lingkungan" ||
            item.klasifikasi === "kualitas" ? (
              <MaterialCommunityIcons
                name={klasifikasiIcon[item.klasifikasi]}
                size={24}
                color={Colors.primary}
              />
            ) : (
              <MaterialIcons
                name={klasifikasiIcon[item.klasifikasi]}
                size={24}
                color={Colors.primary}
              />
            )}
            <View>
              <Text style={styles.klasLabel}>
                {item.klasifikasi.charAt(0).toUpperCase() +
                  item.klasifikasi.slice(1)}
              </Text>
              <View style={styles.tanggalRow}>
                <MaterialIcons
                  name="calendar-today"
                  size={12}
                  color={Colors.textSecondary}
                />
                <Text style={styles.tanggal}>
                  {formatTanggal(item.tanggal_kejadian)}
                </Text>
              </View>
            </View>
          </View>
          <StatusBadge status={item.status} type="laporan" />
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{item.nama_pelapor}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons
            name="location-on"
            size={16}
            color={Colors.textSecondary}
          />
          <Text style={styles.infoText}>{item.lokasi}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons
            name="description"
            size={16}
            color={Colors.textSecondary}
          />
          <Text style={styles.infoText} numberOfLines={2}>
            {item.deskripsi}
          </Text>
        </View>

        {/* Foto Thumbnail */}
        {item.foto && item.foto.length > 0 && (
          <View style={styles.fotoContainer}>
            <View style={styles.fotoLabelRow}>
              <MaterialIcons
                name="photo-camera"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.fotoLabel}>{item.foto.length} Foto:</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.fotoRow}>
                {item.foto.map((foto, i) => (
                  <TouchableOpacity
                    key={foto.id ?? i}
                    onPress={() => openFoto(foto)}
                  >
                    <Image
                      source={{ uri: getFotoUrl(foto.path_foto) }}
                      style={styles.fotoThumb}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

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
              icon="check-circle"
              variant="success"
              size="sm"
              onPress={() => openVerif(item, "diverifikasi")}
              style={styles.halfBtn}
              fullWidth={false}
              isMaterialCommunity
            />
            <Button
              title="Tolak"
              icon="close-circle"
              variant="danger"
              size="sm"
              onPress={() => openVerif(item, "ditolak")}
              style={styles.halfBtn}
              fullWidth={false}
              isMaterialCommunity
            />
          </View>
        )}
      </Card>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Verifikasi Laporan"
        subtitle={`${laporan.filter((l) => l.status === "terkirim").length} menunggu`}
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

      {/* Filter */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterBtn,
                  filter === f && styles.filterBtnActive,
                ]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f && styles.filterTextActive,
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Date Range & Export Toolbar */}
      <View style={styles.exportToolbar}>
        <View style={styles.dateRangeGroup}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Dari:</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              value={dateFrom}
              onChangeText={setDateFrom}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Sampai:</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              value={dateTo}
              onChangeText={setDateTo}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
        <Button
          title="📥 Export Excel"
          onPress={handleExportExcel}
          loading={exporting}
          disabled={exporting}
        />
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
            icon="description"
            title="Tidak Ada Laporan"
            subtitle="Belum ada laporan yang masuk"
          />
        }
        contentContainerStyle={styles.list}
      />

      {/* Modal Verifikasi */}
      <Modal visible={modalVerif} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              {aksi === "diverifikasi" ? (
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={Colors.success}
                />
              ) : (
                <MaterialIcons name="cancel" size={24} color={Colors.danger} />
              )}
              <Text style={styles.modalTitle}>
                {aksi === "diverifikasi" ? "Verifikasi" : "Tolak"} Laporan
              </Text>
            </View>
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
                onPress={() => setModalVerif(false)}
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

      {/* Modal Lihat Foto */}
      <Modal visible={modalFoto} transparent animationType="fade">
        <View style={styles.fotoModalOverlay}>
          <TouchableOpacity
            style={styles.fotoModalClose}
            onPress={() => setModalFoto(false)}
          >
            <MaterialIcons name="close" size={24} color={Colors.white} />
            <Text style={styles.fotoModalCloseText}>Tutup</Text>
          </TouchableOpacity>
          {selectedFoto && (
            <Image
              source={{ uri: getFotoUrl(selectedFoto.path_foto) }}
              style={styles.fotoModalImage}
              resizeMode="contain"
            />
          )}
          {selectedFoto?.keterangan_foto && (
            <Text style={styles.fotoModalKet}>
              {selectedFoto.keterangan_foto}
            </Text>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterRow: { flexDirection: "row", gap: 6 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: "600" },
  filterTextActive: { color: Colors.white },
  exportToolbar: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  dateRangeGroup: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  list: { padding: Spacing.md, gap: 10 },
  card: { marginBottom: 0 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  klasIcon: { marginRight: 12 },
  klasLabel: { ...Typography.h4, color: Colors.textPrimary },
  tanggalRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  tanggal: { ...Typography.caption, color: Colors.textSecondary },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoText: { ...Typography.bodySmall, color: Colors.textPrimary, flex: 1 },
  fotoContainer: { marginTop: 8 },
  fotoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  fotoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  fotoRow: { flexDirection: "row", gap: 8 },
  fotoThumb: {
    width: 70,
    height: 70,
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
  },
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
  label: { ...Typography.label, color: Colors.textPrimary, marginBottom: 4 },
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
  modalTitle: { ...Typography.h3, color: Colors.textPrimary },
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
    minHeight: 48,
    color: Colors.textPrimary,
    fontSize: 15,
    marginBottom: Spacing.sm,
  },
  modalActions: { flexDirection: "row", gap: 8 },
  fotoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fotoModalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fotoModalCloseText: { color: Colors.white, fontSize: 16, fontWeight: "bold" },
  fotoModalImage: { width: "90%", height: "70%" },
  fotoModalKet: {
    color: Colors.white,
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
});
