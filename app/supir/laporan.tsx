import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getLaporan } from "../../src/api/laporan";
import { Colors, Spacing, Typography } from "../../src/constants/theme";

export default function SupirLaporanScreen() {
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLaporan = useCallback(async () => {
    try {
      const res = await getLaporan();
      setLaporanList(res.data?.data ?? res.data ?? []);
    } catch {
      // silently fail – user sees empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLaporan();
  };

  const statusColor = (status) => {
    switch (status) {
      case "diverifikasi":
        return "#16a34a";
      case "ditolak":
        return "#dc2626";
      default:
        return "#f59e0b";
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>
          {item.tanggal_kejadian ?? item.created_at?.split("T")[0] ?? "-"}
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: statusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.badgeText, { color: statusColor(item.status) }]}
          >
            {item.status ?? "pending"}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.deskripsi ?? "-"}
      </Text>
      <View style={styles.cardFooter}>
        <MaterialIcons name="location-on" size={14} color={Colors.textLight} />
        <Text style={styles.cardLocation}>{item.lokasi ?? "-"}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Laporan Saya</Text>
          <Text style={styles.headerSubtitle}>Riwayat laporan yang dibuat</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Laporan Saya</Text>
        <Text style={styles.headerSubtitle}>Riwayat laporan yang dibuat</Text>
      </View>
      <FlatList
        data={laporanList}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <MaterialIcons name="assignment" size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Belum Ada Laporan</Text>
            <Text style={styles.emptySubtitle}>
              Buat laporan baru melalui tab "Buat Laporan".
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#1a56db",
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  listContent: { padding: Spacing.md, flexGrow: 1 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardDate: { fontSize: 12, color: "#94a3b8", fontWeight: "500" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  cardTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#334155",
    lineHeight: 22,
    marginBottom: 8,
  },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardLocation: { fontSize: 12, color: "#94a3b8" },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
