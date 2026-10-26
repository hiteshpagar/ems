import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Building2,
  ChevronRight,
  FileText,
  LogOut,
  ShieldCheck,
  Users,
  UsersRound,
  X,
} from "lucide-react-native";

import API from "../services/api";
import BottomNav from "../components/BottomNav";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import PasswordInput from "../components/PasswordInput";
import ScreenWrapper from "../components/ScreenWrapper";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius } from "../constants/theme";

interface SuperAdminStats {
  totalAdmins: number;
  totalEmployees: number;
  totalDepartments: number;
  totalAuditLogs: number;
}

interface AdminItem {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export default function SuperAdminDashboard() {
  const { userName, userEmail, userRole, logout } = useContext(AuthContext);

  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quick Provision Admin Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addConfirmPassword, setAddConfirmPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, adminsRes] = await Promise.all([
        API.get("/super-admin/stats"),
        API.get("/super-admin/admins"),
      ]);
      setStats(statsRes.data);
      setAdmins(adminsRes.data || []);
    } catch (error: any) {
      console.log("Error loading governance data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to end your administrative session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleCreateAdmin = async () => {
    const trimmedName = addName.trim();
    const trimmedEmail = addEmail.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !addPassword) {
      Alert.alert("Required Fields", "Please enter all required administrator credentials.");
      return;
    }
    if (addPassword.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters.");
      return;
    }
    if (addPassword !== addConfirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      setAddLoading(true);
      await API.post("/super-admin/admins", {
        fullName: trimmedName,
        email: trimmedEmail,
        password: addPassword,
      });

      Alert.alert("Success", "New Administrator provisioned successfully.");
      setShowAddModal(false);
      setAddName("");
      setAddEmail("");
      setAddPassword("");
      setAddConfirmPassword("");
      loadData();
    } catch (error: any) {
      Alert.alert("Creation Failed", error?.response?.data?.message || "Failed to create administrator.");
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#173B7A" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const initialLetter = userName ? userName.charAt(0).toUpperCase() : "H";

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialLetter}</Text>
            </View>
            <View style={styles.headerTitleCol}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>SUPER ADMINISTRATOR</Text>
              </View>
              <Text style={styles.headerName} numberOfLines={1}>
                {userName || "Hitesh Pagar"}
              </Text>
              <Text style={styles.headerEmail} numberOfLines={1}>
                {userEmail || "hiteshpagar10@gmail.com"}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push("/notifications")}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Bell size={18} color="#D97706" strokeWidth={2.2} />
              <View style={styles.notifBadge} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.7}
              accessibilityLabel="Sign out"
            >
              <LogOut size={18} color="#DC2626" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#173B7A"]}
              tintColor="#173B7A"
            />
          }
        >
          {/* Hero Banner: System Operational */}
          <LinearGradient
            colors={["#0E2A5D", "#173B7A", "#1E4E9E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroLeft}>
              <View style={styles.statusRow}>
                <View style={styles.greenDotGlow}>
                  <View style={styles.greenDot} />
                </View>
                <Text style={styles.statusTitle}>System Operational</Text>
              </View>
              <Text style={styles.statusSubtitle}>All systems running smoothly</Text>
            </View>

            {/* Server & Shield Graphic */}
            <View style={styles.heroGraphic}>
              <View style={styles.serverStack}>
                <View style={styles.serverRow}>
                  <View style={styles.serverLed} />
                  <View style={styles.serverLed} />
                  <View style={styles.serverLine} />
                </View>
                <View style={styles.serverRow}>
                  <View style={styles.serverLed} />
                  <View style={styles.serverLed} />
                  <View style={styles.serverLine} />
                </View>
                <View style={styles.serverRow}>
                  <View style={styles.serverLed} />
                  <View style={styles.serverLed} />
                  <View style={styles.serverLine} />
                </View>
              </View>
              <View style={styles.shieldGlow}>
                <ShieldCheck size={24} color="#FFFFFF" strokeWidth={2.2} />
              </View>
            </View>
          </LinearGradient>

          {/* Section: System Governance Overview */}
          <Text style={styles.sectionTitle}>System Governance Overview</Text>

          <View style={styles.kpiGrid}>
            {/* KPI 1: Administrators */}
            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => router.push("/manage-admins")}
              activeOpacity={0.8}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconCircle, { backgroundColor: "#EFF6FF" }]}>
                  <Users size={16} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.kpiLabel} numberOfLines={1}>Administrators</Text>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValue}>{stats?.totalAdmins ?? admins.length ?? 1}</Text>
                <View style={styles.greenPill}>
                  <Text style={styles.greenPillText}>↑ 0%</Text>
                </View>
              </View>
              <Text style={styles.kpiSubtext}>Active management accounts</Text>
            </TouchableOpacity>

            {/* KPI 2: Total Workforce */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconCircle, { backgroundColor: "#EFF6FF" }]}>
                  <UsersRound size={16} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.kpiLabel} numberOfLines={1}>Total Workforce</Text>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValue}>{stats?.totalEmployees ?? 0}</Text>
              </View>
              <Text style={styles.kpiSubtext}>Employees registered</Text>
            </View>

            {/* KPI 3: Departments */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconCircle, { backgroundColor: "#EFF6FF" }]}>
                  <Building2 size={16} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.kpiLabel} numberOfLines={1}>Departments</Text>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValue}>{stats?.totalDepartments ?? 0}</Text>
              </View>
              <Text style={styles.kpiSubtext}>Business units</Text>
            </View>

            {/* KPI 4: Security Logs */}
            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => router.push("/audit-logs")}
              activeOpacity={0.8}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconCircle, { backgroundColor: "#FEF3C7" }]}>
                  <FileText size={16} color="#D97706" strokeWidth={2.2} />
                </View>
                <Text style={styles.kpiLabel} numberOfLines={1}>Security Logs</Text>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValue}>{stats?.totalAuditLogs ?? 6}</Text>
              </View>
              <Text style={styles.kpiSubtext}>Audited system events</Text>
            </TouchableOpacity>
          </View>

          {/* Section: Management Controls */}
          <Text style={styles.sectionTitle}>Management Controls</Text>

          {/* Control Card 1: Administrator Management */}
          <View style={styles.controlCard}>
            <TouchableOpacity
              style={styles.controlHeaderRow}
              onPress={() => router.push("/manage-admins")}
              activeOpacity={0.7}
            >
              <View style={[styles.controlIconBox, { backgroundColor: "#EFF6FF" }]}>
                <ShieldCheck size={22} color="#2563EB" strokeWidth={2.2} />
              </View>
              <View style={styles.controlInfo}>
                <Text style={styles.controlTitle}>Administrator Management</Text>
                <Text style={styles.controlDesc}>
                  Provision new operational administrators, modify contact information, reset credentials, or revoke access.
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.controlBtnRow}>
              <TouchableOpacity
                style={styles.outlineActionBtn}
                onPress={() => router.push("/manage-admins")}
                activeOpacity={0.7}
              >
                <Text style={styles.outlineActionBtnText}>
                  View All Admins ({admins.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryActionBtnText}>+ Provision Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Control Card 2: Security & Audit Trail */}
          <TouchableOpacity
            style={styles.controlCard}
            onPress={() => router.push("/audit-logs")}
            activeOpacity={0.7}
          >
            <View style={styles.controlHeaderRow}>
              <View style={[styles.controlIconBox, { backgroundColor: "#FEF3C7" }]}>
                <FileText size={22} color="#D97706" strokeWidth={2.2} />
              </View>
              <View style={styles.controlInfo}>
                <Text style={styles.controlTitle}>Security & Audit Trail</Text>
                <Text style={styles.controlDesc}>
                  Inspect immutable system logs, administrator logins, employee creation, and approval actions for compliance.
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
            </View>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Modal: Provision Administrator */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Provision Administrator</Text>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={20} color="#64748B" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSubtitle}>
                  Create access credentials for an operational administrator.
                </Text>

                <CustomInput
                  label="Full Name *"
                  placeholder="e.g. Rushikesh Wakode"
                  value={addName}
                  onChangeText={setAddName}
                />

                <CustomInput
                  label="Company Email Address *"
                  placeholder="admin@company.com"
                  value={addEmail}
                  onChangeText={setAddEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <PasswordInput
                  label="Temporary Password *"
                  placeholder="Minimum 6 characters"
                  value={addPassword}
                  onChangeText={setAddPassword}
                />

                <PasswordInput
                  label="Confirm Password *"
                  placeholder="Re-enter password"
                  value={addConfirmPassword}
                  onChangeText={setAddConfirmPassword}
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setShowAddModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <CustomButton
                    title="Provision Admin"
                    onPress={handleCreateAdmin}
                    loading={addLoading}
                    style={{ flex: 1 }}
                  />
                </View>
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
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#173B7A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  headerTitleCol: {
    flex: 1,
  },
  roleBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
    alignSelf: "flex-start",
    marginBottom: 2,
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#DC2626",
    letterSpacing: 0.6,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerEmail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#DC2626",
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    overflow: "hidden",
  },
  heroLeft: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  greenDotGlow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statusSubtitle: {
    fontSize: 12,
    color: "#BFDBFE",
    marginTop: 2,
  },
  heroGraphic: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 8,
  },
  serverStack: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 6,
    padding: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  serverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  serverLed: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#60A5FA",
  },
  serverLine: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  shieldGlow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  kpiTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  kpiIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  kpiLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
  },
  kpiValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  greenPill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  greenPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },
  kpiSubtext: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  controlCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  controlHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  controlInfo: {
    flex: 1,
    marginRight: 8,
  },
  controlTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  controlDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  controlBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  outlineActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#173B7A",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineActionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#173B7A",
  },
  primaryActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#173B7A",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    alignItems: "center",
  },
  modalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
});
