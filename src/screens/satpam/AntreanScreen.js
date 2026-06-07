import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getAntrean } from "../../api/antrean";
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
import { formatWaktu } from "../../utils/helpers";

export default function SatpamAntreanScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };
  const [antrean, setAntrean] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchAntrean();
  }, []);

  const fetchAntrean = async () => {
    try {
      const res = await getAntrean();
      setAntrean(res.data.data);
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleShowDetail = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setSelectedItem(null);
  };

  const renderDetailItem = (icon, label, value) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelRow}>
        <MaterialIcons name={icon} size={18} color={Colors.primary} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value || "-"}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleShowDetail(item)}>
      <Card style={styles.card}>
        {/* Header Card */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.nomorAntrean}>{item.nomor_antrean}</Text>
            <View style={styles.timeRow}>
              <MaterialIcons
                name="access-time"
                size={12}
                color={Colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.waktu}>{formatWaktu(item.waktu_daftar)}</Text>
            </View>
          </View>
          <StatusBadge status={item.status} type="antrean" />
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Info Kendaraan */}
        <View style={styles.infoGrid}>
          <InfoItem
            icon="person"
            label="Supir"
            value={item.kendaraan?.nama_supir}
          />
          <InfoItem
            icon="directions-car"
            label="No. Polisi"
            value={item.kendaraan?.nomor_polisi}
          />
          <InfoItem
            icon="local-shipping"
            label="Jenis"
            value={item.kendaraan?.jenis_kendaraan}
          />
          <InfoItem
            icon="business"
            label="Perusahaan"
            value={item.kendaraan?.perusahaan ?? "-"}
          />
        </View>

        {/* Tap Hint */}
        <View style={styles.tapHint}>
          <MaterialIcons name="info" size={14} color={Colors.textSecondary} />
          <Text style={styles.tapHintText}>Tap untuk lihat detail</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Monitor Antrean"
        subtitle={`${antrean.length} kendaraan hari ini`}
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

      {/* Status Summary */}
      <View style={styles.summary}>
        {["menunggu", "dipanggil", "dilayani", "selesai"].map((s) => (
          <View key={s} style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {antrean.filter((a) => a.status === s).length}
            </Text>
            <Text style={styles.summaryLabel}>{s}</Text>
          </View>
        ))}
      </View>

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
            icon="assignment"
            title="Belum Ada Antrean"
            subtitle="Antrean hari ini akan muncul di sini"
          />
        }
        contentContainerStyle={styles.list}
      />

      {/* Detail Modal */}
      <Modal visible={detailModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Antrean</Text>
              <TouchableOpacity onPress={handleCloseDetail}>
                <MaterialIcons
                  name="close"
                  size={28}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedItem && (
                <>
                  {/* Nomor Antrean */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Nomor Antrean</Text>
                  </View>
                  <View style={styles.nomorDisplay}>
                    <Text style={styles.nomorBesar}>
                      {selectedItem.nomor_antrean}
                    </Text>
                    <StatusBadge status={selectedItem.status} type="antrean" />
                  </View>

                  {/* Waktu */}
                  <View
                    style={[styles.sectionHeader, { marginTop: Spacing.lg }]}
                  >
                    <Text style={styles.sectionTitle}>Waktu</Text>
                  </View>
                  {renderDetailItem(
                    "access-time",
                    "Waktu Daftar",
                    new Date(selectedItem.waktu_daftar).toLocaleString("id-ID"),
                  )}
                  {selectedItem.waktu_dipanggil &&
                    renderDetailItem(
                      "campaign",
                      "Waktu Dipanggil",
                      new Date(selectedItem.waktu_dipanggil).toLocaleString(
                        "id-ID",
                      ),
                    )}
                  {selectedItem.waktu_dilayani &&
                    renderDetailItem(
                      "build",
                      "Waktu Dilayani",
                      new Date(selectedItem.waktu_dilayani).toLocaleString(
                        "id-ID",
                      ),
                    )}

                  {/* Info Supir */}
                  <View
                    style={[styles.sectionHeader, { marginTop: Spacing.lg }]}
                  >
                    <Text style={styles.sectionTitle}>Informasi Supir</Text>
                  </View>
                  {renderDetailItem(
                    "person",
                    "Nama",
                    selectedItem.kendaraan?.nama_supir,
                  )}
                  {renderDetailItem(
                    "phone",
                    "No. HP",
                    selectedItem.kendaraan?.no_hp_supir ?? "-",
                  )}

                  {/* Info Kendaraan */}
                  <View
                    style={[styles.sectionHeader, { marginTop: Spacing.lg }]}
                  >
                    <Text style={styles.sectionTitle}>Informasi Kendaraan</Text>
                  </View>
                  {renderDetailItem(
                    "directions-car",
                    "No. Polisi",
                    selectedItem.kendaraan?.nomor_polisi,
                  )}
                  {renderDetailItem(
                    "local-shipping",
                    "Jenis Kendaraan",
                    selectedItem.kendaraan?.jenis_kendaraan,
                  )}
                  {renderDetailItem(
                    "business",
                    "Perusahaan",
                    selectedItem.kendaraan?.perusahaan ?? "-",
                  )}
                  {renderDetailItem(
                    "oil-barrel",
                    "Tipe Bahan Bakar",
                    selectedItem.kendaraan?.tipe_bahan_bakar ?? "-",
                  )}

                  {/* Info Estimasi */}
                  {selectedItem.estimasi_pengisian && (
                    <>
                      <View
                        style={[
                          styles.sectionHeader,
                          { marginTop: Spacing.lg },
                        ]}
                      >
                        <Text style={styles.sectionTitle}>
                          Estimasi Pengisian
                        </Text>
                      </View>
                      {renderDetailItem(
                        "schedule",
                        "Durasi",
                        `${selectedItem.estimasi_pengisian} menit`,
                      )}
                    </>
                  )}

                  {/* Status Validasi */}
                  <View
                    style={[styles.sectionHeader, { marginTop: Spacing.lg }]}
                  >
                    <Text style={styles.sectionTitle}>Status Validasi</Text>
                  </View>
                  {renderDetailItem(
                    "verified-user",
                    "Validasi Satpam",
                    selectedItem.status_validasi_satpam
                      ? selectedItem.status_validasi_satpam
                          .charAt(0)
                          .toUpperCase() +
                          selectedItem.status_validasi_satpam.slice(1)
                      : "-",
                  )}

                  <View style={{ height: Spacing.xl }} />
                </>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Button
                title="Tutup"
                variant="secondary"
                onPress={handleCloseDetail}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIconWrapper}>
      <MaterialIcons name={icon} size={16} color={Colors.primary} />
    </View>
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },

  // Header & Summary
  summary: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: "center",
    elevation: 2,
  },
  summaryValue: {
    ...Typography.h4,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },

  // Card
  card: { marginBottom: Spacing.md },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  nomorAntrean: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  waktu: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: Spacing.md,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  infoItem: {
    flex: 1,
    minWidth: "48%",
    paddingBottom: Spacing.sm,
  },
  infoIconWrapper: {
    marginBottom: Spacing.xs,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoTextWrapper: { gap: 2 },
  infoValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  tapHintText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  modalContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  modalFooter: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  // Detail Modal Content
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  nomorDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  nomorBesar: {
    ...Typography.h2,
    color: Colors.primary,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detailLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
});
