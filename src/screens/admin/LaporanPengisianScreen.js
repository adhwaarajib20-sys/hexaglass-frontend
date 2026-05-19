import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    deleteLaporanPengisian,
    getLaporanPengisian,
    updateLaporanPengisian,
} from "../../api/laporanPengisian";
import {
    Button,
    Card,
    Divider,
    EmptyState,
    Header,
    StatusBadge,
} from "../../components/UI";
import { Colors, Shadow, Spacing } from "../../constants/theme";
import { formatTanggal } from "../../utils/helpers";

export default function AdminLaporanPengisianScreen() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    jumlah_gas_liter: "",
    catatan: "",
    status: "selesai",
  });

  const fetchData = async () => {
    try {
      const res = await getLaporanPengisian();
      setLaporan(res.data.data || []);
    } catch (error) {
      Alert.alert("Error", "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item) => {
    setSelected(item);
    setForm({
      jumlah_gas_liter: item.jumlah_gas_liter?.toString() || "",
      catatan: item.catatan || "",
      status: item.status || "selesai",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.jumlah_gas_liter) {
      Alert.alert("Error", "Jumlah gas tidak boleh kosong");
      return;
    }
    try {
      await updateLaporanPengisian(selected.id, {
        jumlah_gas_liter: parseFloat(form.jumlah_gas_liter),
        catatan: form.catatan,
        status: form.status,
      });
      Alert.alert("Sukses", "Laporan diperbarui");
      setModalVisible(false);
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan perubahan");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Konfirmasi", "Hapus laporan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await deleteLaporanPengisian(id);
          fetchData();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.antrean}>Antrean #{item.antrean_id}</Text>
          <Text style={styles.tanggal}>{formatTanggal(item.tanggal)}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.info}>
        Gas: {item.jumlah_gas_liter} L | Durasi: {item.durasi_menit} menit
      </Text>
      {item.is_prioritas && (
        <Text style={styles.priority}>Prioritas: {item.alasan_prioritas}</Text>
      )}
      <View style={styles.actionRow}>
        <Button
          variant="primary"
          onPress={() => handleEdit(item)}
          style={{ flex: 1, marginRight: 8 }}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          onPress={() => handleDelete(item.id)}
          style={{ flex: 1 }}
        >
          Hapus
        </Button>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Laporan Pengisian" showLogo />

      <FlatList
        data={laporan}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: Spacing.md }}
        ListEmptyComponent={
          <EmptyState message="Belum ada laporan pengisian" />
        }
      />

      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <Header
            title="Edit Laporan"
            showLogo
            onBack={() => setModalVisible(false)}
          />
          <ScrollView
            contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
          >
            <Text style={styles.modalTitle}>Jumlah Gas (liter)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.jumlah_gas_liter}
              onChangeText={(v) => setForm({ ...form, jumlah_gas_liter: v })}
            />

            <Text style={styles.modalTitle}>Catatan</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Catatan tambahan"
              value={form.catatan}
              onChangeText={(v) => setForm({ ...form, catatan: v })}
            />

            <Divider label="Status" />
            <View style={styles.switchRow}>
              <Button
                variant={form.status === "selesai" ? "success" : "ghost"}
                onPress={() => setForm({ ...form, status: "selesai" })}
              >
                Selesai
              </Button>
              <Button
                variant={form.status === "batal" ? "danger" : "ghost"}
                onPress={() => setForm({ ...form, status: "batal" })}
              >
                Batal
              </Button>
            </View>
          </ScrollView>
          <View style={styles.footerButtons}>
            <Button
              variant="success"
              onPress={handleSave}
              style={{ flex: 1, marginRight: 8 }}
            >
              Simpan
            </Button>
            <Button
              variant="ghost"
              onPress={() => setModalVisible(false)}
              style={{ flex: 1 }}
            >
              Batal
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: { marginBottom: 12, ...Shadow.sm },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  antrean: { fontWeight: "bold", color: Colors.textPrimary, fontSize: 16 },
  tanggal: { color: Colors.textSecondary, fontSize: 12 },
  info: { color: Colors.textPrimary, marginBottom: 4 },
  priority: { color: Colors.accent, fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: "row", marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  switchRow: { flexDirection: "row", marginBottom: 12, gap: 8 },
  footerButtons: {
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginBottom: Platform.OS === "ios" ? 20 : 0,
  },
});
