// src/screens/operator/PerusahaanScreen.js
import { MaterialIcons } from "@expo/vector-icons";
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
import { Colors, Radius, Spacing, Typography } from "../../constants/theme";

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
      <View style={styles.cardHeader}>
        <View style={styles.companyInfo}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="business" size={20} color={Colors.primary} />
          </View>
          <View style={styles.companyText}>
            <Text style={styles.nama}>{item.nama_perusahaan}</Text>
            <View style={styles.tagRow}>
              <View style={styles.statusTag}>
                <MaterialIcons
                  name={item.status === "aktif" ? "check-circle" : "cancel"}
                  size={14}
                  color={
                    item.status === "aktif" ? Colors.success : Colors.danger
                  }
                />
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
              {item.is_prioritas ? (
                <Badge color={Colors.accent} textColor={Colors.white}>
                  Prioritas
                </Badge>
              ) : null}
            </View>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.infoRow}>
        <MaterialIcons name="local-drink" size={18} color={Colors.primary} />
        <Text style={styles.infoLabel}>Volume</Text>
        <Text style={styles.infoValue}>{item.volume ?? "-"} L</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="schedule" size={18} color={Colors.primary} />
        <Text style={styles.infoLabel}>Rencana Harian</Text>
        <Text style={styles.infoValue}>
          {item.rencana_pengisian_harian ?? "-"} L
        </Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="info" size={18} color={Colors.primary} />
        <Text style={styles.infoLabel}>Keterangan</Text>
        <Text style={styles.infoValue}>{item.keterangan || "-"}</Text>
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
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="business"
            title="Belum ada data perusahaan"
            subtitle="Cek kembali koneksi atau data perusahaan prioritas"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, paddingBottom: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    marginBottom: 14,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  companyText: { flex: 1 },
  nama: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 6,
  },
  infoLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
});
