import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Colors,
    Radius,
    Shadow,
    Spacing,
    Typography,
} from "../constants/theme";

// ─── BUTTON ───────────────────────────────────────────────
export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
}) => {
  const variants = {
    primary: {
      bg: Colors.primary,
      text: Colors.textWhite,
      border: Colors.primary,
    },
    secondary: {
      bg: Colors.white,
      text: Colors.primary,
      border: Colors.primary,
    },
    accent: {
      bg: Colors.accent,
      text: Colors.textWhite,
      border: Colors.accent,
    },
    danger: {
      bg: Colors.danger,
      text: Colors.textWhite,
      border: Colors.danger,
    },
    success: {
      bg: Colors.success,
      text: Colors.textWhite,
      border: Colors.success,
    },
    ghost: {
      bg: "transparent",
      text: Colors.textSecondary,
      border: Colors.border,
    },
  };

  const sizes = {
    sm: { padding: 8, fontSize: 13, borderRadius: Radius.sm },
    md: { padding: 14, fontSize: 15, borderRadius: Radius.md },
    lg: { padding: 18, fontSize: 17, borderRadius: Radius.lg },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <TouchableOpacity
      style={[
        btnStyles.base,
        {
          backgroundColor: disabled ? Colors.border : v.bg,
          borderColor: disabled ? Colors.border : v.border,
          borderRadius: s.borderRadius,
          paddingVertical: s.padding,
          width: fullWidth ? "100%" : "auto",
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={btnStyles.content}>
          {icon && (
            <Text style={[btnStyles.icon, { fontSize: s.fontSize + 2 }]}>
              {icon}
            </Text>
          )}
          <Text
            style={[
              btnStyles.text,
              {
                color: disabled ? Colors.textLight : v.text,
                fontSize: s.fontSize,
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const btnStyles = StyleSheet.create({
  base: { borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  content: { flexDirection: "row", alignItems: "center", gap: 6 },
  icon: {},
  text: { fontWeight: "600", textAlign: "center" },
});

// ─── CARD ─────────────────────────────────────────────────
export const Card = ({ children, style, padding = true }) => (
  <View
    style={[
      cardStyles.card,
      padding && { padding: Spacing.md },
      Shadow.sm,
      style,
    ]}
  >
    {children}
  </View>
);

const cardStyles = StyleSheet.create({
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg },
});

// ─── HEADER ───────────────────────────────────────────────
export const Header = ({ title, subtitle, rightAction, showLogo = false }) => (
  <View style={headerStyles.container}>
    <View style={headerStyles.left}>
      {showLogo && (
        <Image
          source={require("../../assets/images/logo.png")}
          style={headerStyles.logo}
          resizeMode="contain"
        />
      )}
      <View>
        <Text style={headerStyles.title}>{title}</Text>
        {subtitle && <Text style={headerStyles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
    {rightAction && <View>{rightAction}</View>}
  </View>
);

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logo: { width: 36, height: 36 },
  title: { ...Typography.h3, color: Colors.textWhite },
  subtitle: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
});

// ─── BADGE ────────────────────────────────────────────────
export const Badge = ({
  label,
  color = Colors.primary,
  textColor = Colors.white,
}) => (
  <View
    style={[
      badgeStyles.badge,
      { backgroundColor: color + "20", borderColor: color + "40" },
    ]}
  >
    <Text style={[badgeStyles.text, { color }]}>{label}</Text>
  </View>
);

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  text: { fontSize: 12, fontWeight: "700" },
});

// ─── STATUS BADGE ─────────────────────────────────────────
export const StatusBadge = ({ status, type = "antrean" }) => {
  const antreanMap = {
    menunggu: { label: "Menunggu", color: Colors.statusMenunggu },
    dipanggil: { label: "Dipanggil", color: Colors.statusDipanggil },
    dilayani: { label: "Dilayani", color: Colors.statusDilayani },
    selesai: { label: "Selesai", color: Colors.statusSelesai },
    batal: { label: "Batal", color: Colors.statusBatal },
  };

  const validasiMap = {
    menunggu_validasi: { label: "⏳ Menunggu", color: Colors.validasiPending },
    disetujui: { label: "✅ Disetujui", color: Colors.validasiDisetujui },
    ditolak: { label: "❌ Ditolak", color: Colors.validasiDitolak },
  };

  const laporanMap = {
    draft: { label: "Draft", color: Colors.textSecondary },
    terkirim: { label: "Terkirim", color: Colors.warning },
    diverifikasi: { label: "Diverifikasi", color: Colors.success },
    ditolak: { label: "Ditolak", color: Colors.danger },
  };

  const map =
    type === "validasi"
      ? validasiMap
      : type === "laporan"
        ? laporanMap
        : antreanMap;
  const item = map[status] ?? { label: status, color: Colors.textSecondary };

  return <Badge label={item.label} color={item.color} />;
};

// ─── EMPTY STATE ──────────────────────────────────────────
export const EmptyState = ({ icon = "📭", title, subtitle }) => (
  <View style={emptyStyles.container}>
    <Text style={emptyStyles.icon}>{icon}</Text>
    <Text style={emptyStyles.title}>{title}</Text>
    {subtitle && <Text style={emptyStyles.subtitle}>{subtitle}</Text>}
  </View>
);

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  icon: { fontSize: 48, marginBottom: Spacing.sm },
  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});

// ─── LOGOUT BUTTON ────────────────────────────────────────
export const LogoutButton = ({ onPress }) => (
  <TouchableOpacity
    style={logoutStyles.btn}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={logoutStyles.text}>Keluar</Text>
  </TouchableOpacity>
);

const logoutStyles = StyleSheet.create({
  btn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  text: { color: Colors.textWhite, fontWeight: "600", fontSize: 13 },
});

// ─── DIVIDER ──────────────────────────────────────────────
export const Divider = ({ label }) => (
  <View style={dividerStyles.container}>
    <View style={dividerStyles.line} />
    {label && <Text style={dividerStyles.label}>{label}</Text>}
    {label && <View style={dividerStyles.line} />}
  </View>
);

const dividerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  label: { marginHorizontal: 12, color: Colors.textLight, fontSize: 13 },
});

// ─── LOADING ──────────────────────────────────────────────
export const LoadingScreen = () => (
  <View style={loadingStyles.container}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={loadingStyles.text}>Memuat...</Text>
  </View>
);

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  text: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});
