import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/date";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const typeIcons: Record<string, { icon: string; bg: string }> = {
  LEAVE: { icon: "🏖️", bg: AppColors.warningLight },
  PAYROLL: { icon: "💵", bg: AppColors.infoLight },
  EMPLOYEE: { icon: "👥", bg: AppColors.primaryLight },
  PASSWORD: { icon: "🔐", bg: AppColors.purpleLight },
  SYSTEM: { icon: "⚙️", bg: AppColors.surfaceMuted },
  GENERAL: { icon: "🔔", bg: AppColors.primaryLight },
};

export default function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const response = await API.get("/notifications", {
        params: { page: 0, size: 50 },
      });
      setItems(response.data.content ?? []);
    } catch {
      setError("Could not load notifications. Pull down to try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (item: NotificationItem) => {
    if (item.read) return;
    try {
      await API.patch(`/notifications/${item.id}/read`);
      setItems((current) =>
        current.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    } catch {
      Alert.alert("Error", "Unable to mark notification as read.");
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      setItems((current) => current.map((n) => ({ ...n, read: true })));
    } catch {
      Alert.alert("Error", "Unable to mark all notifications as read.");
    }
  };

  const hasUnread = items.some((item) => !item.read);

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Notifications" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Notifications"
        subtitle={`${items.length} total updates`}
        showBack
        rightAction={
          hasUnread ? (
            <TouchableOpacity
              onPress={markAllRead}
              style={styles.markAllBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.container}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={AppColors.primary}
            />
          }
          ListEmptyComponent={
            !error ? (
              <EmptyState
                icon="🔔"
                title="No Notifications"
                message="You have no notifications at this time. We will notify you when something important happens."
              />
            ) : null
          }
          renderItem={({ item }) => {
            const config = typeIcons[item.type] ?? typeIcons.GENERAL;

            return (
              <TouchableOpacity
                style={[styles.card, !item.read && styles.unreadCard]}
                onPress={() => markRead(item)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                  <Text style={styles.icon}>{config.icon}</Text>
                </View>

                <View style={styles.contentBox}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[styles.title, !item.read && styles.unreadTitle]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {!item.read ? <View style={styles.unreadDot} /> : null}
                  </View>

                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AppRadius.sm,
    backgroundColor: AppColors.primaryLight,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.primary,
  },
  errorText: {
    color: AppColors.danger,
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  unreadCard: {
    backgroundColor: "#F0F7FF",
    borderColor: AppColors.primaryLight,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: AppRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  contentBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "700",
    color: AppColors.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.primary,
    marginLeft: 6,
  },
  message: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
});
