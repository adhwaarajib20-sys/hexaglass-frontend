import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    daftarAntrean,
    daftarPerusahaan,
    jenisKendaraan,
    validasiBarcode,
} from "../../api/sesi";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function ScanScreen() {
  const { user, logout } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState("scan");
  const [scanned, setScanned] = useState(false);
  const [kodeBarcode, setKodeBarcode] = useState("");
  const [inputManual, setInputManual] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Dropdown data
  const [jenisKendaraanList, setJenisKendaraanList] = useState([]);
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [perusahaanManual, setPerusahaanManual] = useState(""); // Manual perusahaan input
  const [perusahaanSearch, setPerusahaanSearch] = useState(""); // Search filter untuk perusahaan

  const [form, setForm] = useState({
    nama_supir: "",
    no_hp_supir: "",
    nomor_polisi: "",
    jenis_kendaraan: "",
    kapasitas_tangki: "",
    perusahaan_id: "",
  });

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingDropdown(true);
      try {
        const [resJenis, resPerusahaan] = await Promise.all([
          jenisKendaraan(),
          daftarPerusahaan(),
        ]);
        setJenisKendaraanList(resJenis.data?.data || []);
        setPerusahaanList(resPerusahaan.data?.data || []);
      } catch (e) {
        console.log("Error fetching dropdown data:", e);
      } finally {
        setLoadingDropdown(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleBarcodeScan = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    try {
      const res = await validasiBarcode(data);
      if (res.data?.status === true) {
        setKodeBarcode(data);
        setStep("form");
      } else {
        // Handle case where API returns status false or message
        Alert.alert(
          "Barcode Tidak Valid",
          res.data?.message ?? "Kode tidak valid atau sudah digunakan",
          [
            { text: "Scan Ulang", onPress: () => setScanned(false) },
            { text: "Input Manual", onPress: () => setStep("manual") },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        "Barcode Tidak Valid",
        error.response?.data?.message ??
          "Kode tidak valid atau sudah digunakan",
        [
          { text: "Scan Ulang", onPress: () => setScanned(false) },
          { text: "Input Manual", onPress: () => setStep("manual") },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = async () => {
    if (!inputManual.trim()) {
      Alert.alert("Error", "Masukkan kode barcode terlebih dahulu");
      return;
    }
    setLoading(true);
    try {
      const res = await validasiBarcode(inputManual.trim());
      if (res.data?.status === true) {
        setKodeBarcode(inputManual.trim());
        setStep("form");
      } else {
        // Handle case where API returns status false or message
        Alert.alert(
          "Kode Tidak Valid",
          res.data?.message ?? "Kode tidak valid atau sudah kadaluarsa",
        );
      }
    } catch (error) {
      Alert.alert(
        "Kode Tidak Valid",
        error.response?.data?.message ??
          "Kode tidak valid atau sudah kadaluarsa",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async () => {
    const required = [
      "nama_supir",
      "no_hp_supir",
      "nomor_polisi",
      "jenis_kendaraan",
      "kapasitas_tangki",
    ];
    const missing = required.filter((k) => !form[k].toString().trim());
    if (missing.length > 0) {
      Alert.alert("Data Tidak Lengkap", "Semua field bertanda * wajib diisi");
      return;
    }

    // Validasi kapasitas tangki hanya angka
    if (isNaN(form.kapasitas_tangki) || form.kapasitas_tangki <= 0) {
      Alert.alert(
        "Validasi Error",
        "Kapasitas tangki harus berupa angka positif",
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        kode_barcode: kodeBarcode,
        nama_supir: form.nama_supir,
        no_hp_supir: form.no_hp_supir,
        nomor_polisi: form.nomor_polisi.toUpperCase().trim(),
        jenis_kendaraan: form.jenis_kendaraan,
        kapasitas_tangki: form.kapasitas_tangki,
      };

      // Kirim perusahaan_id jika dari dropdown, atau perusahaan jika manual input
      if (form.perusahaan_id) {
        payload.perusahaan_id = form.perusahaan_id;
      } else if (perusahaanManual.trim()) {
        payload.perusahaan = perusahaanManual.trim();
      } else {
        payload.perusahaan_id = null;
      }

      const res = await daftarAntrean(payload);
      setResult(res.data.data);
      setStep("result");
    } catch (error) {
      Alert.alert(
        "Gagal",
        error.response?.data?.message ?? "Gagal mendaftar antrean",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSalin = async () => {
    await Clipboard.setStringAsync(result.nomor_antrean);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleReset = () => {
    setStep("scan");
    setScanned(false);
    setKodeBarcode("");
    setInputManual("");
    setResult(null);
    setCopied(false);
    setPerusahaanManual("");
    setPerusahaanSearch("");
    setForm({
      nama_supir: "",
      no_hp_supir: "",
      nomor_polisi: "",
      jenis_kendaraan: "",
      kapasitas_tangki: "",
      perusahaan_id: "",
    });
  };

  // ─── STEP INDICATOR ───────────────────────────────────────
  const StepIndicator = ({ current }) => {
    const steps = ["Scan", "Data", "Selesai"];
    const indexes = { scan: 0, manual: 0, form: 1, result: 2 };
    const active = indexes[current] ?? 0;
    return (
      <View style={styles.stepIndicator}>
        {steps.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                i <= active && styles.stepCircleActive,
              ]}
            >
              <Text
                style={[styles.stepNum, i <= active && styles.stepNumActive]}
              >
                {i + 1}
              </Text>
            </View>
            <Text
              style={[styles.stepLabel, i <= active && styles.stepLabelActive]}
            >
              {s}
            </Text>
            {i < steps.length - 1 && (
              <View
                style={[styles.stepLine, i < active && styles.stepLineActive]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  // ─── HEADER ───────────────────────────────────────────────
  const Header = ({ title, subtitle, showBack, onBack }) => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={{ width: 36, height: 36, marginRight: 8 }}
          resizeMode="contain"
        />
        {showBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Kembali</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── SCREEN: SCAN ─────────────────────────────────────────
  if (step === "scan") {
    if (!permission) return <View style={styles.container} />;

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Header title="Scan Barcode" subtitle="Halaman Scan QR" />
          <View style={styles.center}>
            <View style={{ marginBottom: 20 }}>
              <MaterialIcons
                name="qr-code-scanner"
                size={64}
                color={Colors.primary}
                style={{ textAlign: "center" }}
              />
            </View>
            <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
            <Text style={styles.permissionSubtitle}>
              Aplikasi membutuhkan akses kamera untuk scan barcode dari satpam
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={requestPermission}
            >
              <Text style={styles.primaryBtnText}>Izinkan Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setStep("manual")}
            >
              <Text style={styles.secondaryBtnText}>Input Kode Manual</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Header title="Scan Barcode" subtitle="Halaman Scan QR" />
        <StepIndicator current="scan" />

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            Minta barcode dari petugas satpam, lalu arahkan kamera ke barcode
            tersebut
          </Text>
        </View>

        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "code128", "code39", "ean13", "ean8"],
          }}
        >
          <View style={styles.overlay}>
            {/* Corner borders */}
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.scanHint}>
              Arahkan kamera ke barcode satpam
            </Text>
          </View>
        </CameraView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Memvalidasi barcode...</Text>
          </View>
        )}

        {/* Bottom actions */}
        <View style={styles.scanBottom}>
          {scanned && !loading ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.primaryBtnText}>Scan Ulang</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setStep("manual")}
            >
              <Text style={styles.secondaryBtnText}>
                Tidak bisa scan? Input manual
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // ─── SCREEN: MANUAL ───────────────────────────────────────
  if (step === "manual") {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Header title="Input Manual" showBack onBack={() => setStep("scan")} />
        <StepIndicator current="manual" />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Masukkan Kode Barcode</Text>
            <Text style={styles.cardSubtitle}>
              Minta kode unik dari petugas satpam jika kamera tidak bisa
              digunakan
            </Text>

            <TextInput
              style={styles.codeInput}
              placeholder="Masukkan kode di sini..."
              value={inputManual}
              onChangeText={setInputManual}
              autoCapitalize="none"
              autoFocus
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { width: "100%" }]}
              onPress={handleManualInput}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Validasi Kode</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setStep("scan")}
            >
              <Text style={styles.secondaryBtnText}>Coba Scan Lagi</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── SCREEN: FORM ─────────────────────────────────────────
  if (step === "form") {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Header
          title="Data Kendaraan"
          showBack
          onBack={() => setStep("scan")}
        />
        <StepIndicator current="form" />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Success badge */}
          <View style={styles.successBadge}>
            <MaterialIcons
              name="check-circle"
              size={16}
              color={Colors.success}
              style={styles.successIcon}
            />
            <Text style={styles.successBadgeText}>
              Barcode valid! Lengkapi data kendaraan
            </Text>
          </View>

          <View style={styles.card}>
            {/* Nama Supir */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Nama Supir <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  form.nama_supir && styles.fieldInputFilled,
                ]}
                placeholder="Nama lengkap"
                placeholderTextColor="#9ca3af"
                value={form.nama_supir}
                onChangeText={(val) => setForm({ ...form, nama_supir: val })}
              />
            </View>

            {/* No HP Supir */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                No. HP Supir <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  form.no_hp_supir && styles.fieldInputFilled,
                ]}
                placeholder="Contoh: 081234567890"
                placeholderTextColor="#9ca3af"
                value={form.no_hp_supir}
                onChangeText={(val) => setForm({ ...form, no_hp_supir: val })}
                keyboardType="phone-pad"
              />
            </View>

            {/* Nomor Polisi */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Nomor Polisi <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  form.nomor_polisi && styles.fieldInputFilled,
                ]}
                placeholder="Contoh: B 1234 ABC"
                placeholderTextColor="#9ca3af"
                value={form.nomor_polisi}
                onChangeText={(val) => setForm({ ...form, nomor_polisi: val })}
              />
            </View>

            {/* Jenis Kendaraan Dropdown */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Jenis Kendaraan <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.fieldInput, { paddingHorizontal: 0 }]}>
                <Picker
                  selectedValue={form.jenis_kendaraan}
                  onValueChange={(val) => {
                    // Auto-fill kapasitas tangki based on vehicle type
                    const selectedVehicle = jenisKendaraanList.find(
                      (v) => v.id === val,
                    );
                    const newForm = { ...form, jenis_kendaraan: val };
                    if (selectedVehicle && selectedVehicle.kapasitas) {
                      newForm.kapasitas_tangki =
                        selectedVehicle.kapasitas.toString();
                    }
                    setForm(newForm);
                  }}
                  style={{ color: Colors.textPrimary }}
                >
                  <Picker.Item label="-- Pilih Jenis Kendaraan --" value="" />
                  {jenisKendaraanList.map((item) => (
                    <Picker.Item
                      key={item.id}
                      label={item.label}
                      value={item.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Kapasitas Tangki - m³ */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Kapasitas Tangki (m³) <Text style={styles.required}>*</Text>
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: Colors.textLight,
                  marginBottom: 8,
                }}
              >
                📝 Contoh: 1m³ = 1000L
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  form.kapasitas_tangki && styles.fieldInputFilled,
                ]}
                placeholder="Contoh: 5"
                placeholderTextColor="#9ca3af"
                value={form.kapasitas_tangki}
                onChangeText={(val) =>
                  setForm({ ...form, kapasitas_tangki: val })
                }
                keyboardType="decimal-pad"
              />
            </View>

            {/* Perusahaan - Manual Input + Searchable Dropdown */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Perusahaan
                {perusahaanList.length > 0 ? (
                  <Text style={{ fontSize: 12, color: Colors.textLight }}>
                    {" "}
                    (opsional)
                  </Text>
                ) : null}
              </Text>

              {/* Manual Input / Selected Display */}
              <TextInput
                style={[
                  styles.fieldInput,
                  (form.perusahaan_id || perusahaanManual) &&
                    styles.fieldInputFilled,
                ]}
                placeholder="Ketik atau cari perusahaan"
                placeholderTextColor="#9ca3af"
                value={
                  perusahaanManual ||
                  (form.perusahaan_id
                    ? perusahaanList.find((p) => p.id == form.perusahaan_id)
                        ?.nama_perusahaan || ""
                    : "")
                }
                onChangeText={(val) => {
                  setPerusahaanManual(val);
                  setPerusahaanSearch(val);
                  if (val.trim()) {
                    // Jika user ketik manual, clear perusahaan_id selection
                    setForm({ ...form, perusahaan_id: "" });
                  }
                }}
                editable={true}
              />

              {/* Searchable Perusahaan List */}
              {perusahaanList.length > 0 && (
                <View style={styles.perusahaanDropdownContainer}>
                  {/* Tampilkan list perusahaan yang sudah difilter */}
                  <View style={styles.perusahaanListWrapper}>
                    {/* Clear/Tidak Ada Option */}
                    <TouchableOpacity
                      style={[
                        styles.perusahaanListItem,
                        !form.perusahaan_id &&
                          !perusahaanManual &&
                          styles.perusahaanListItemActive,
                      ]}
                      onPress={() => {
                        setForm({ ...form, perusahaan_id: "" });
                        setPerusahaanManual("");
                        setPerusahaanSearch("");
                      }}
                    >
                      <Text style={styles.perusahaanListItemText}>
                        ❌ Tidak Ada / Kosongkan
                      </Text>
                    </TouchableOpacity>

                    {/* VIP Companies First */}
                    {perusahaanList
                      .filter(
                        (p) =>
                          p.is_prioritas &&
                          (!perusahaanSearch.trim() ||
                            p.nama_perusahaan
                              .toLowerCase()
                              .includes(perusahaanSearch.toLowerCase())),
                      )
                      .map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.perusahaanListItem,
                            form.perusahaan_id == item.id &&
                              styles.perusahaanListItemActive,
                          ]}
                          onPress={() => {
                            setForm({ ...form, perusahaan_id: item.id });
                            setPerusahaanManual("");
                            setPerusahaanSearch("");
                          }}
                        >
                          <Text
                            style={[
                              styles.perusahaanListItemText,
                              form.perusahaan_id == item.id &&
                                styles.perusahaanListItemTextActive,
                            ]}
                          >
                            ⭐ {item.nama_perusahaan}{" "}
                            <Text style={styles.vipBadge}>(VIP)</Text>
                          </Text>
                        </TouchableOpacity>
                      ))}

                    {/* Non-VIP Companies */}
                    {perusahaanList
                      .filter(
                        (p) =>
                          !p.is_prioritas &&
                          (!perusahaanSearch.trim() ||
                            p.nama_perusahaan
                              .toLowerCase()
                              .includes(perusahaanSearch.toLowerCase())),
                      )
                      .map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.perusahaanListItem,
                            form.perusahaan_id == item.id &&
                              styles.perusahaanListItemActive,
                          ]}
                          onPress={() => {
                            setForm({ ...form, perusahaan_id: item.id });
                            setPerusahaanManual("");
                            setPerusahaanSearch("");
                          }}
                        >
                          <Text
                            style={[
                              styles.perusahaanListItemText,
                              form.perusahaan_id == item.id &&
                                styles.perusahaanListItemTextActive,
                            ]}
                          >
                            {item.nama_perusahaan}
                          </Text>
                        </TouchableOpacity>
                      ))}

                    {/* No Results Message */}
                    {perusahaanSearch.trim() &&
                      perusahaanList.filter((p) =>
                        p.nama_perusahaan
                          .toLowerCase()
                          .includes(perusahaanSearch.toLowerCase()),
                      ).length === 0 && (
                        <View style={styles.perusahaanNoResults}>
                          <Text style={styles.noResultsText}>
                            Tidak ada perusahaan yang cocok
                          </Text>
                        </View>
                      )}
                  </View>
                </View>
              )}
            </View>

            <Text style={styles.requiredNote}>* Field wajib diisi</Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { width: "100%", marginTop: 8 }]}
              onPress={handleSubmitForm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons
                    name="confirmation-number"
                    size={16}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.primaryBtnText}>Ambil Nomor Antrean</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── SCREEN: RESULT ───────────────────────────────────────
  if (step === "result" && result) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pendaftaran Berhasil</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Nomor Antrean */}
          <View style={styles.resultNomorCard}>
            <MaterialIcons
              name="confirmation-number"
              size={40}
              color={Colors.white}
              style={styles.resultIcon}
            />
            <Text style={styles.resultNomorLabel}>Nomor Antrean Anda</Text>
            <Text style={styles.resultNomorValue}>{result.nomor_antrean}</Text>

            {/* Tombol Salin */}
            <TouchableOpacity
              style={[styles.salinBtn, copied && styles.salinBtnCopied]}
              onPress={handleSalin}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons
                  name="content-copy"
                  size={16}
                  color={Colors.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.salinBtnText}>
                  {copied ? "Tersalin!" : "Salin Nomor Antrean"}
                </Text>
              </View>
            </TouchableOpacity>

            {copied && (
              <Text style={styles.copiedHint}>
                Nomor antrean berhasil disalin ke clipboard
              </Text>
            )}
          </View>

          {/* Status Validasi */}
          {result.is_perusahaan_vip && (
            <View
              style={[
                styles.statusCard,
                { backgroundColor: "rgba(59, 130, 246, 0.15)" },
              ]}
            >
              <View style={styles.statusRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons
                    name="star"
                    size={16}
                    color="#3b82f6"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#3b82f6",
                    }}
                  >
                    Perusahaan VIP
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "#3b82f6",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    Prioritas
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: "#3b82f6", marginTop: 4 }}>
                Antrean ini mendapat prioritas khusus sebagai perusahaan VIP
              </Text>
            </View>
          )}

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusCardLabel}>Status Validasi Satpam</Text>
              <View style={styles.statusPendingBadge}>
                <MaterialIcons
                  name="hourglass-top"
                  size={12}
                  color={Colors.warning}
                  style={styles.statusPendingIcon}
                />
                <Text style={styles.statusPendingText}>Menunggu</Text>
              </View>
            </View>
            <Text style={styles.statusCardNote}>
              Harap tunjukkan nomor antrean kepada petugas satpam untuk
              divalidasi
            </Text>
          </View>

          {/* Info Kendaraan */}
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons
                name="assignment"
                size={16}
                color={Colors.textPrimary}
                style={styles.sectionTitleIcon}
              />
              <Text style={styles.cardSectionTitle}>Ringkasan Data</Text>
            </View>
            {[
              {
                icon: "person",
                label: "Nama Supir",
                val: result.kendaraan?.nama_supir,
              },
              {
                icon: "directions-car",
                label: "No Polisi",
                val: result.kendaraan?.nomor_polisi,
              },
              {
                icon: "local-shipping",
                label: "Jenis",
                val: result.kendaraan?.jenis_kendaraan,
              },
              {
                icon: "local-gas-station",
                label: "Kapasitas",
                val: result.kendaraan?.kapasitas_tangki,
              },
              {
                icon: "business",
                label: "Perusahaan",
                val: result.kendaraan?.perusahaan ?? "-",
              },
            ].map((item) => (
              <View key={item.label} style={styles.summaryRow}>
                <MaterialIcons
                  name={item.icon}
                  size={16}
                  color={Colors.primary}
                  style={styles.summaryIcon}
                />
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={styles.summaryVal}>{item.val}</Text>
              </View>
            ))}
          </View>

          {/* Langkah Selanjutnya */}
          <View style={styles.nextStepsCard}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons
                name="format-list-numbered"
                size={16}
                color={Colors.primary}
                style={styles.sectionTitleIcon}
              />
              <Text style={styles.nextStepsTitle}>Langkah Selanjutnya</Text>
            </View>
            {[
              "1. Tunjukkan nomor antrean ke petugas satpam",
              "2. Tunggu validasi dari satpam",
              "3. Setelah disetujui, tunggu dipanggil operator",
              '4. Cek status di tab "Status Antrean"',
            ].map((step) => (
              <Text key={step} style={styles.nextStepItem}>
                {step}
              </Text>
            ))}
          </View>

          {/* Tombol Aksi */}
          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1 }]}
              onPress={handleSalin}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons
                  name="content-copy"
                  size={16}
                  color={Colors.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryBtnText}>
                  {copied ? "Tersalin!" : "Salin Nomor"}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { flex: 1 }]}
              onPress={handleReset}
            >
              <Text style={styles.secondaryBtnText}>Daftar Lagi</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  // Header
  header: {
    backgroundColor: Colors.primary,
    padding: 16,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: "bold" },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  backBtn: { marginBottom: 4 },
  backBtnText: { color: Colors.primaryLight, fontSize: 13 },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: { color: Colors.white, fontWeight: "bold", fontSize: 13 },

  // Step Indicator
  stepIndicator: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: { backgroundColor: Colors.primary },
  stepNum: { fontSize: 13, fontWeight: "bold", color: Colors.textLight },
  stepNumActive: { color: Colors.white },
  stepLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 6,
    marginRight: 4,
  },
  stepLabelActive: { color: Colors.primary, fontWeight: "600" },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  stepLineActive: { backgroundColor: Colors.primary },

  // Camera
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  scanFrame: {
    width: 260,
    height: 160,
    position: "relative",
    marginBottom: 20,
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: Colors.success,
    borderWidth: 4,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanHint: {
    color: Colors.white,
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanBottom: { backgroundColor: Colors.white, padding: 16 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { color: Colors.white, marginTop: 12, fontSize: 16 },

  // Info Box
  infoBox: {
    backgroundColor: Colors.primaryLight,
    padding: 12,
    marginHorizontal: 0,
  },
  infoBoxText: { color: Colors.primary, fontSize: 13, textAlign: "center" },

  // Buttons
  primaryBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 6,
  },
  primaryBtnText: { color: Colors.white, fontWeight: "bold", fontSize: 15 },
  secondaryBtn: {
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  // Permission
  bigIcon: { fontSize: 56, textAlign: "center", marginBottom: 16 },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  permissionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },

  // Manual Input
  codeInput: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 1,
  },

  // Form Fields
  fieldGroup: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  required: { color: Colors.danger },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#f9fafb",
    color: Colors.textPrimary,
  },
  fieldInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  requiredNote: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    marginBottom: 8,
  },

  // Success Badge
  successBadge: {
    backgroundColor: "rgba(22, 163, 74, 0.15)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  successBadgeText: { color: Colors.success, fontWeight: "600", fontSize: 14 },

  // Result
  resultNomorCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 12,
    elevation: 4,
  },
  resultIcon: { fontSize: 40, marginBottom: 8 },
  resultNomorLabel: {
    color: Colors.primaryLight,
    fontSize: 14,
    marginBottom: 4,
  },
  resultNomorValue: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 16,
  },
  salinBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  salinBtnCopied: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  salinBtnText: { color: Colors.white, fontWeight: "bold", fontSize: 14 },
  copiedHint: { color: Colors.primaryLight, fontSize: 12, marginTop: 8 },

  // Status Card
  statusCard: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusCardLabel: { fontSize: 14, fontWeight: "600", color: Colors.warning },
  statusPendingBadge: {
    backgroundColor: `rgba(245, 158, 11, 0.2)`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  statusPendingIcon: {
    marginRight: 4,
  },
  statusPendingText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: "bold",
  },
  statusCardNote: { fontSize: 13, color: Colors.warning },

  // Summary
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryIcon: { marginRight: 10 },
  summaryLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  summaryVal: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },

  // Next Steps
  nextStepsCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitleIcon: { marginRight: 8 },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: { marginRight: 6 },
  successIcon: { marginRight: 6 },
  nextStepItem: {
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 6,
    lineHeight: 20,
  },

  // Result Actions
  resultActions: { flexDirection: "row", gap: 8, marginTop: 4 },

  // Perusahaan Searchable Dropdown
  perusahaanDropdownContainer: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    maxHeight: 250,
    overflow: "hidden",
  },
  perusahaanListWrapper: {
    paddingVertical: 4,
  },
  perusahaanListItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  perusahaanListItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  perusahaanListItemText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  perusahaanListItemTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  vipBadge: {
    fontSize: 11,
    color: "#d97706",
    fontWeight: "bold",
  },
  perusahaanNoResults: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 13,
    color: Colors.textLight,
    fontStyle: "italic",
  },

  // Old button styles (kept for backward compatibility)
  perusahaanButtonGroup: {
    marginTop: 12,
    paddingHorizontal: 0,
  },
  perusahaanButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  perusahaanButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  perusahaanButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  perusahaanButtonTextActive: {
    color: Colors.white,
  },
});
