import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useContext, useEffect, useState } from "react";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/date";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

export default function AttendanceHistoryScreen() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === "ADMIN";

  const fetchAttendance = async () => {
    try {
      const response =
        isAdmin
          ? await API.get("/attendance")
          : await API.get("/attendance/me");

      const data = Array.isArray(response.data) ? response.data : [];
      setAttendance(data);
    } catch (error) {
      console.log("Error loading attendance history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchAttendance();
    }
  }, [userRole]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Not recorded";
    const parts = time.split(":");
    if (parts.length < 2) return time;
    let hours = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minute} ${ampm}`;
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Attendance History" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading attendance records...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Attendance History"
        subtitle={`${attendance.length} total logs recorded`}
        showBack
      />

      <View style={styles.container}>
        <FlatList
          data={attendance}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={AppColors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🕒"
              title="No Attendance Records"
              message="There are no attendance records found in the system."
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  {isAdmin && item.employeeName ? (
                    <Text style={styles.employeeName}>👤 {item.employeeName}</Text>
                  ) : null}
                </View>
                <StatusBadge
                  status={item.status || "Present"}
                  size="sm"
                  showDot
                />
              </View>

              <View style={styles.timeDetailsRow}>
                <View style={styles.timeBox}>
                  <Text style={styles.timeLabel}>Check-In</Text>
                  <Text style={styles.timeValue}>
                    {formatTime(item.checkInTime)}
                  </Text>
                </View>

                <View style={styles.timeDivider} />

                <View style={styles.timeBox}>
                  <Text style={styles.timeLabel}>Check-Out</Text>
                  <Text style={styles.timeValue}>
                    {formatTime(item.checkOutTime)}
                  </Text>
                </View>
              </View>
            </View>
          )}
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dateBlock: {
    flex: 1,
    marginRight: 10,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
  },
  employeeName: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 3,
    fontWeight: "500",
  },
  timeDetailsRow: {
    flexDirection: "row",
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: AppRadius.md,
    padding: 12,
  },
  timeBox: {
    flex: 1,
  },
  timeDivider: {
    width: 1,
    backgroundColor: AppColors.border,
    marginHorizontal: 12,
  },
  timeLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
    fontWeight: "500",
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
});
