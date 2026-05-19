import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getAntrean,
  panggilBerikutnya,
  updateStatusAntrean,
} from "../../api/antrean";
import {
  Button,
  Card,
  EmptyState,
  Header,
  LoadingScreen,
  LogoutButton,
  StatusBadge,
} from "../../components/UI";
import { Colors, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { formatWaktu } from "../../utils/helpers";

export default function OperatorAntreanScreen() {
  const { user, logout } = useAuth();
  const [antrean, setAntrean] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAntrean();
  }, []);

  const fetchAntrean = async () => {
    try {
      const res = await getAntrean();
      setAntrean(res.data.data);
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatusAntrean(id, status);
      fetchAntrean();
    } catch (e) {
      Alert.alert("Gagal", "Gagal mengubah status antrean");
    }
  };

  const handlePanggil = async () => {
    try {
      const res = await panggilBerikutnya();
      if (res.data.status) {
        const next = res.data.data;
        Alert.alert(
          "📢 Panggil Antrean",
          `Memanggil nomor:\n${next.nomor_antrean}\n\nAtas nama: ${next.kendaraan?.nama_supir}`,
          [
            { text: "Batal", style: "cancel" },
            {
              text: "Panggil",
              onPress: () => handleUpdateStatus(next.id, "dipanggil"),
            },
          ],
        );
      } else {
        Alert.alert("Info", "Tidak ada antrean yang menunggu saat ini");
      }
    } catch (e) {
      Alert.alert("Gagal", "Gagal memanggil antrean berikutnya");
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      {/* Header Card */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.nomorAntrean}>{item.nomor_antrean}</Text>
          <Text style={styles.waktu}>🕐 {formatWaktu(item.waktu_daftar)}</Text>
        </View>
        <StatusBadge status={item.status} type="antrean" />
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Info Kendaraan */}
      <View style={styles.infoGrid}>
        <InfoItem icon="👤" label="Supir" value={item.kendaraan?.nama_supir} />
        <InfoItem
          icon="🚗"
          label="No. Polisi"
          value={item.kendaraan?.nomor_polisi}
        />
        <InfoItem
          icon="🚛"
          label="Jenis"
          value={item.kendaraan?.jenis_kendaraan}
        />
        <InfoItem
          icon="🏢"
          label="Perusahaan"
          value={item.kendaraan?.perusahaan ?? "-"}
        />
      </View>

      {/* Action Buttons */}
      {item.status === "menunggu" && (
        <Button
          title="Panggil Sekarang"
          icon="📢"
          variant="primary"
          size="sm"
          onPress={() => handleUpdateStatus(item.id, "dipanggil")}
          style={styles.actionBtn}
        />
      )}
      {item.status === "dipanggil" && (
        <Button
          title="Mulai Layani"
          icon="⚙️"
          variant="accent"
          size="sm"
          onPress={() => handleUpdateStatus(item.id, "dilayani")}
          style={styles.actionBtn}
        />
      )}
      {item.status === "dilayani" && (
        <View style={styles.actionRow}>
          <Button
            title="Selesai"
            icon="✅"
            variant="success"
            size="sm"
            onPress={() => handleUpdateStatus(item.id, "selesai")}
            style={styles.halfBtn}
            fullWidth={false}
          />
          <Button
            title="Batalkan"
            icon="❌"
            variant="danger"
            size="sm"
            onPress={() =>
              Alert.alert("Konfirmasi", "Batalkan antrean ini?", [
                { text: "Tidak", style: "cancel" },
                {
                  text: "Ya, Batalkan",
                  onPress: () => handleUpdateStatus(item.id, "batal"),
                },
              ])
            }
            style={styles.halfBtn}
            fullWidth={false}
          />
        </View>
      )}
    </Card>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Manajemen Antrean"
        subtitle={`${antrean.length} antrean hari ini`}
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

      {/* Panggil Berikutnya Button */}
      <View style={styles.panggilContainer}>
        <Button
          title="📢  Panggil Antrean Berikutnya"
          variant="primary"
          size="md"
          onPress={handlePanggil}
        />
      </View>

      {/* Filter Summary */}
      <View style={styles.summary}>
        {["menunggu", "dipanggil", "dilayani", "selesai"].map((s) => (
          <View key={s} style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {antrean.filter((a) => a.status === s).length}
            </Text>
            <Text style={styles.summaryLabel}>{s}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={antrean}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAntrean();
            }}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="Belum Ada Antrean"
            subtitle="Antrean hari ini akan muncul di sini"
          />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <View style={infoStyles.item}>
      <Text style={infoStyles.icon}>{icon}</Text>
      <View>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
    gap: 6,
  },
  icon: { fontSize: 16 },
  label: { ...Typography.caption, color: Colors.textSecondary },
  value: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  panggilContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summary: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 18, fontWeight: "bold", color: Colors.primary },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  list: { padding: Spacing.md, gap: 10 },
  card: { marginBottom: 0 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nomorAntrean: { ...Typography.h4, color: Colors.primary },
  waktu: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.sm,
  },
  actionBtn: { marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  halfBtn: { flex: 1 },
});
