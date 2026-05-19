// src/screens/admin/PerusahaanScreen.js
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
    createPerusahaan,
    deletePerusahaan,
    getPerusahaan,
    updatePerusahaan,
} from "../../api/perusahaan";
import { Button, Card, Divider, EmptyState, Header } from "../../components/UI";
import { Colors, Shadow, Spacing } from "../../constants/theme";

export default function AdminPerusahaanScreen() {
  const [perusahaan, setPerusahaan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    nama_perusahaan: "",
    is_prioritas: false,
    volume: "",
    rencana_pengisian_harian: "",
    keterangan: "",
    status: "aktif",
  });

  const fetchData = async () => {
    try {
      const res = await getPerusahaan();
      setPerusahaan(res.data.data || []);
    } catch (error) {
      Alert.alert("Error", "Gagal memuat data perusahaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!form.nama_perusahaan.trim()) {
      Alert.alert("Error", "Nama perusahaan wajib diisi");
      return;
    }
    try {
      const payload = {
        nama_perusahaan: form.nama_perusahaan.trim(),
        is_prioritas: form.is_prioritas,
        volume: form.volume ? parseFloat(form.volume) : null,
        rencana_pengisian_harian: form.rencana_pengisian_harian
          ? parseFloat(form.rencana_pengisian_harian)
          : null,
        keterangan: form.keterangan.trim() || null,
        status: form.status,
      };

      if (selected) {
        await updatePerusahaan(selected.id, payload);
        Alert.alert("Sukses", "Data perusahaan diperbarui");
      } else {
        await createPerusahaan(payload);
        Alert.alert("Sukses", "Perusahaan baru ditambahkan");
      }
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan data");
    }
  };

  const handleEdit = (item) => {
    setSelected(item);
    setForm({
      nama_perusahaan: item.nama_perusahaan,
      is_prioritas: item.is_prioritas,
      volume: item.volume?.toString() || "",
      rencana_pengisian_harian: item.rencana_pengisian_harian?.toString() || "",
      keterangan: item.keterangan || "",
      status: item.status || "aktif",
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert("Konfirmasi", "Hapus perusahaan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await deletePerusahaan(id);
          fetchData();
        },
      },
    ]);
  };

  const resetForm = () => {
    setSelected(null);
    setForm({
      nama_perusahaan: "",
      is_prioritas: false,
      volume: "",
      rencana_pengisian_harian: "",
      keterangan: "",
      status: "aktif",
    });
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.nama}>{item.nama_perusahaan}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {item.is_prioritas && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>Prioritas</Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "aktif" ? Colors.success : Colors.danger,
              },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Volume</Text>
        <Text style={styles.value}>
          {item.volume ? `${item.volume} L` : "-"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Rencana Harian</Text>
        <Text style={styles.value}>
          {item.rencana_pengisian_harian
            ? `${item.rencana_pengisian_harian} L`
            : "-"}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Keterangan</Text>
        <Text style={styles.value}>{item.keterangan || "-"}</Text>
      </View>
      <View style={styles.actionRow}>
        <Button
          title="Edit"
          variant="primary"
          onPress={() => handleEdit(item)}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="Hapus"
          variant="danger"
          onPress={() => handleDelete(item.id)}
          style={{ flex: 1 }}
        />
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
      <Header title="Data Perusahaan" showLogo />

      <Button
        title="Tambah Perusahaan"
        variant="accent"
        fullWidth={false}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
        style={{
          marginHorizontal: Spacing.md,
          marginTop: Spacing.md,
          marginBottom: Spacing.md,
        }}
      />

      <FlatList
        data={perusahaan}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: Spacing.md,
          paddingBottom: 20,
        }}
        ListEmptyComponent={<EmptyState message="Tidak ada data perusahaan" />}
      />

      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <Header
            title={selected ? "Edit Perusahaan" : "Tambah Perusahaan"}
            showLogo
            onBack={() => setModalVisible(false)}
          />

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
          >
            <Text style={styles.modalTitle}>Nama Perusahaan</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama perusahaan"
              value={form.nama_perusahaan}
              onChangeText={(v) => setForm({ ...form, nama_perusahaan: v })}
            />

            <Text style={styles.modalTitle}>Volume (liter)</Text>
            <TextInput
              style={styles.input}
              placeholder="Volume dalam liter"
              keyboardType="numeric"
              value={form.volume}
              onChangeText={(v) => setForm({ ...form, volume: v })}
            />

            <Text style={styles.modalTitle}>
              Rencana Pengisian Harian (liter)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Rencana harian"
              keyboardType="numeric"
              value={form.rencana_pengisian_harian}
              onChangeText={(v) =>
                setForm({ ...form, rencana_pengisian_harian: v })
              }
            />

            <Text style={styles.modalTitle}>Keterangan</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Keterangan tambahan"
              value={form.keterangan}
              onChangeText={(v) => setForm({ ...form, keterangan: v })}
            />

            <Divider label="Pengaturan" />

            <Text style={styles.modalTitle}>Status Prioritas</Text>
            <View style={styles.switchRow}>
              <Button
                title="Ya"
                variant={form.is_prioritas ? "accent" : "ghost"}
                onPress={() => setForm({ ...form, is_prioritas: true })}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Tidak"
                variant={!form.is_prioritas ? "accent" : "ghost"}
                onPress={() => setForm({ ...form, is_prioritas: false })}
                style={{ flex: 1 }}
              />
            </View>

            <Text style={styles.modalTitle}>Status Perusahaan</Text>
            <View style={styles.switchRow}>
              <Button
                title="Aktif"
                variant={form.status === "aktif" ? "success" : "ghost"}
                onPress={() => setForm({ ...form, status: "aktif" })}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Nonaktif"
                variant={form.status === "nonaktif" ? "danger" : "ghost"}
                onPress={() => setForm({ ...form, status: "nonaktif" })}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>

          <View style={styles.footerButtons}>
            <Button
              title={selected ? "Simpan Perubahan" : "Simpan"}
              variant="success"
              onPress={handleSave}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Batal"
              variant="ghost"
              onPress={() => setModalVisible(false)}
              style={{ flex: 1 }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  card: {
    marginBottom: 12,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  nama: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  detailRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  label: { fontWeight: "600", width: 120, color: Colors.textSecondary },
  value: { color: Colors.textPrimary, flex: 1 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  footerButtons: {
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginBottom: Platform.OS === "ios" ? 20 : 0,
  },
});
