import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { getDashboard } from "../../api/dashboard";
import { getExportPengisianUrl } from "../../api/laporan";
import {
    Button,
    Card,
    Header,
    LoadingScreen,
    LogoutButton,
} from "../../components/UI";
import { Colors, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res.data.data);
    } catch (e) {
      console.log("Dashboard error:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const { url, token } = await getExportPengisianUrl(dateFrom, dateTo);
      const fileName = `rekap-pengisian-${dateFrom}-${dateTo}.xlsx`;
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

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        subtitle={`Selamat datang, ${user?.name}`}
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

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
          title="📥 Export"
          onPress={handleExportExcel}
          loading={exporting}
          disabled={exporting}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDashboard();
            }}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Antrean Hari Ini */}
        <View style={styles.sectionTitleRow}>
          <MaterialIcons
            name="assignment"
            size={20}
            color={Colors.textPrimary}
          />
          <Text style={styles.sectionTitle}>Antrean Hari Ini</Text>
        </View>
        <View style={styles.grid}>
          <StatCard
            label="Total"
            value={data?.antrean?.hari_ini?.total}
            color={Colors.primary}
            icon="bar-chart"
          />
          <StatCard
            label="Menunggu"
            value={data?.antrean?.hari_ini?.menunggu}
            color={Colors.warning}
            icon="hourglass-bottom"
          />
          <StatCard
            label="Dilayani"
            value={data?.antrean?.hari_ini?.dilayani}
            color={Colors.info}
            icon="build"
          />
          <StatCard
            label="Selesai"
            value={data?.antrean?.hari_ini?.selesai}
            color={Colors.success}
            icon="done"
          />
        </View>

        {/* Antrean Bulan Ini */}
        <View style={styles.sectionTitleRow}>
          <MaterialIcons
            name="calendar-today"
            size={20}
            color={Colors.textPrimary}
          />
          <Text style={styles.sectionTitle}>Antrean Bulan Ini</Text>
        </View>
        <View style={styles.grid}>
          <StatCard
            label="Total"
            value={data?.antrean?.bulan_ini?.total}
            color={Colors.primary}
            icon="bar-chart"
            wide
          />
          <StatCard
            label="Selesai"
            value={data?.antrean?.bulan_ini?.selesai}
            color={Colors.success}
            icon="done"
            wide
          />
          <StatCard
            label="Batal"
            value={data?.antrean?.bulan_ini?.batal}
            color={Colors.danger}
            icon="cancel"
            wide
          />
        </View>

        {/* Laporan */}
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="note" size={20} color={Colors.textPrimary} />
          <Text style={styles.sectionTitle}>Laporan Ketidaksesuaian</Text>
        </View>
        <View style={styles.grid}>
          <StatCard
            label="Total"
            value={data?.laporan?.total}
            color={Colors.primary}
            icon="clipboard"
          />
          <StatCard
            label="Menunggu"
            value={data?.laporan?.terkirim}
            color={Colors.warning}
            icon="hourglass-bottom"
          />
          <StatCard
            label="Diverifikasi"
            value={data?.laporan?.diverifikasi}
            color={Colors.success}
            icon="done"
          />
          <StatCard
            label="Ditolak"
            value={data?.laporan?.ditolak}
            color={Colors.danger}
            icon="cancel"
          />
        </View>

        {/* Per Klasifikasi */}
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="label" size={20} color={Colors.textPrimary} />
          <Text style={styles.sectionTitle}>Laporan per Klasifikasi</Text>
        </View>
        <Card style={styles.klasifikasiCard}>
          {[
            {
              label: "Keselamatan",
              key: "keselamatan",
              icon: "health-and-safety",
              isMaterialCommunity: true,
              color: Colors.danger,
            },
            {
              label: "Lingkungan",
              key: "lingkungan",
              icon: "leaf",
              isMaterialCommunity: true,
              color: Colors.success,
            },
            {
              label: "Kualitas",
              key: "kualitas",
              icon: "target",
              isMaterialCommunity: true,
              color: Colors.info,
            },
            {
              label: "Prosedur",
              key: "prosedur",
              icon: "assignment",
              isMaterialCommunity: false,
              color: Colors.warning,
            },
            {
              label: "Lainnya",
              key: "lainnya",
              icon: "pushpin",
              isMaterialCommunity: true,
              color: Colors.textSecondary,
            },
          ].map((item, index, arr) => {
            const IconComponent = item.isMaterialCommunity
              ? MaterialCommunityIcons
              : MaterialIcons;
            return (
              <View
                key={item.key}
                style={[
                  styles.klasifikasiRow,
                  index < arr.length - 1 && styles.klasifikasiRowBorder,
                ]}
              >
                <IconComponent
                  name={item.icon}
                  size={20}
                  color={item.color}
                  style={styles.klasifikasiIcon}
                />
                <Text style={styles.klasifikasiLabel}>{item.label}</Text>
                <View
                  style={[
                    styles.klasifikasiCount,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Text
                    style={[styles.klasifikasiValue, { color: item.color }]}
                  >
                    {data?.laporan?.per_klasifikasi?.[item.key] ?? 0}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        {/* User */}
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="group" size={20} color={Colors.textPrimary} />
          <Text style={styles.sectionTitle}>Data Pengguna</Text>
        </View>
        <View style={styles.grid}>
          <StatCard
            label="Total User"
            value={data?.user?.total}
            color={Colors.primary}
            icon="group"
          />
          <StatCard
            label="Aktif"
            value={data?.user?.aktif}
            color={Colors.success}
            icon="done"
          />
          <StatCard
            label="Operator"
            value={data?.user?.per_role?.operator}
            color={Colors.info}
            icon="construction"
          />
          <StatCard
            label="Supir"
            value={data?.user?.per_role?.supir}
            color={Colors.warning}
            icon="local-shipping"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="flash-on" size={20} color={Colors.textPrimary} />
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        </View>
        <View style={styles.quickActions}>
          <Button
            title="Lihat Semua Antrean"
            variant="primary"
            onPress={() => router.push("/admin/antrean")}
            style={styles.quickBtn}
          />
          <Button
            title="Verifikasi Laporan"
            variant="secondary"
            onPress={() => router.push("/admin/laporan")}
            style={styles.quickBtn}
          />
          <Button
            title="Kelola Pengguna"
            variant="ghost"
            onPress={() => router.push("/admin/users")}
            style={styles.quickBtn}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, color, icon, wide }) {
  return (
    <View style={[styles.statCard, wide && styles.statCardWide]}>
      <View style={[styles.statIconWrapper, { backgroundColor: color + "15" }]}>
        <MaterialIcons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value ?? 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  scroll: { flex: 1 },
  content: { padding: Spacing.md },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    width: "47%",
    alignItems: "center",
    ...require("../../constants/theme").Shadow.sm,
  },
  statCardWide: { width: "30%" },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 28, fontWeight: "bold", marginBottom: 2 },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Klasifikasi
  klasifikasiCard: { marginBottom: 4 },
  klasifikasiRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  klasifikasiRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  klasifikasiIcon: { marginRight: 10 },
  klasifikasiLabel: { flex: 1, ...Typography.body, color: Colors.textPrimary },
  klasifikasiCount: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  klasifikasiValue: { fontWeight: "bold", fontSize: 14 },

  // Quick Actions
  quickActions: { gap: 8 },
  quickBtn: { marginBottom: 0 },
});
