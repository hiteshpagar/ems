import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import SearchBar from "../components/SearchBar";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import DatePickerField from "../components/DatePickerField";
import CustomButton from "../components/CustomButton";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows, AppTypography } from "../constants/theme";

const MODULES = [
  "ALL",
  "AUTH",
  "EMPLOYEE",
  "DEPARTMENT",
  "DESIGNATION",
  "ATTENDANCE",
  "LEAVE",
  "HOLIDAY",
  "PAYROLL",
  "PROFILE",
];

const ACTIONS = [
  "ALL",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "LOGIN",
  "LOGOUT",
  "PASSWORD_RESET",
];

interface AuditLogItem {
  id: number;
  userId: number | null;
  performedBy: string | null;
  performedByEmail: string | null;
  performedByRole: string | null;
  action: string;
  module: string;
  entityId: string | null;
  description: string;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogsScreen() {
  const { userRole } = useContext(AuthContext);

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilters, setShowDateFilters] = useState(false);

  // Selected Log for Details Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchAuditLogs = useCallback(
    async (pageNumber = 0, isRefresh = false) => {
      if (userRole !== "ADMIN") {
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const params: Record<string, any> = {
          page: pageNumber,
          size: 15,
        };

        if (selectedModule !== "ALL") params.module = selectedModule;
        if (selectedAction !== "ALL") params.action = selectedAction;
        if (search.trim()) params.search = search.trim();
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await API.get("/audit-logs", { params });
        const data = response.data;

        const newLogs = Array.isArray(data.content) ? data.content : [];
        if (pageNumber === 0) {
          setLogs(newLogs);
        } else {
          setLogs((prev) => [...prev, ...newLogs]);
        }

        setPage(data.number ?? pageNumber);
        setTotalPages(data.totalPages ?? 1);
        setTotalElements(data.totalElements ?? newLogs.length);
      } catch (err: any) {
        console.log("Error fetching audit logs:", err);
        setError("Unable to load audit logs. Please check your connection and try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [userRole, selectedModule, selectedAction, search, startDate, endDate]
  );

  useEffect(() => {
    fetchAuditLogs(0);
  }, [fetchAuditLogs]);

  const handleRefresh = () => {
    fetchAuditLogs(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && page + 1 < totalPages) {
      fetchAuditLogs(page + 1);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return "";
    } catch {
      return "";
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedModule("ALL");
    setSelectedAction("ALL");
    setStartDate("");
    setEndDate("");
    setShowDateFilters(false);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedModule !== "ALL" ||
    selectedAction !== "ALL" ||
    startDate !== "" ||
    endDate !== "";

  // Render for non-admins
  if (userRole && userRole !== "ADMIN") {
    return (
      <ScreenWrapper>
        <AppHeader title="Audit Logs" showBack />
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.lockEmoji}>🔒</Text>
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtitle}>
            Audit logs are only accessible to administrators for security compliance and tracking.
          </Text>
          <CustomButton
            title="Return to Dashboard"
            onPress={() => router.replace("/dashboard")}
            style={{ marginTop: 24, minWidth: 200 }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader title="Audit Logs" showBack />

      <View style={styles.container}>
        {/* Search & Date Filter Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search by description, name, email..."
                onClear={() => setSearch("")}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.filterToggleBtn,
                (startDate || endDate || showDateFilters) && styles.filterToggleBtnActive,
              ]}
              onPress={() => setShowDateFilters((prev) => !prev)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Toggle date filter"
            >
              <Text style={styles.filterIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker Expandable */}
          {showDateFilters && (
            <View style={styles.dateFilterContainer}>
              <View style={styles.dateRow}>
                <View style={styles.dateFieldCol}>
                  <DatePickerField
                    label="From Date"
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Start date"
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
                <View style={styles.dateFieldCol}>
                  <DatePickerField
                    label="To Date"
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="End date"
                    containerStyle={{ marginBottom: 0 }}
                  />
                </View>
              </View>
              {(startDate || endDate) && (
                <TouchableOpacity
                  style={styles.clearDateBtn}
                  onPress={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearDateText}>Clear Dates</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Module Filter Chips */}
          <View style={styles.chipsContainer}>
            <Text style={styles.chipsLabel}>Module:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {MODULES.map((mod) => {
                const isActive = selectedModule === mod;
                return (
                  <TouchableOpacity
                    key={mod}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setSelectedModule(mod)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {mod === "ALL" ? "All Modules" : mod}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Action Filter Chips */}
          <View style={[styles.chipsContainer, { marginTop: 8 }]}>
            <Text style={styles.chipsLabel}>Action:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {ACTIONS.map((act) => {
                const isActive = selectedAction === act;
                return (
                  <TouchableOpacity
                    key={act}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setSelectedAction(act)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {act === "ALL" ? "All Actions" : act}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Filter Status Summary */}
          {hasActiveFilters && (
            <View style={styles.activeFiltersRow}>
              <Text style={styles.activeFiltersText}>
                Showing filtered activity ({totalElements} {totalElements === 1 ? "record" : "records"})
              </Text>
              <TouchableOpacity onPress={clearAllFilters} activeOpacity={0.7}>
                <Text style={styles.resetFiltersText}>Reset</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Content List */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Loading audit logs...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Unable to load audit logs</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <CustomButton
              title="Retry"
              onPress={() => fetchAuditLogs(0)}
              style={{ marginTop: 16, minWidth: 140 }}
            />
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <AuditLogCard
                log={item}
                formatTimestamp={formatTimestamp}
                formatTimeAgo={formatTimeAgo}
                onPress={() => setSelectedLog(item)}
              />
            )}
            contentContainerStyle={[
              styles.listContent,
              logs.length === 0 && { flexGrow: 1, justifyContent: "center" },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={AppColors.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={
              <EmptyState
                icon="📜"
                title="No activity found"
                message={
                  hasActiveFilters
                    ? "No logs match your filter criteria. Try changing or resetting filters."
                    : "No system activity has been recorded yet."
                }
              />
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={AppColors.primary} />
                  <Text style={styles.footerText}>Loading more activity...</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* Audit Log Detail Modal */}
      <Modal
        visible={Boolean(selectedLog)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedLog(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Audit Event Details</Text>
                <Text style={styles.modalSubtitle}>
                  Log ID: #{selectedLog?.id}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedLog(null)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Badges */}
              <View style={styles.modalBadgeRow}>
                <StatusBadge status={selectedLog?.action || "neutral"} />
                <StatusBadge status={selectedLog?.module || "info"} />
              </View>

              {/* Description */}
              <View style={styles.modalDescBox}>
                <Text style={styles.modalDescLabel}>Description</Text>
                <Text style={styles.modalDescText}>{selectedLog?.description}</Text>
              </View>

              {/* Detail fields */}
              <View style={styles.modalDetailGroup}>
                <ModalDetailRow
                  label="Performed By"
                  value={selectedLog?.performedBy || "SYSTEM"}
                />
                <View style={styles.modalDivider} />
                <ModalDetailRow
                  label="User Email"
                  value={selectedLog?.performedByEmail || "—"}
                />
                <View style={styles.modalDivider} />
                <ModalDetailRow
                  label="Role"
                  value={selectedLog?.performedByRole || "—"}
                />
                <View style={styles.modalDivider} />
                <ModalDetailRow
                  label="Timestamp"
                  value={selectedLog?.createdAt ? formatTimestamp(selectedLog.createdAt) : "—"}
                />
                {selectedLog?.entityId ? (
                  <>
                    <View style={styles.modalDivider} />
                    <ModalDetailRow
                      label="Entity ID"
                      value={selectedLog.entityId}
                    />
                  </>
                ) : null}
                {selectedLog?.ipAddress ? (
                  <>
                    <View style={styles.modalDivider} />
                    <ModalDetailRow
                      label="IP Address"
                      value={selectedLog.ipAddress}
                    />
                  </>
                ) : null}
              </View>
            </ScrollView>

            <CustomButton
              title="Close"
              variant="secondary"
              onPress={() => setSelectedLog(null)}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

function AuditLogCard({
  log,
  formatTimestamp,
  formatTimeAgo,
  onPress,
}: {
  log: AuditLogItem;
  formatTimestamp: (d: string) => string;
  formatTimeAgo: (d: string) => string;
  onPress: () => void;
}) {
  const timeAgo = formatTimeAgo(log.createdAt);
  const initial = (log.performedBy || log.performedByEmail || "S").charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Audit log ${log.description}`}
    >
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {log.performedBy || "System Event"}
              </Text>
              {log.performedByRole ? (
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>{log.performedByRole}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.userEmail} numberOfLines={1}>
              {log.performedByEmail || "Internal Operation"}
            </Text>
          </View>
        </View>

        <View style={styles.timeCol}>
          {timeAgo ? <Text style={styles.timeAgoText}>{timeAgo}</Text> : null}
          <Text style={styles.timeExactText}>{formatTimestamp(log.createdAt)}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.cardDescription}>{log.description}</Text>

      {/* Footer Badges */}
      <View style={styles.cardFooter}>
        <View style={styles.badgeGroup}>
          <StatusBadge status={log.action} size="sm" />
          <StatusBadge status={log.module} size="sm" />
        </View>

        {log.entityId ? (
          <View style={styles.entityTag}>
            <Text style={styles.entityTagText}>ID #{log.entityId}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function ModalDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.modalDetailRow}>
      <Text style={styles.modalDetailLabel}>{label}</Text>
      <Text style={styles.modalDetailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  searchSection: {
    backgroundColor: AppColors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  filterToggleBtnActive: {
    backgroundColor: AppColors.primaryLight,
    borderColor: AppColors.primary,
  },
  filterIcon: {
    fontSize: 18,
  },
  dateFilterContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: AppRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateFieldCol: {
    flex: 1,
  },
  clearDateBtn: {
    alignSelf: "flex-end",
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  clearDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.danger,
  },
  chipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  chipsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textMuted,
    marginRight: 8,
    minWidth: 50,
  },
  chipsScroll: {
    paddingRight: 16,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: AppRadius.pill,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  chipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textSecondary,
    textTransform: "capitalize",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  activeFiltersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  activeFiltersText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  resetFiltersText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
    flexShrink: 1,
  },
  roleTag: {
    backgroundColor: AppColors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: AppRadius.sm,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: AppColors.textMuted,
  },
  userEmail: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 1,
  },
  timeCol: {
    alignItems: "flex-end",
  },
  timeAgoText: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.primary,
  },
  timeExactText: {
    fontSize: 10,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: AppColors.text,
    lineHeight: 20,
    fontWeight: "500",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  badgeGroup: {
    flexDirection: "row",
    gap: 6,
  },
  entityTag: {
    backgroundColor: AppColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: AppRadius.sm,
  },
  entityTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textMuted,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: AppColors.textMuted,
    fontWeight: "500",
  },
  accessDeniedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  lockEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 8,
  },
  accessDeniedSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.xl,
    padding: 20,
    ...AppShadows.elevated,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.textSecondary,
  },
  modalBody: {
    maxHeight: 380,
  },
  modalBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  modalDescBox: {
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: AppRadius.md,
    padding: 14,
    marginBottom: 16,
  },
  modalDescLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  modalDescText: {
    fontSize: 14,
    color: AppColors.text,
    lineHeight: 20,
    fontWeight: "500",
  },
  modalDetailGroup: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  modalDetailLabel: {
    fontSize: 13,
    color: AppColors.textMuted,
  },
  modalDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.text,
    maxWidth: "60%",
    textAlign: "right",
  },
  modalDivider: {
    height: 1,
    backgroundColor: AppColors.border,
  },
});
