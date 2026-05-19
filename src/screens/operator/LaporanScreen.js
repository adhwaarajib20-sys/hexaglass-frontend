import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getLaporan } from "../../api/laporan";
import { Colors } from "../../constants/theme";

export default function OperatorLaporanScreen() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const getStatusColor = (status) =>
    ({
      draft: Colors.textSecondary,
      terkirim: Colors.statusMenunggu,
      diverifikasi: Colors.statusSelesai,
      ditolak: Colors.statusBatal,
    })[status] ?? Colors.textSecondary;

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Laporan Saya</Text>
        <Text style={styles.headerSubtitle}>Total: {laporan.length}</Text>
      </View>
      <FlatList
        data={laporan}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchLaporan();
            }}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString("id-ID")}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>Belum ada laporan</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: Colors.primary, padding: 20, paddingTop: 50 },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: "bold" },
  headerSubtitle: { color: Colors.primaryLight, fontSize: 13 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "bold", color: Colors.primary, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: Colors.white, fontSize: 12, fontWeight: "bold" },
  description: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  date: { fontSize: 12, color: Colors.textLight },
});
