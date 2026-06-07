import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getAntrean } from "../../api/antrean";
import { getExportAntreanUrl } from "../../api/laporan";
import { Button, Header, LogoutButton } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { formatStatus, formatWaktu } from "../../utils/helpers";

export default function AdminAntreanScreen() {
  const { user, logout } = useAuth();
  const [antrean, setAntrean] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [exporting, setExporting] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  useEffect(() => {
    fetchAntrean();
  }, []);

  const fetchAntrean = async () => {
    try {
      const res = await getAntrean(selectedDate);
      setAntrean(res.data.data);
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const { url, token } = await getExportAntreanUrl(
        selectedDate,
        selectedDate,
      );
      const fileName = `antrean-${selectedDate}.xlsx`;
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
      <Header
        title="Monitor Antrean"
        subtitle={`Total: ${antrean.length} antrean`}
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

      {/* Export Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.dateInputGroup}>
          <Text style={styles.label}>Pilih Tanggal:</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="YYYY-MM-DD"
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => {
              setLoading(true);
              fetchAntrean();
            }}
          >
            <MaterialIcons name="search" size={18} color="#fff" />
            <Text style={styles.filterBtnText}>Filter</Text>
          </TouchableOpacity>
        </View>
        <Button
          title="📥 Export Excel"
          onPress={handleExportExcel}
          loading={exporting}
          disabled={exporting}
        />
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
  toolbar: {
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 10,
  },
  dateInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1f2937",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
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
