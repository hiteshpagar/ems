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
import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import CustomButton from "../components/CustomButton";
import { formatDate } from "../utils/date";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";
import { exportLeavesCsv } from "../utils/csvExport";

type TabFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

interface LeaveBalance {
  year: number;
  totalQuota: number;
  totalUsed: number;
  totalAvailable: number;
  paidQuota: number;
  paidUsed: number;
  paidAvailable: number;
  sickQuota: number;
  sickUsed: number;
  sickAvailable: number;
  wfhQuota: number;
  wfhUsed: number;
  wfhAvailable: number;
  unpaidUsed: number;
  pendingDays: number;
  approvedDays: number;
}

export default function LeaveListScreen() {
  const params = useLocalSearchParams<{ scope?: string }>();
  const { userRole } = useContext(AuthContext);

  const isManager =
    userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "HR";
  const isHr = userRole === "HR";

  // Active module scope: "staff" (Staff Leave Management) vs "personal" (Personal Leaves)
  const [activeScope, setActiveScope] = useState<"staff" | "personal">(() => {
    if (params.scope === "personal") return "personal";
    if (params.scope === "staff") return "staff";
    return isManager ? "staff" : "personal";
  });

  const [leaves, setLeaves] = useState<any[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [exporting, setExporting] = useState(false);

  // Sync if URL param changes
  useEffect(() => {
    if (params.scope === "personal") {
      setActiveScope("personal");
    } else if (params.scope === "staff" && isManager) {
      setActiveScope("staff");
    }
  }, [params.scope, isManager]);

  const fetchBalance = useCallback(async () => {
    try {
      const response = await API.get("/leaves/me/balance");
      setBalance(response.data);
    } catch {
      // Ignored if user profile is unavailable
    }
  }, []);

  const fetchLeaves = useCallback(async () => {
    try {
      const endpoint =
        isManager && activeScope === "staff" ? "/leaves" : "/leaves/me";
      const response = await API.get(endpoint);
      const data = Array.isArray(response.data) ? response.data : [];
      setLeaves(data);
    } catch (error) {
      console.log("Error loading leaves:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isManager, activeScope]);

  useEffect(() => {
    if (userRole) {
      setLoading(true);
      fetchLeaves();
      if (activeScope === "personal" || !isManager) {
        fetchBalance();
      }
    }
  }, [userRole, activeScope, isManager, fetchLeaves, fetchBalance]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaves();
    if (activeScope === "personal" || !isManager) {
      fetchBalance();
    }
  };

  const filteredLeaves = useMemo(() => {
    if (activeTab === "ALL") return leaves;
    return leaves.filter((item) => {
      const status = (item.status || "").toUpperCase();
      return status === activeTab;
    });
  }, [leaves, activeTab]);

  const handleExportCsv = async () => {
    if (filteredLeaves.length === 0) {
      Alert.alert("No Data", "There are no leave requests to export.");
      return;
    }
    try {
      setExporting(true);
      await exportLeavesCsv(filteredLeaves);
    } finally {
      setExporting(false);
    }
  };

  const getScreenTitle = () => {
    if (activeScope === "personal") {
      return isHr ? "HR Personal Leave" : "My Leaves";
    }
    return isHr ? "Staff Leave Requests" : "Leave Management";
  };

  const getScreenSubtitle = () => {
    if (activeScope === "personal") {
      return `${filteredLeaves.length} personal time-off application${filteredLeaves.length === 1 ? "" : "s"}`;
    }
    return `${filteredLeaves.length} company request${filteredLeaves.length === 1 ? "" : "s"} shown`;
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title={getScreenTitle()} showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading leave requests...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "APPROVED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
  ];

  return (
    <ScreenWrapper>
      <AppHeader
        title={getScreenTitle()}
        subtitle={getScreenSubtitle()}
        showBack
        rightAction={
          <View style={styles.headerRightRow}>
            {isManager && activeScope === "staff" ? (
              <TouchableOpacity
                style={styles.headerActionBtn}
                onPress={() => router.push("/leave-allocation")}
                activeOpacity={0.7}
              >
                <Text style={styles.headerActionText}>⚖️ Quotas</Text>
              </TouchableOpacity>
            ) : null}

            {filteredLeaves.length > 0 ? (
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
            ) : null}
          </View>
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
                onPress={() => {
                  setActiveTab("ALL");
                  setActiveScope("staff");
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.moduleTabText,
                    activeScope === "staff" && styles.moduleTabTextActive,
                  ]}
                >
                  👥 Staff Leaves
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.moduleTab,
                  activeScope === "personal" && styles.moduleTabActive,
                ]}
                onPress={() => {
                  setActiveTab("ALL");
                  setActiveScope("personal");
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.moduleTabText,
                    activeScope === "personal" && styles.moduleTabTextActive,
                  ]}
                >
                  👤 {isHr ? "HR Personal Leave" : "My Leaves"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Leave Balance Overview Banner (for Personal Scope) */}
        {activeScope === "personal" && balance ? (
          <View style={styles.balanceWidget}>
            <View style={styles.balanceWidgetHeader}>
              <View>
                <Text style={styles.balanceWidgetTitle}>
                  Leave Balances ({balance.year || new Date().getFullYear()})
                </Text>
                <Text style={styles.balanceWidgetSub}>
                  {balance.totalAvailable} of {balance.totalQuota} days remaining
                </Text>
              </View>
              <View style={styles.totalBadge}>
                <Text style={styles.totalBadgeValue}>
                  {balance.totalAvailable}d
                </Text>
                <Text style={styles.totalBadgeLabel}>Available</Text>
              </View>
            </View>

            <View style={styles.balancePillsRow}>
              <View
                style={[
                  styles.balancePill,
                  { backgroundColor: AppColors.primaryLight },
                ]}
              >
                <Text style={styles.balancePillLabel}>Paid</Text>
                <Text
                  style={[
                    styles.balancePillValue,
                    { color: AppColors.primaryDark },
                  ]}
                >
                  {balance.paidAvailable}/{balance.paidQuota}d
                </Text>
              </View>

              <View
                style={[
                  styles.balancePill,
                  { backgroundColor: AppColors.warningLight },
                ]}
              >
                <Text style={styles.balancePillLabel}>Sick</Text>
                <Text
                  style={[
                    styles.balancePillValue,
                    { color: AppColors.warning },
                  ]}
                >
                  {balance.sickAvailable}/{balance.sickQuota}d
                </Text>
              </View>

              <View
                style={[
                  styles.balancePill,
                  { backgroundColor: AppColors.successLight },
                ]}
              >
                <Text style={styles.balancePillLabel}>WFH</Text>
                <Text
                  style={[
                    styles.balancePillValue,
                    { color: AppColors.success },
                  ]}
                >
                  {balance.wfhAvailable}/{balance.wfhQuota}d
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Filter Segment Tabs */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabItem, isActive && styles.activeTabItem]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Leave List */}
        <FlatList
          data={filteredLeaves}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            activeScope !== "personal" && { paddingBottom: 24 },
          ]}
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
              icon="🏖️"
              title={
                activeScope === "personal"
                  ? "No Personal Requests"
                  : "No Staff Requests"
              }
              message={
                activeTab === "ALL"
                  ? activeScope === "personal"
                    ? "You have not submitted any personal time-off requests yet."
                    : "No employee leave requests have been submitted yet."
                  : `No ${activeTab.toLowerCase()} leave requests found.`
              }
              actionTitle={
                activeScope === "personal" ? "+ Apply Personal Leave" : undefined
              }
              onAction={
                activeScope === "personal"
                  ? () => router.push("/apply-leave?mode=personal")
                  : undefined
              }
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/leave-details?id=${item.id}`)}
              activeOpacity={0.75}
            >
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  {(activeScope === "staff" || isManager) && item.employeeName ? (
                    <Text style={styles.employeeName} numberOfLines={1}>
                      {item.employeeName}
                    </Text>
                  ) : null}
                  <Text style={styles.leaveType}>
                    🏖️ {item.leaveType || "Leave Request"}
                  </Text>
                </View>

                <StatusBadge status={item.status || "Pending"} showDot />
              </View>

              <View style={styles.datesRow}>
                <Text style={styles.dateLabel}>Duration:</Text>
                <Text style={styles.dateValue}>
                  {formatDate(item.startDate)} → {formatDate(item.endDate)}
                </Text>
              </View>

              {item.reason ? (
                <Text style={styles.reason} numberOfLines={2}>
                  {`"${item.reason}"`}
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.viewDetailsLink}>
                  {activeScope === "staff" ? "Review & Manage" : "View Details"}
                </Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Bottom Apply Leave Action - Only available for Personal Leave */}
        {activeScope === "personal" ? (
          <View style={styles.bottomBar}>
            <CustomButton
              title="+ Apply Personal Leave"
              onPress={() => router.push("/apply-leave?mode=personal")}
            />
          </View>
        ) : null}
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: AppRadius.md,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: AppRadius.sm,
  },
  activeTabItem: {
    backgroundColor: AppColors.surface,
    ...AppShadows.subtle,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: AppColors.textMuted,
  },
  activeTabText: {
    fontWeight: "700",
    color: AppColors.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 2,
  },
  leaveType: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginRight: 6,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.text,
  },
  reason: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontStyle: "italic",
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  viewDetailsLink: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primary,
  },
  chevron: {
    fontSize: 18,
    color: AppColors.textMuted,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.surface,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  balanceWidget: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  balanceWidgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  balanceWidgetTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
  },
  balanceWidgetSub: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  totalBadge: {
    backgroundColor: AppColors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: AppRadius.md,
    alignItems: "center",
  },
  totalBadgeValue: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.primaryDark,
  },
  totalBadgeLabel: {
    fontSize: 9,
    color: AppColors.primaryDark,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  balancePillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  balancePill: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: AppRadius.md,
    alignItems: "center",
  },
  balancePillLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textSecondary,
    marginBottom: 2,
  },
  balancePillValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.primaryLight,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: AppRadius.md,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.primaryDark,
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
