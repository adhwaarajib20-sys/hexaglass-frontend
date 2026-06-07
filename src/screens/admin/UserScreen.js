import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
import { getUsers, toggleStatus } from "../../api/user";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Header,
  LoadingScreen,
  LogoutButton,
} from "../../components/UI";
import { Colors, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function AdminUserScreen() {
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("semua");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data);
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

  const handleToggle = (id, nama, status) => {
    const newStatus = status === "aktif" ? "nonaktif" : "aktif";
    Alert.alert(
      "Ubah Status",
      `${newStatus === "aktif" ? "Aktifkan" : "Nonaktifkan"} akun ${nama}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          onPress: async () => {
            try {
              await toggleStatus(id);
              fetchUsers();
            } catch (e) {
              Alert.alert("Gagal", "Gagal mengubah status");
            }
          },
        },
      ],
    );
  };

  const roleConfig = {
    admin: {
      color: Colors.danger,
      icon: "crown",
      isMaterialCommunity: true,
      label: "Admin",
    },
    operator: {
      color: Colors.info,
      icon: "hard-hat",
      isMaterialCommunity: true,
      label: "Operator",
    },
    satpam: {
      color: Colors.warning,
      icon: "shield-account",
      isMaterialCommunity: true,
      label: "Satpam",
    },
    supir: {
      color: Colors.success,
      icon: "local-shipping",
      isMaterialCommunity: false,
      label: "Supir",
    },
  };

  const filters = ["semua", "admin", "operator", "satpam", "supir"];
  const filteredUsers =
    filter === "semua" ? users : users.filter((u) => u.role === filter);

  const renderItem = ({ item }) => {
    const role = roleConfig[item.role] ?? {
      color: Colors.textSecondary,
      icon: "person",
      isMaterialCommunity: false,
      label: item.role,
    };
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            {item.no_hp && (
              <View style={styles.phoneRow}>
                <MaterialIcons
                  name="phone"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.userHp}>{item.no_hp}</Text>
              </View>
            )}
          </View>
          <View style={styles.badges}>
            <View style={styles.roleBadge}>
              {role.isMaterialCommunity ? (
                <MaterialCommunityIcons
                  name={role.icon}
                  size={16}
                  color={role.color}
                />
              ) : (
                <MaterialIcons name={role.icon} size={16} color={role.color} />
              )}
              <Text style={[styles.roleBadgeText, { color: role.color }]}>
                {role.label}
              </Text>
            </View>
            <View style={{ marginTop: 4 }}>
              <Badge
                label={item.status === "aktif" ? "● Aktif" : "○ Nonaktif"}
                color={
                  item.status === "aktif"
                    ? Colors.success
                    : Colors.textSecondary
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <Button
          title={item.status === "aktif" ? "Nonaktifkan Akun" : "Aktifkan Akun"}
          icon={item.status === "aktif" ? "lock" : "lock-open"}
          variant={item.status === "aktif" ? "danger" : "success"}
          size="sm"
          onPress={() => handleToggle(item.id, item.name, item.status)}
        />
      </Card>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Kelola Pengguna"
        subtitle={`${users.length} pengguna terdaftar`}
        showLogo
        rightAction={<LogoutButton onPress={handleLogout} />}
      />

      {/* Filter */}
      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <Button
            key={f}
            title={f.charAt(0).toUpperCase() + f.slice(1)}
            variant={filter === f ? "primary" : "ghost"}
            size="sm"
            onPress={() => setFilter(f)}
            fullWidth={false}
            style={styles.filterBtn}
          />
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {Object.entries(roleConfig).map(([key, val]) => (
          <View key={key} style={styles.statItem}>
            {val.isMaterialCommunity ? (
              <MaterialCommunityIcons
                name={val.icon}
                size={20}
                color={val.color}
                style={{ marginBottom: 4 }}
              />
            ) : (
              <MaterialIcons
                name={val.icon}
                size={20}
                color={val.color}
                style={{ marginBottom: 4 }}
              />
            )}
            <Text style={[styles.statNum, { color: val.color }]}>
              {users.filter((u) => u.role === key).length}
            </Text>
            <Text style={styles.statLabel}>{val.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchUsers();
            }}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="group"
            title="Tidak Ada Pengguna"
            subtitle="Belum ada pengguna yang terdaftar"
          />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterContainer: {
    flexDirection: "row",
    gap: 6,
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBtn: { paddingHorizontal: 6 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: "center" },
  statIcon: { fontSize: 18, marginBottom: 2 },
  statNum: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  list: { padding: Spacing.md, gap: 10 },
  card: { marginBottom: 0 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: Colors.white, fontSize: 20, fontWeight: "bold" },
  userInfo: { flex: 1 },
  userName: { ...Typography.h4, color: Colors.textPrimary },
  userEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userHp: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  badges: { alignItems: "flex-end" },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
});
