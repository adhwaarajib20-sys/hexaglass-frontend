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
import { Colors } from "../../constants/theme";
import { formatStatus } from "../../utils/helpers";

export default function SatpamAntreanScreen() {
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
      menunggu: Colors.statusMenunggu,
      dipanggil: Colors.statusDipanggil,
      dilayani: Colors.statusDilayani,
      selesai: Colors.statusSelesai,
      batal: Colors.statusBatal,
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
        <Text style={styles.headerTitle}>Monitor Antrean</Text>
        <Text style={styles.headerSubtitle}>Total: {antrean.length}</Text>
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
              {item.kendaraan?.nomor_polisi} • {item.kendaraan?.jenis_kendaraan}
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
  nomor: { fontSize: 16, fontWeight: "bold", color: Colors.primary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: Colors.white, fontSize: 12, fontWeight: "bold" },
  nama: { fontSize: 15, fontWeight: "600", color: Colors.textPrimary },
  info: { fontSize: 13, color: Colors.textSecondary },
});
