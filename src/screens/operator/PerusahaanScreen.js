// src/screens/operator/PerusahaanScreen.js
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getPerusahaan } from "../../api/perusahaan";
import { Badge, Card, EmptyState, Header } from "../../components/UI";
import { Colors } from "../../constants/theme";

export default function OperatorPerusahaanScreen() {
  const [perusahaan, setPerusahaan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPerusahaan();
        setPerusahaan(res.data.data || []);
      } catch (error) {
        Alert.alert("Error", "Gagal memuat data perusahaan");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.nama}>{item.nama_perusahaan}</Text>
        {item.is_prioritas && <Badge variant="accent">Prioritas</Badge>}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Volume:</Text>
        <Text style={styles.value}>{item.volume ?? "-"} L</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Rencana Harian:</Text>
        <Text style={styles.value}>
          {item.rencana_pengisian_harian ?? "-"} L
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Keterangan:</Text>
        <Text style={styles.value}>{item.keterangan || "-"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <Badge variant={item.status === "aktif" ? "success" : "danger"}>
          {item.status}
        </Badge>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Data Perusahaan (Prioritas)" />
      <FlatList
        data={perusahaan}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<EmptyState message="Belum ada data perusahaan" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  nama: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    flex: 1,
  },
  label: { fontSize: 13, color: Colors.textSecondary, width: 120 },
  value: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "right",
  },
});
