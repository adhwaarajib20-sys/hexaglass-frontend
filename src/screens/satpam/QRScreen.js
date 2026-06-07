import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { generateBarcode, statusBarcode } from "../../api/sesi";
import { Button, Card, Header, LogoutButton } from "../../components/UI";
import { Colors, Shadow, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function SatpamQRScreen() {
  const { user, logout } = useAuth();
  const [barcodeData, setBarcodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [countdownInterval, setCountdownInterval] = useState(null);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleGenerate = async () => {
    setLoading(true);
    // Clear polling & countdown interval sebelumnya
    if (pollingInterval) clearInterval(pollingInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    try {
      const res = await generateBarcode();
      setBarcodeData(res.data.data);

      // Countdown timer
      const expiredAt = new Date(res.data.data.expired_at);
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((expiredAt - now) / 1000);
        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft(0);
          setBarcodeData(null);
          Alert.alert("Info", "QR Code sudah kadaluarsa. Generate yang baru.");
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
      setCountdownInterval(interval);
    } catch (e) {
      Alert.alert("Gagal", "Gagal generate barcode. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!barcodeData) return;
    try {
      await Share.share({
        message: `🔑 Kode Antrean Gas\n\nKode: ${barcodeData.qr_token}\n\nBerlaku hingga: ${new Date(barcodeData.expired_at).toLocaleTimeString("id-ID")}\n\nMasukkan kode ini di aplikasi MigasQueue untuk mendaftar antrean.`,
      });
    } catch (e) {
      console.log("Share error:", e);
    }
  };

  // Polling untuk deteksi ketika QR sudah di-scan & dihapus oleh supir
  useEffect(() => {
    if (!barcodeData) return;

    const checkQRStatus = async () => {
      try {
        const res = await statusBarcode();
        if (!res.data?.status) {
          // QR sudah dihapus atau tidak ada lagi
          // Hentikan countdown timer
          if (countdownInterval) clearInterval(countdownInterval);
          setBarcodeData(null);
          setTimeLeft(null);
          Alert.alert(
            "✅ QR Code Terpakai",
            "QR code sudah berhasil di-scan oleh supir dan kendaraan telah terdaftar antrean.",
          );
        }
      } catch (e) {
        // Jika error (misal QR not found), berarti QR sudah dihapus
        // Hentikan countdown timer
        if (countdownInterval) clearInterval(countdownInterval);
        setBarcodeData(null);
        setTimeLeft(null);
        Alert.alert(
          "✅ QR Code Terpakai",
          "QR code sudah berhasil di-scan oleh supir dan kendaraan telah terdaftar antrean.",
        );
      }
    };

    // Poll setiap 5 detik
    const interval = setInterval(checkQRStatus, 5000);
    setPollingInterval(interval);

    return () => {
      clearInterval(interval);
    };
  }, [barcodeData, countdownInterval]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Generate Barcode"
        subtitle={user?.name}
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {barcodeData ? (
          <>
            {/* QR Code Card */}
            <Card style={styles.qrCard}>
              <Text style={styles.qrTitle}>📱 Barcode Aktif</Text>
              <Text style={styles.qrSubtitle}>
                Tampilkan ke supir untuk di-scan atau bagikan kodenya
              </Text>

              {/* QR Code */}
              <View style={styles.qrWrapper}>
                <QRCode
                  value={barcodeData.qr_token}
                  size={200}
                  color={Colors.primary}
                  backgroundColor={Colors.white}
                />
              </View>

              {/* Timer */}
              {timeLeft !== null && (
                <View
                  style={[
                    styles.timerBadge,
                    {
                      backgroundColor:
                        timeLeft < 60
                          ? Colors.danger + "20"
                          : Colors.success + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.timerText,
                      { color: timeLeft < 60 ? Colors.danger : Colors.success },
                    ]}
                  >
                    ⏰ Berlaku: {formatTime(timeLeft)}
                  </Text>
                </View>
              )}
            </Card>

            {/* Kode Manual Card */}
            <Card style={styles.kodeCard}>
              <Text style={styles.kodeTitle}>🔑 Kode Manual</Text>
              <Text style={styles.kodeSubtitle}>
                Berikan kode ini jika supir tidak bisa scan QR
              </Text>
              <View style={styles.kodeBox}>
                <Text style={styles.kodeText} selectable>
                  {barcodeData.qr_token}
                </Text>
              </View>
            </Card>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button
                title="Bagikan Kode"
                icon="📤"
                variant="primary"
                onPress={handleShare}
              />
              <Button
                title="Generate Barcode Baru"
                icon="🔄"
                variant="secondary"
                onPress={handleGenerate}
                loading={loading}
              />
            </View>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>Belum Ada Barcode Aktif</Text>
            <Text style={styles.emptySubtitle}>
              Generate barcode baru setiap ada supir yang ingin mendaftar
              antrean pengisian gas
            </Text>

            {/* Info Steps */}
            <View style={styles.steps}>
              {[
                { num: "1", text: "Tap tombol Generate di bawah" },
                { num: "2", text: "Tampilkan QR ke supir untuk di-scan" },
                { num: "3", text: "Atau bagikan kode manual ke supir" },
                { num: "4", text: "Validasi data supir di tab Validasi" },
              ].map((step) => (
                <View key={step.num} style={styles.stepItem}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{step.num}</Text>
                  </View>
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              ))}
            </View>

            <Button
              title="Generate Barcode"
              icon="📊"
              variant="primary"
              size="lg"
              onPress={handleGenerate}
              loading={loading}
            />
          </Card>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, gap: 12 },

  // QR Card
  qrCard: { alignItems: "center" },
  qrTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 4 },
  qrSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  qrWrapper: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  timerBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  timerText: { fontWeight: "bold", fontSize: 16 },

  // Kode Card
  kodeCard: {},
  kodeTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom: 4 },
  kodeSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  kodeBox: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  kodeText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Actions
  actions: { gap: 8 },

  // Empty
  emptyCard: { alignItems: "center" },
  emptyIcon: { fontSize: 56, marginBottom: Spacing.sm },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },

  // Steps
  steps: { width: "100%", marginBottom: Spacing.lg, gap: 10 },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumText: { color: Colors.white, fontWeight: "bold", fontSize: 13 },
  stepText: { ...Typography.body, color: Colors.textPrimary, flex: 1 },
});
