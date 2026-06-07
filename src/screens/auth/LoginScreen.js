import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Button, Divider } from "../../components/UI";
import {
  Colors,
  Radius,
  Shadow,
  Spacing,
  Typography,
} from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isSmallScreen = width < 380;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Peringatan", "Email dan password harus diisi");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email.trim(), password);

      switch (user.role) {
        case "admin":
          router.replace("/admin/dashboard");
          break;
        case "operator":
          router.replace("/operator/antrean");
          break;
        case "satpam":
          router.replace("/satpam/qr");
          break;
        case "supir":
          router.replace("/supir/scan");
          break;
        default:
          router.replace("/admin/dashboard");
      }
    } catch (error) {
      let msg = "Email atau password salah";

      if (!error?.response) {
        msg = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.response?.status >= 500) {
        msg = "Terjadi kesalahan pada server. Hubungi administrator.";
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }

      Alert.alert("Login Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          isSmallScreen && styles.scrollSmall,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandContainer}>
          <View style={[styles.logoWrapper, isSmallScreen && styles.logoSmall]}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appName}>MigasQueue</Text>
          <Text style={styles.companyName}>PT Migas Hilir Jabar</Text>
          <Text style={styles.tagline}>Sistem Antrean & Pelaporan Digital</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Masuk ke Akun</Text>
          <Text style={styles.cardSubtitle}>
            Masukkan kredensial Anda untuk melanjutkan
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="contoh@email.com"
                placeholderTextColor={Colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Masukkan password"
                placeholderTextColor={Colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />

              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={21}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Masuk"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="lg"
            style={{ marginTop: Spacing.sm }}
          />

          <Divider label="atau" />

          <TouchableOpacity
            style={styles.supirBtn}
            onPress={() => router.replace("/supir/scan")}
            activeOpacity={0.85}
          >
            <View style={styles.supirBtnLeft}>
              <View style={styles.supirIconBox}>
                <MaterialCommunityIcons
                  name="truck-delivery-outline"
                  size={28}
                  color={Colors.primary}
                />
              </View>

              <View style={styles.supirTextBox}>
                <Text style={styles.supirTitle}>Masuk sebagai Supir</Text>
                <Text style={styles.supirSubtitle}>
                  Scan barcode dari petugas satpam
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          © 2026 PT Migas Hilir Jabar. All rights reserved.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    justifyContent: "center",
  },
  scrollSmall: {
    paddingHorizontal: Spacing.md,
  },

  brandContainer: {
    alignItems: "center",
    paddingTop: 45,
    paddingBottom: Spacing.xl,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    backgroundColor: Colors.white,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  logoSmall: {
    width: 78,
    height: 78,
    borderRadius: 20,
  },
  logo: {
    width: 70,
    height: 70,
  },
  appName: {
    ...Typography.h1,
    color: Colors.white,
    marginBottom: 2,
  },
  companyName: {
    ...Typography.h4,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
    textAlign: "center",
  },
  tagline: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },

  card: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: 8,
    marginLeft: 4,
  },

  supirBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  supirBtnLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  supirIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  supirTextBox: {
    flex: 1,
  },
  supirTitle: {
    ...Typography.label,
    color: Colors.primary,
  },
  supirSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  footer: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
