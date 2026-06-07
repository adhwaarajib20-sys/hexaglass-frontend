import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { createLaporan } from "../../api/laporan";
import { Button, Card, Header, LogoutButton } from "../../components/UI";
import { Colors, Radius, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

const KLASIFIKASI = [
  {
    key: "keselamatan",
    label: "Keselamatan",
    icon: "security",
    isMaterialCommunity: false,
  },
  {
    key: "lingkungan",
    label: "Lingkungan",
    icon: "leaf",
    isMaterialCommunity: true,
  },
  {
    key: "kualitas",
    label: "Kualitas",
    icon: "target",
    isMaterialCommunity: true,
  },
  {
    key: "prosedur",
    label: "Prosedur",
    icon: "assignment",
    isMaterialCommunity: false,
  },
  {
    key: "lainnya",
    label: "Lainnya",
    icon: "bookmark",
    isMaterialCommunity: false,
  },
];

export default function FormLaporanScreen() {
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };
  const [loading, setLoading] = useState(false);
  const [fotoAssets, setFotoAssets] = useState([]);
  const [form, setForm] = useState({
    nama_pelapor: user?.name ?? "",
    perusahaan: "",
    tanggal_kejadian: new Date().toISOString().split("T")[0],
    waktu_kejadian: new Date().toTimeString().slice(0, 8),
    lokasi: "",
    klasifikasi: "keselamatan",
    deskripsi: "",
    rekomendasi: "",
  });

  const pickFoto = async () => {
    if (fotoAssets.length >= 5) {
      Alert.alert("Batas Foto", "Maksimal 5 foto");
      return;
    }

    Alert.alert("Tambah Foto", "Pilih sumber foto", [
      {
        text: "Kamera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Izin diperlukan", "Izinkan akses kamera");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            allowsEditing: true,
          });
          if (!result.canceled) {
            setFotoAssets((prev) => [...prev, result.assets[0]]);
          }
        },
      },
      {
        text: "🖼️ Galeri",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Izin diperlukan", "Izinkan akses galeri");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.7,
            allowsMultipleSelection: true,
            selectionLimit: 5 - fotoAssets.length,
          });
          if (!result.canceled) {
            setFotoAssets((prev) => [...prev, ...result.assets]);
          }
        },
      },
      { text: "Batal", style: "cancel" },
    ]);
  };

  const hapusFoto = (index) => {
    setFotoAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.lokasi.trim() || !form.deskripsi.trim()) {
      Alert.alert("Peringatan", "Lokasi dan deskripsi wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      fotoAssets.forEach((asset, index) => {
        formData.append("foto[]", {
          uri: asset.uri,
          name: asset.fileName ?? `foto_${index}.jpg`,
          type: asset.mimeType ?? "image/jpeg",
        });
      });

      await createLaporan(formData);

      Alert.alert("Berhasil", "Laporan berhasil dikirim!", [
        {
          text: "OK",
          onPress: () => {
            setForm({
              nama_pelapor: user?.name ?? "",
              perusahaan: "",
              tanggal_kejadian: new Date().toISOString().split("T")[0],
              waktu_kejadian: new Date().toTimeString().slice(0, 8),
              lokasi: "",
              klasifikasi: "keselamatan",
              deskripsi: "",
              rekomendasi: "",
            });
            setFotoAssets([]);
          },
        },
      ]);
    } catch (e) {
      Alert.alert(
        "Gagal",
        e.response?.data?.message ?? "Gagal mengirim laporan",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header
        title="Buat Laporan"
        subtitle="Laporan Ketidaksesuaian Operasional"
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Card>
          {/* Nama Pelapor */}
          <View style={styles.field}>
            <Text style={styles.label}>Nama Pelapor</Text>
            <TextInput
              style={styles.input}
              value={form.nama_pelapor}
              onChangeText={(v) => setForm({ ...form, nama_pelapor: v })}
              placeholder="Nama lengkap"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Perusahaan */}
          <View style={styles.field}>
            <Text style={styles.label}>Perusahaan</Text>
            <TextInput
              style={styles.input}
              value={form.perusahaan}
              onChangeText={(v) => setForm({ ...form, perusahaan: v })}
              placeholder="Nama perusahaan (opsional)"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Tanggal & Waktu */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Tanggal *</Text>
              <TextInput
                style={styles.input}
                value={form.tanggal_kejadian}
                onChangeText={(v) => setForm({ ...form, tanggal_kejadian: v })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textLight}
              />
            </View>
            <View style={{ width: 10 }} />
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Waktu *</Text>
              <TextInput
                style={styles.input}
                value={form.waktu_kejadian}
                onChangeText={(v) => setForm({ ...form, waktu_kejadian: v })}
                placeholder="HH:MM:SS"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>

          {/* Lokasi */}
          <View style={styles.field}>
            <Text style={styles.label}>Lokasi *</Text>
            <TextInput
              style={styles.input}
              value={form.lokasi}
              onChangeText={(v) => setForm({ ...form, lokasi: v })}
              placeholder="Lokasi kejadian"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Klasifikasi */}
          <View style={styles.field}>
            <Text style={styles.label}>Klasifikasi *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.klasifikasiRow}>
                {KLASIFIKASI.map((k) => {
                  const IconComponent = k.isMaterialCommunity
                    ? MaterialCommunityIcons
                    : MaterialIcons;
                  return (
                    <TouchableOpacity
                      key={k.key}
                      style={[
                        styles.klasBtn,
                        form.klasifikasi === k.key && styles.klasBtnActive,
                      ]}
                      onPress={() => setForm({ ...form, klasifikasi: k.key })}
                    >
                      <IconComponent
                        name={k.icon}
                        size={20}
                        color={
                          form.klasifikasi === k.key
                            ? Colors.white
                            : Colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.klasLabel,
                          form.klasifikasi === k.key && styles.klasLabelActive,
                        ]}
                      >
                        {k.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Deskripsi */}
          <View style={styles.field}>
            <Text style={styles.label}>Deskripsi Kejadian *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.deskripsi}
              onChangeText={(v) => setForm({ ...form, deskripsi: v })}
              placeholder="Jelaskan kejadian secara detail..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Rekomendasi */}
          <View style={styles.field}>
            <Text style={styles.label}>Rekomendasi</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.rekomendasi}
              onChangeText={(v) => setForm({ ...form, rekomendasi: v })}
              placeholder="Rekomendasi tindakan perbaikan..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </Card>

        {/* Foto */}
        <Card>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons
              name="photo-camera"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.sectionTitle}>Foto Pendukung</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Tambahkan foto sebagai bukti (maks. 5 foto)
          </Text>

          {/* Preview Foto */}
          {fotoAssets.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.fotoScroll}
            >
              {fotoAssets.map((asset, index) => (
                <View key={index} style={styles.fotoItem}>
                  <View style={styles.fotoWrapper}>
                    <View style={styles.fotoPlaceholder}>
                      <View style={styles.fotoIndexRow}>
                        <MaterialIcons
                          name="photo"
                          size={14}
                          color={Colors.white}
                        />
                        <Text style={styles.fotoIndex}>{index + 1}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.hapusFotoBtn}
                      onPress={() => hapusFoto(index)}
                    >
                      <Text style={styles.hapusFotoBtnText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.fotoNama} numberOfLines={1}>
                    {asset.fileName ?? `Foto ${index + 1}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          <Button
            title={
              fotoAssets.length > 0
                ? `Tambah Foto (${fotoAssets.length}/5)`
                : "Tambah Foto"
            }
            variant="secondary"
            onPress={pickFoto}
            disabled={fotoAssets.length >= 5}
          />
        </Card>

        {/* Submit */}
        <Button
          title="Kirim Laporan"
          icon="send"
          variant="success"
          size="lg"
          onPress={handleSubmit}
          loading={loading}
        />

        <Text style={styles.note}>* Field wajib diisi</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    paddingTop: 50,
  },
  headerTitle: { ...Typography.h3, color: Colors.white },
  headerSubtitle: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  content: { padding: Spacing.md, gap: 12 },
  field: { marginBottom: Spacing.sm },
  label: { ...Typography.label, color: Colors.textPrimary, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  textarea: { height: 100, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  klasifikasiRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  klasBtn: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minWidth: 80,
  },
  klasBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  klasIcon: { marginBottom: 4 },
  klasLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: "600" },
  klasLabelActive: { color: Colors.white },
  fotoScroll: { marginBottom: Spacing.sm },
  fotoItem: { marginRight: 10, alignItems: "center" },
  fotoWrapper: { position: "relative" },
  fotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  fotoIndex: { fontSize: 12, color: Colors.primary, fontWeight: "600" },
  fotoIndexRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  hapusFotoBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: Colors.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  hapusFotoBtnText: { color: Colors.white, fontSize: 10, fontWeight: "bold" },
  fotoNama: {
    fontSize: 10,
    color: Colors.textSecondary,
    width: 80,
    textAlign: "center",
    marginTop: 4,
  },
  note: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
