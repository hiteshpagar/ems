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
import { useContext, useEffect, useState, useCallback } from "react";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/date";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";
import { exportAttendanceCsv } from "../utils/csvExport";

export default function AttendanceHistoryScreen() {
  const { userRole } = useContext(AuthContext);
  const isManager =
    userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "HR";
  const isHr = userRole === "HR";

  const [activeScope, setActiveScope] = useState<"staff" | "personal">(
    isManager ? "staff" : "personal"
  );
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      const endpoint =
        isManager && activeScope === "staff" ? "/attendance" : "/attendance/me";
      const response = await API.get(endpoint);
      const data = Array.isArray(response.data) ? response.data : [];
      setAttendance(data);
    } catch (error) {
      console.log("Error loading attendance history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isManager, activeScope]);

  useEffect(() => {
    if (userRole) {
      setLoading(true);
      fetchAttendance();
    }
  }, [userRole, activeScope, fetchAttendance]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const handleExportCsv = async () => {
    if (attendance.length === 0) {
      Alert.alert("No Data", "There are no attendance records to export.");
      return;
    }
    try {
      setExporting(true);
      await exportAttendanceCsv(attendance);
    } finally {
      setExporting(false);
    }
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

  const getScreenTitle = () => {
    if (activeScope === "personal") {
      return isHr ? "My Attendance Logs" : "My Attendance History";
    }
    return "Staff Attendance Records";
  };

  const getScreenSubtitle = () => {
    if (activeScope === "personal") {
      return `${attendance.length} personal check-in log${attendance.length === 1 ? "" : "s"}`;
    }
    return `${attendance.length} employee attendance log${attendance.length === 1 ? "" : "s"}`;
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title={getScreenTitle()} showBack />
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
        title={getScreenTitle()}
        subtitle={getScreenSubtitle()}
        showBack
        rightAction={
          attendance.length > 0 ? (
            <TouchableOpacity
              style={styles.exportHeaderBtn}
              onPress={handleExportCsv}
              disabled={exporting}
              activeOpacity={0.7}
            >
              {exporting ? (
                <ActivityIndicator size="small" color={AppColors.primary} />
              ) : (
                <>
                  <Text style={styles.exportHeaderIcon}>📥</Text>
                  <Text style={styles.exportHeaderText}>CSV</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.container}>
        {/* Module Scope Switcher for HR & Managers */}
        {isManager ? (
          <View style={styles.moduleSelectorWrapper}>
            <View style={styles.moduleSelectorContainer}>
              <TouchableOpacity
                style={[
                  styles.moduleTab,
                  activeScope === "staff" && styles.moduleTabActive,
                ]}
                onPress={() => setActiveScope("staff")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.moduleTabText,
                    activeScope === "staff" && styles.moduleTabTextActive,
                  ]}
                >
                  👥 Staff Attendance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.moduleTab,
                  activeScope === "personal" && styles.moduleTabActive,
                ]}
                onPress={() => setActiveScope("personal")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.moduleTabText,
                    activeScope === "personal" && styles.moduleTabTextActive,
                  ]}
                >
                  👤 {isHr ? "My Attendance" : "Personal History"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

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
              title={
                activeScope === "personal"
                  ? "No Personal Logs"
                  : "No Staff Records"
              }
              message={
                activeScope === "personal"
                  ? "You have not recorded any attendance logs yet."
                  : "There are no attendance records found in the system."
              }
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  {(activeScope === "staff" || isManager) && item.employeeName ? (
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
  exportHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: AppRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  exportHeaderIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  exportHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.primary,
  },
  moduleSelectorWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: AppColors.background,
  },
  moduleSelectorContainer: {
    flexDirection: "row",
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: AppRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  moduleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: AppRadius.sm,
  },
  moduleTabActive: {
    backgroundColor: AppColors.primary,
    ...AppShadows.subtle,
  },
  moduleTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  moduleTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
