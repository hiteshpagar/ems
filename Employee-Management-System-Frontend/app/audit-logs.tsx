import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Search,
  X,
  XCircle,
} from "lucide-react-native";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import BottomNav from "../components/BottomNav";
import DatePickerField from "../components/DatePickerField";
import CustomButton from "../components/CustomButton";
import { AuthContext } from "../context/AuthContext";
import { exportAuditLogsCsv } from "../utils/csvExport";

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
  "NOTIFICATION",
  "PROFILE",
];

const ACTIONS = [
  "ALL",
  "LOGIN",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
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
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    if (logs.length === 0) {
      Alert.alert("No Data", "There are no audit logs to export.");
      return;
    }
    try {
      setExporting(true);
      await exportAuditLogsCsv(logs);
    } finally {
      setExporting(false);
    }
  };

  const fetchAuditLogs = useCallback(
    async (pageNumber = 0, isRefresh = false) => {
      if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
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
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const getActionColors = (action: string) => {
    switch (action?.toUpperCase()) {
      case "LOGIN":
      case "LOGOUT":
        return { bg: "#EFF6FF", text: "#2563EB" };
      case "CREATE":
      case "APPROVE":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "UPDATE":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "DELETE":
      case "REJECT":
        return { bg: "#FEE2E2", text: "#DC2626" };
      case "PASSWORD_RESET":
        return { bg: "#F3E8FF", text: "#7C3AED" };
      default:
        return { bg: "#F1F5F9", text: "#475569" };
    }
  };

  // Render Item matching Screen 4
  const renderAuditCard = ({ item }: { item: AuditLogItem }) => {
    const actorName = item.performedBy || "System";
    const initial = actorName.charAt(0).toUpperCase();
    const actionColor = getActionColors(item.action);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedLog(item)}
        activeOpacity={0.7}
      >
        {/* Top Line: Avatar + Actor Name + Role Badge + Time Ago & Timestamp */}
        <View style={styles.cardTopRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.actorMeta}>
            <View style={styles.actorNameRow}>
              <Text style={styles.actorName} numberOfLines={1}>{actorName}</Text>
              {item.performedByRole ? (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{item.performedByRole}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.timeMeta}>
            <Text style={styles.timeAgoText}>{formatTimeAgo(item.createdAt)}</Text>
            <Text style={styles.timestampText}>{formatTimestamp(item.createdAt)}</Text>
          </View>
        </View>

        {/* Middle Line: Description */}
        <Text style={styles.descriptionText}>{item.description}</Text>

        {/* Bottom Line: Semantic Chips (Action, Module) & Event ID */}
        <View style={styles.cardBottomRow}>
          <View style={styles.tagGroup}>
            <View style={[styles.actionTag, { backgroundColor: actionColor.bg }]}>
              <Text style={[styles.actionTagText, { color: actionColor.text }]}>
                {item.action}
              </Text>
            </View>
            <View style={styles.moduleTag}>
              <Text style={styles.moduleTagText}>{item.module}</Text>
            </View>
          </View>
          <Text style={styles.idText}>ID #{item.id}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header matching Screen 4 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Back"
          >
            <ArrowLeft size={20} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Audit Logs</Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportCsv}
            disabled={exporting}
            activeOpacity={0.7}
          >
            <Download size={14} color="#2563EB" strokeWidth={2.2} style={{ marginRight: 4 }} />
            <Text style={styles.exportButtonText}>Export CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar + Calendar Filter Toggle */}
        <View style={styles.searchStrip}>
          <View style={styles.searchBox}>
            <Search size={16} color="#94A3B8" strokeWidth={2.2} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by description, name, or email..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch("")} style={{ paddingHorizontal: 4 }}>
                <XCircle size={16} color="#94A3B8" strokeWidth={2} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.calBtn, (startDate || endDate) && styles.calBtnActive]}
              onPress={() => setShowDateFilters((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Calendar
                size={18}
                color={startDate || endDate ? "#2563EB" : "#64748B"}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Filters Expandable */}
        {showDateFilters && (
          <View style={styles.dateFilterContainer}>
            <View style={styles.dateInputsRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <DatePickerField
                  label="From Date"
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label="To Date"
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
            {(startDate || endDate) && (
              <TouchableOpacity
                style={styles.clearDatesBtn}
                onPress={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                <Text style={styles.clearDatesText}>Clear Date Range</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Module Filter Chips Row */}
        <View style={styles.chipRowContainer}>
          <Text style={styles.chipRowLabel}>Module:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {MODULES.map((mod) => {
              const isSelected = selectedModule === mod;
              return (
                <TouchableOpacity
                  key={mod}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setSelectedModule(mod)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {mod}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Action Filter Chips Row */}
        <View style={[styles.chipRowContainer, { borderBottomWidth: 1, borderBottomColor: "#E2E8F0", paddingBottom: 10 }]}>
          <Text style={styles.chipRowLabel}>Action:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {ACTIONS.map((act) => {
              const isSelected = selectedAction === act;
              return (
                <TouchableOpacity
                  key={act}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setSelectedAction(act)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {act}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Audit List */}
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAuditCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#173B7A"]}
              tintColor="#173B7A"
            />
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#173B7A" />
                <Text style={styles.loadingText}>Loading audit logs...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <FileText size={36} color="#94A3B8" strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>No Audit Records Found</Text>
                <Text style={styles.emptySubtitle}>
                  Try clearing your filters or searching with different keywords.
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator size="small" color="#173B7A" />
              </View>
            ) : null
          }
        />

        {/* Modal: Audit Log Details */}
        <Modal
          visible={!!selectedLog}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedLog(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Event Details</Text>
                <TouchableOpacity onPress={() => setSelectedLog(null)} style={styles.modalCloseBtn}>
                  <X size={20} color="#64748B" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalFieldLabel}>Action:</Text>
                  <Text style={styles.modalFieldValue}>{selectedLog?.action}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalFieldLabel}>Module:</Text>
                  <Text style={styles.modalFieldValue}>{selectedLog?.module}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalFieldLabel}>Actor:</Text>
                  <Text style={styles.modalFieldValue}>{selectedLog?.performedBy || "System"}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalFieldLabel}>Email:</Text>
                  <Text style={styles.modalFieldValue}>{selectedLog?.performedByEmail || "—"}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalFieldLabel}>Role:</Text>
                  <Text style={styles.modalFieldValue}>{selectedLog?.performedByRole || "—"}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalFieldLabel}>Date & Time:</Text>
                  <Text style={styles.modalFieldValue}>
                    {selectedLog?.createdAt ? formatTimestamp(selectedLog.createdAt) : "—"}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalFieldLabel}>Entity ID:</Text>
                  <Text style={styles.modalFieldValue}>{selectedLog?.entityId || "—"}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalFieldLabel}>Description:</Text>
                  <Text style={[styles.modalFieldValue, { flex: 1, textAlign: "right" }]}>
                    {selectedLog?.description}
                  </Text>
                </View>

                <CustomButton
                  title="Close"
                  onPress={() => setSelectedLog(null)}
                  style={{ marginTop: 20 }}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

        <BottomNav role={userRole} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  searchStrip: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
    padding: 0,
  },
  calBtn: {
    paddingLeft: 8,
  },
  calBtnActive: {
    opacity: 0.8,
  },
  dateFilterContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  dateInputsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearDatesBtn: {
    marginTop: 6,
    alignSelf: "flex-end",
  },
  clearDatesText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
  },
  chipRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  chipRowLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginRight: 8,
    minWidth: 50,
  },
  chipScroll: {
    gap: 6,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  filterChipActive: {
    backgroundColor: "#173B7A",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },
  actorMeta: {
    flex: 1,
  },
  actorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  actorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  roleBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },
  timeMeta: {
    alignItems: "flex-end",
  },
  timeAgoText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 2,
  },
  timestampText: {
    fontSize: 10,
    color: "#94A3B8",
  },
  descriptionText: {
    fontSize: 13,
    color: "#0F172A",
    lineHeight: 18,
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagGroup: {
    flexDirection: "row",
    gap: 6,
  },
  actionTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  moduleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#EFF6FF",
  },
  moduleTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4F46E5",
  },
  idText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
  },
  centerContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalFieldLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  modalFieldValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
});
