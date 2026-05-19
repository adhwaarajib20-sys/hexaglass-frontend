import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getAntrean } from "../../api/antrean";
import { useAuth } from "../../context/AuthContext";
import { formatStatus, formatWaktu } from "../../utils/helpers";

export default function AdminAntreanScreen() {
  const { user } = useAuth();
  const [antrean, setAntrean] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const getStatusColor = (status) =>
    ({
      menunggu: "#f59e0b",
      dipanggil: "#3b82f6",
      dilayani: "#8b5cf6",
      selesai: "#10b981",
      batal: "#ef4444",
    })[status] ?? "#6b7280";

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monitor Antrean</Text>
        <Text style={styles.headerSubtitle}>
          Total: {antrean.length} antrean
        </Text>
      </View>
      <FlatList
        data={antrean}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAntrean();
            }}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.nomor}>{item.nomor_antrean}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.badgeText}>
                  {formatStatus(item.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.nama}>{item.kendaraan?.nama_supir}</Text>
            <Text style={styles.info}>
              {item.kendaraan?.nomor_polisi} • {item.kendaraan?.perusahaan}
            </Text>
            <Text style={styles.waktu}>
              Daftar: {formatWaktu(item.waktu_daftar)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>Tidak ada antrean</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#1a56db", padding: 20, paddingTop: 50 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerSubtitle: { color: "#bfdbfe", fontSize: 13 },
  card: {
    backgroundColor: "#fff",
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
  nomor: { fontSize: 16, fontWeight: "bold", color: "#1a56db" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  nama: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
  info: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  waktu: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
});
