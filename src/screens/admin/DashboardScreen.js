import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getDashboard } from "../../api/dashboard";
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

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        subtitle={`Selamat datang, ${user?.name}`}
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

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
        <Text style={styles.sectionTitle}>📋 Antrean Hari Ini</Text>
        <View style={styles.grid}>
          <StatCard
            label="Total"
            value={data?.antrean?.hari_ini?.total}
            color={Colors.primary}
            icon="📊"
          />
          <StatCard
            label="Menunggu"
            value={data?.antrean?.hari_ini?.menunggu}
            color={Colors.warning}
            icon="⏳"
          />
          <StatCard
            label="Dilayani"
            value={data?.antrean?.hari_ini?.dilayani}
            color={Colors.info}
            icon="⚙️"
          />
          <StatCard
            label="Selesai"
            value={data?.antrean?.hari_ini?.selesai}
            color={Colors.success}
            icon="✅"
          />
        </View>

        {/* Antrean Bulan Ini */}
        <Text style={styles.sectionTitle}>📅 Antrean Bulan Ini</Text>
        <View style={styles.grid}>
          <StatCard
            label="Total"
            value={data?.antrean?.bulan_ini?.total}
            color={Colors.primary}
            icon="📊"
            wide
          />
          <StatCard
            label="Selesai"
            value={data?.antrean?.bulan_ini?.selesai}
            color={Colors.success}
            icon="✅"
            wide
          />
          <StatCard
            label="Batal"
            value={data?.antrean?.bulan_ini?.batal}
            color={Colors.danger}
            icon="❌"
            wide
          />
        </View>

        {/* Laporan */}
        <Text style={styles.sectionTitle}>📝 Laporan Ketidaksesuaian</Text>
        <View style={styles.grid}>
          <StatCard
            label="Total"
            value={data?.laporan?.total}
            color={Colors.primary}
            icon="📋"
          />
          <StatCard
            label="Menunggu"
            value={data?.laporan?.terkirim}
            color={Colors.warning}
            icon="⏳"
          />
          <StatCard
            label="Diverifikasi"
            value={data?.laporan?.diverifikasi}
            color={Colors.success}
            icon="✅"
          />
          <StatCard
            label="Ditolak"
            value={data?.laporan?.ditolak}
            color={Colors.danger}
            icon="❌"
          />
        </View>

        {/* Per Klasifikasi */}
        <Text style={styles.sectionTitle}>🏷️ Laporan per Klasifikasi</Text>
        <Card style={styles.klasifikasiCard}>
          {[
            {
              label: "Keselamatan",
              key: "keselamatan",
              icon: "⛑️",
              color: Colors.danger,
            },
            {
              label: "Lingkungan",
              key: "lingkungan",
              icon: "🌿",
              color: Colors.success,
            },
            {
              label: "Kualitas",
              key: "kualitas",
              icon: "🎯",
              color: Colors.info,
            },
            {
              label: "Prosedur",
              key: "prosedur",
              icon: "📋",
              color: Colors.warning,
            },
            {
              label: "Lainnya",
              key: "lainnya",
              icon: "📌",
              color: Colors.textSecondary,
            },
          ].map((item, index, arr) => (
            <View
              key={item.key}
              style={[
                styles.klasifikasiRow,
                index < arr.length - 1 && styles.klasifikasiRowBorder,
              ]}
            >
              <Text style={styles.klasifikasiIcon}>{item.icon}</Text>
              <Text style={styles.klasifikasiLabel}>{item.label}</Text>
              <View
                style={[
                  styles.klasifikasiCount,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Text style={[styles.klasifikasiValue, { color: item.color }]}>
                  {data?.laporan?.per_klasifikasi?.[item.key] ?? 0}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* User */}
        <Text style={styles.sectionTitle}>👥 Data Pengguna</Text>
        <View style={styles.grid}>
          <StatCard
            label="Total User"
            value={data?.user?.total}
            color={Colors.primary}
            icon="👥"
          />
          <StatCard
            label="Aktif"
            value={data?.user?.aktif}
            color={Colors.success}
            icon="✅"
          />
          <StatCard
            label="Operator"
            value={data?.user?.per_role?.operator}
            color={Colors.info}
            icon="👷"
          />
          <StatCard
            label="Supir"
            value={data?.user?.per_role?.supir}
            color={Colors.warning}
            icon="🚛"
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>⚡ Aksi Cepat</Text>
        <View style={styles.quickActions}>
          <Button
            title="Lihat Semua Antrean"
            icon="📋"
            variant="primary"
            onPress={() => router.push("/admin/antrean")}
            style={styles.quickBtn}
          />
          <Button
            title="Verifikasi Laporan"
            icon="📝"
            variant="secondary"
            onPress={() => router.push("/admin/laporan")}
            style={styles.quickBtn}
          />
          <Button
            title="Kelola Pengguna"
            icon="👥"
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
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value ?? 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
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
  statIcon: { fontSize: 22 },
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
  klasifikasiIcon: { fontSize: 20, marginRight: 10 },
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
