import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const typeIcons: Record<string, string> = { LEAVE: "🏖️", PAYROLL: "₹", EMPLOYEE: "👥", PASSWORD: "🔐", SYSTEM: "⚙️", GENERAL: "🔔" };

export default function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const response = await API.get("/notifications", { params: { page: 0, size: 50 } });
      setItems(response.data.content ?? []);
    } catch {
      setError("Could not load notifications. Pull down to try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (item: NotificationItem) => {
    if (item.read) return;
    try {
      await API.patch(`/notifications/${item.id}/read`);
      setItems((current) => current.map((notification) => notification.id === item.id ? { ...notification, read: true } : notification));
    } catch {
      Alert.alert("Unable to update", "Please try again.");
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      setItems((current) => current.map((notification) => ({ ...notification, read: true })));
    } catch {
      Alert.alert("Unable to update", "Please try again.");
    }
  };

  if (loading) return <ScreenWrapper><View style={styles.loader}><ActivityIndicator size="large" color="#2F80ED" /></View></ScreenWrapper>;

  return <ScreenWrapper>
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      ListHeaderComponent={<><LinearGradient colors={["#0F2027", "#203A43", "#2C5364"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></TouchableOpacity>
        <View style={styles.headerRow}><View><Text style={styles.title}>Notifications</Text><Text style={styles.subtitle}>Stay up to date with your account</Text></View>
          {items.some((item) => !item.read) && <TouchableOpacity onPress={markAllRead}><Text style={styles.markAll}>Mark all read</Text></TouchableOpacity>}</View>
      </LinearGradient>{error ? <Text style={styles.error}>{error}</Text> : null}</>}
      renderItem={({ item }) => <TouchableOpacity activeOpacity={0.8} onPress={() => markRead(item)} style={[styles.card, !item.read && styles.unreadCard]}>
        <View style={styles.icon}><Text>{typeIcons[item.type] ?? "🔔"}</Text></View><View style={styles.copy}><View style={styles.row}><Text style={styles.cardTitle}>{item.title}</Text>{!item.read && <View style={styles.unreadDot} />}</View><Text style={styles.message}>{item.message}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text></View>
      </TouchableOpacity>}
      ListEmptyComponent={!error ? <View style={styles.empty}><Text style={styles.emptyIcon}>🔔</Text><Text style={styles.emptyTitle}>No notifications yet</Text><Text style={styles.emptyText}>Important updates will appear here.</Text></View> : null}
    />
  </ScreenWrapper>;
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: "center", justifyContent: "center" }, content: { flexGrow: 1, backgroundColor: "#F4F6FB", padding: 20, paddingBottom: 36 },
  header: { borderRadius: 20, padding: 22, marginBottom: 18 }, back: { color: "rgba(255,255,255,0.8)", marginBottom: 16, fontWeight: "600" }, headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 29, fontWeight: "700" }, subtitle: { color: "rgba(255,255,255,0.72)", marginTop: 5 }, markAll: { color: "#fff", fontWeight: "700", fontSize: 12 },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 }, unreadCard: { borderLeftWidth: 4, borderLeftColor: "#2F80ED", backgroundColor: "#F8FBFF" },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#E8F1FD", alignItems: "center", justifyContent: "center", marginRight: 12 }, copy: { flex: 1 }, row: { flexDirection: "row", alignItems: "center" },
  cardTitle: { flex: 1, color: "#1E293B", fontWeight: "700", fontSize: 15 }, unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2F80ED" }, message: { color: "#475569", lineHeight: 20, marginTop: 5 }, date: { color: "#94A3B8", fontSize: 11, marginTop: 8 },
  empty: { alignItems: "center", marginTop: 75 }, emptyIcon: { fontSize: 35 }, emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B", marginTop: 12 }, emptyText: { color: "#64748B", marginTop: 6 }, error: { color: "#B91C1C", textAlign: "center", marginBottom: 16 },
});
