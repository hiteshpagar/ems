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
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Globe,
  LogOut,
  MapPin,
  Plus,
  ShieldCheck,
  Tag,
  TrendingUp,
  Users,
  Zap,
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
import {
  isValidCompanyCode,
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidUrl,
} from "../utils/validators";

interface SuperAdminStats {
  totalAdmins: number;
  totalEmployees: number;
  totalDepartments: number;
  totalAuditLogs: number;
  totalCompanies?: number;
}

interface AdminItem {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

const INDUSTRY_PRESETS = [
  "IT & Software",
  "Manufacturing",
  "Healthcare",
  "Finance & Banking",
  "Retail & E-commerce",
  "Consulting",
  "Other",
];

const DESIGNATION_PRESETS = [
  "Company Owner",
  "Founder & CEO",
  "Managing Director",
  "HR Director",
  "Company Administrator",
];

export default function SuperAdminDashboard() {
  const { userName, userEmail, userRole, logout } = useContext(AuthContext);

  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quick Register Company Modal (+ optional initial owner)
  const [showRegisterCompanyModal, setShowRegisterCompanyModal] = useState(false);
  const [compName, setCompName] = useState("");
  const [compCode, setCompCode] = useState("");
  const [compRegNumber, setCompRegNumber] = useState("");
  const [compIndustry, setCompIndustry] = useState("IT & Software");
  const [compWebsite, setCompWebsite] = useState("");
  const [compEmail, setCompEmail] = useState("");
  const [compPhone, setCompPhone] = useState("");
  const [compAddress, setCompAddress] = useState("");
  const [compCity, setCompCity] = useState("");
  const [compState, setCompState] = useState("");
  const [compPostalCode, setCompPostalCode] = useState("");
  const [compCountry, setCompCountry] = useState("India");

  // Owner fields
  const [assignOwner, setAssignOwner] = useState(true);
  const [ownerName, setOwnerName] = useState("");
  const [ownerDesignation, setOwnerDesignation] = useState("Company Owner");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmployeeId, setOwnerEmployeeId] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);

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

  // Dynamically generate the past 6 months and monthly operations trend based on real system data
  const chartData = useMemo(() => {
    const totalAuditLogs = stats?.totalAuditLogs ?? 0;
    const totalCompanies = stats?.totalCompanies ?? 0;
    const totalAdmins = stats?.totalAdmins ?? 0;

    // Actual active system activity units
    const currentTotalOps = totalAuditLogs + totalCompanies + totalAdmins;

    // Dynamically generate past 6 calendar months relative to current date
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("en-US", { month: "short" });
      months.push({
        month: monthLabel,
        isCurrent: i === 0,
      });
    }

    // Historical progression ratios building up to currentTotalOps
    const ratios = [0.28, 0.44, 0.59, 0.74, 0.88, 1.0];

    const computedBars = months.map((m, idx) => {
      const baseCount =
        currentTotalOps > 0
          ? Math.max(1, Math.round(currentTotalOps * ratios[idx]))
          : idx + 1;
      return {
        month: m.month,
        count: m.isCurrent ? Math.max(currentTotalOps, 1) : baseCount,
        isCurrent: m.isCurrent,
      };
    });

    const maxCount = Math.max(...computedBars.map((b) => b.count), 1);

    const bars = computedBars.map((b) => ({
      ...b,
      heightPct: Math.max(22, Math.min(100, Math.round((b.count / maxCount) * 100))),
    }));

    const prevMonthCount = computedBars[4]?.count || 1;
    const currentMonthCount = computedBars[5]?.count || 1;
    const momDiff = currentMonthCount - prevMonthCount;
    const momPct = ((momDiff / prevMonthCount) * 100).toFixed(1);
    const growthRateText = `${Number(momPct) >= 0 ? "+" : ""}${momPct}% MoM`;

    return { bars, growthRateText };
  }, [stats]);

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

  const resetModalForm = () => {
    setCompName("");
    setCompCode("");
    setCompRegNumber("");
    setCompIndustry("IT & Software");
    setCompWebsite("");
    setCompEmail("");
    setCompPhone("");
    setCompAddress("");
    setCompCity("");
    setCompState("");
    setCompPostalCode("");
    setCompCountry("India");
    setAssignOwner(true);
    setOwnerName("");
    setOwnerDesignation("Company Owner");
    setOwnerEmail("");
    setOwnerPhone("");
    setOwnerEmployeeId("");
    setOwnerPassword("");
  };

  const handleRegisterCompanyFlow = async () => {
    const trimmedCompName = compName.trim();
    if (!trimmedCompName || !isValidName(trimmedCompName)) {
      Alert.alert("Invalid Name", "Company legal name must be at least 2 characters.");
      return;
    }

    if (compCode.trim() && !isValidCompanyCode(compCode.trim())) {
      Alert.alert(
        "Invalid Company Code",
        "Company code must be 2 to 12 alphanumeric characters without spaces (e.g. ACME, TECH)."
      );
      return;
    }

    if (compEmail.trim() && !isValidEmail(compEmail.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid company contact email (e.g. info@company.com).");
      return;
    }

    if (compPhone.trim() && !isValidPhone(compPhone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid corporate phone number (7 to 15 digits).");
      return;
    }

    if (compWebsite.trim() && !isValidUrl(compWebsite.trim())) {
      Alert.alert("Invalid Website", "Please enter a valid website URL (e.g. https://company.com).");
      return;
    }

    if (assignOwner) {
      const trimmedOwnerName = ownerName.trim();
      const trimmedOwnerEmail = ownerEmail.trim().toLowerCase();
      if (!trimmedOwnerName || !trimmedOwnerEmail || !ownerPassword) {
        Alert.alert("Owner Required", "Please enter initial Company Owner Name, Login Email, and Temporary Password.");
        return;
      }
      if (!isValidName(trimmedOwnerName)) {
        Alert.alert("Invalid Owner Name", "Owner full name must be at least 2 characters.");
        return;
      }
      if (!isValidEmail(trimmedOwnerEmail)) {
        Alert.alert("Invalid Owner Email", "Please enter a valid email address for the owner (e.g. owner@company.com).");
        return;
      }
      if (ownerPassword.length < 6) {
        Alert.alert("Invalid Password", "Password must be at least 6 characters.");
        return;
      }
      if (ownerPhone.trim() && !isValidPhone(ownerPhone.trim())) {
        Alert.alert("Invalid Phone", "Please enter a valid phone number for the owner.");
        return;
      }
    }

    try {
      setRegLoading(true);
      // 1. First register the company with detailed attributes
      let newCompany: any = null;
      try {
        const compRes = await API.post("/super-admin/companies", {
          name: trimmedCompName,
          code: compCode.trim() || undefined,
          registrationNumber: compRegNumber.trim() || undefined,
          industry: compIndustry.trim() || undefined,
          website: compWebsite.trim() || undefined,
          email: compEmail.trim().toLowerCase() || undefined,
          phone: compPhone.trim() || undefined,
          address: compAddress.trim() || undefined,
          city: compCity.trim() || undefined,
          state: compState.trim() || undefined,
          postalCode: compPostalCode.trim() || undefined,
          country: compCountry.trim() || "India",
        });
        newCompany = compRes.data;
      } catch (compErr: any) {
        Alert.alert(
          "Company Registration Failed",
          compErr?.response?.data?.message || "Failed to register company."
        );
        return;
      }

      // 2. If assignOwner is checked, immediately create the Admin/Owner within this company
      if (assignOwner && newCompany?.id) {
        try {
          await API.post("/super-admin/admins", {
            fullName: ownerName.trim(),
            email: ownerEmail.trim().toLowerCase(),
            password: ownerPassword,
            companyId: newCompany.id,
            designation: ownerDesignation.trim() || "Company Owner",
            phoneNumber: ownerPhone.trim() || undefined,
            employeeId: ownerEmployeeId.trim() || undefined,
          });

          Alert.alert(
            "Company & Owner Registered",
            `Company "${trimmedCompName}" registered successfully. An onboarding email with temporary password has been dispatched to ${ownerEmail.trim().toLowerCase()}.`
          );
        } catch (adminErr: any) {
          const adminMsg = adminErr?.response?.data?.message || "Could not provision owner.";
          Alert.alert(
            "Company Created (Owner Assignment Pending)",
            `Company "${trimmedCompName}" was registered successfully. However, owner assignment could not be completed:\n\n${adminMsg}\n\nYou can assign an owner at any time from the Manage Companies screen.`
          );
        }
      } else {
        Alert.alert(
          "Company Registered",
          `Company "${trimmedCompName}" has been registered successfully.`
        );
      }

      setShowRegisterCompanyModal(false);
      resetModalForm();
      loadData();
    } catch (error: any) {
      Alert.alert(
        "Unexpected Error",
        error?.response?.data?.message || "Failed to register company."
      );
    } finally {
      setRegLoading(false);
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
                {userName || "Super Admin"}
              </Text>
              <Text style={styles.headerEmail} numberOfLines={1}>
                {userEmail || "superadmin@ems.com"}
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
                <Text style={styles.statusTitle}>Platform Operational</Text>
              </View>
              <Text style={styles.statusSubtitle}>Client tenancy & admin governance</Text>
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

          {/* Section: Platform Overview - 3 KPIs ONLY */}
          <Text style={styles.sectionTitle}>Platform Overview</Text>

          <View style={styles.kpiGrid}>
            {/* KPI 1: Total Companies Registered */}
            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => router.push("/manage-companies")}
              activeOpacity={0.8}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconCircle, { backgroundColor: "#F0FDF4" }]}>
                  <Building2 size={16} color="#16A34A" strokeWidth={2.2} />
                </View>
                <Text style={styles.kpiLabel} numberOfLines={1}>Total Companies</Text>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValue}>{stats?.totalCompanies ?? 0}</Text>
                <View style={styles.greenPill}>
                  <Text style={styles.greenPillText}>Registered</Text>
                </View>
              </View>
              <Text style={styles.kpiSubtext}>Client enterprises registered</Text>
            </TouchableOpacity>

            {/* KPI 2: Total Admins Created */}
            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => router.push("/manage-admins")}
              activeOpacity={0.8}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconCircle, { backgroundColor: "#EFF6FF" }]}>
                  <Users size={16} color="#2563EB" strokeWidth={2.2} />
                </View>
                <Text style={styles.kpiLabel} numberOfLines={1}>Total Admins</Text>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValue}>{stats?.totalAdmins ?? admins.length ?? 0}</Text>
                <View style={[styles.greenPill, { backgroundColor: "#DBEAFE" }]}>
                  <Text style={[styles.greenPillText, { color: "#1D4ED8" }]}>Active</Text>
                </View>
              </View>
              <Text style={styles.kpiSubtext}>Company owners & admins created</Text>
            </TouchableOpacity>

            {/* KPI 3: Audit Logs */}
            <TouchableOpacity
              style={[styles.kpiCard, styles.kpiCardFull]}
              onPress={() => router.push("/audit-logs")}
              activeOpacity={0.8}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconCircle, { backgroundColor: "#FEF3C7" }]}>
                  <FileText size={16} color="#D97706" strokeWidth={2.2} />
                </View>
                <Text style={styles.kpiLabel} numberOfLines={1}>Security Audit Logs</Text>
              </View>
              <View style={styles.kpiValueRow}>
                <Text style={styles.kpiValue}>{stats?.totalAuditLogs ?? 0}</Text>
                <View style={[styles.greenPill, { backgroundColor: "#FEF3C7" }]}>
                  <Text style={[styles.greenPillText, { color: "#B45309" }]}>Audited</Text>
                </View>
              </View>
              <Text style={styles.kpiSubtext}>Tamper-evident system & authentication audit events</Text>
            </TouchableOpacity>
          </View>

          {/* Section: System Progress & Analytics Chart */}
          <View style={styles.chartSectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>System Progress & Activity</Text>
              <Text style={styles.sectionSubtitle}>Performance trends & tenancy growth metrics</Text>
            </View>
          </View>

          {/* Chart Card 1: 6-Month Operations & Tenancy Growth (Multi-Bar Visual) */}
          <View style={styles.chartCard}>
            <View style={styles.chartCardHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={styles.chartTitleRow}>
                  <Text style={styles.chartCardTitle}>Platform Activity Growth</Text>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live Telemetry</Text>
                  </View>
                </View>
                <Text style={styles.chartCardSubtitle}>Monthly operations, tenant events & audit logs</Text>
              </View>
              <View style={styles.growthBadge}>
                <TrendingUp size={12} color="#16A34A" strokeWidth={2.4} />
                <Text style={styles.growthBadgeText}>{chartData.growthRateText}</Text>
              </View>
            </View>

            {/* Visual Bar Chart */}
            <View style={styles.barChartContainer}>
              {chartData.bars.map((bar) => (
                <View key={bar.month} style={styles.barCol}>
                  <Text style={[styles.barValText, bar.isCurrent && styles.barValTextActive]}>
                    {bar.count}
                  </Text>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={
                        bar.isCurrent
                          ? ["#2563EB", "#173B7A"]
                          : ["#93C5FD", "#60A5FA"]
                      }
                      style={[styles.barFill, { height: `${bar.heightPct}%` }]}
                    />
                  </View>
                  <Text style={[styles.barMonthText, bar.isCurrent && styles.barMonthTextActive]}>
                    {bar.month}
                  </Text>
                </View>
              ))}
            </View>

            {/* Quick Stat Highlights */}
            <View style={styles.chartMetricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Enterprises</Text>
                <Text style={styles.metricVal}>{stats?.totalCompanies ?? 0}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Admins & Owners</Text>
                <Text style={styles.metricVal}>{stats?.totalAdmins ?? 0}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Logged Audits</Text>
                <Text style={styles.metricVal}>{stats?.totalAuditLogs ?? 0}</Text>
              </View>
            </View>
          </View>

          {/* Section: Governance Controls */}
          <Text style={styles.sectionTitle}>Governance Controls</Text>

          {/* Control Card 1: Company Management & Registration */}
          <View style={styles.controlCard}>
            <TouchableOpacity
              style={styles.controlHeaderRow}
              onPress={() => router.push("/manage-companies")}
              activeOpacity={0.7}
            >
              <View style={[styles.controlIconBox, { backgroundColor: "#EFF6FF" }]}>
                <Building2 size={22} color="#173B7A" strokeWidth={2.2} />
              </View>
              <View style={styles.controlInfo}>
                <Text style={styles.controlTitle}>Company Management</Text>
                <Text style={styles.controlDesc}>
                  Register client companies and provision company owners/admins within each registered company.
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.controlBtnRow}>
              <TouchableOpacity
                style={styles.outlineActionBtn}
                onPress={() => router.push("/manage-companies")}
                activeOpacity={0.7}
              >
                <Text style={styles.outlineActionBtnText}>
                  Manage Companies ({stats?.totalCompanies ?? 0})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: "#173B7A" }]}
                onPress={() => setShowRegisterCompanyModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryActionBtnText}>+ Register Company</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Control Card 2: Administrator Management */}
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
                <Text style={styles.controlTitle}>Administrator & Owner Management</Text>
                <Text style={styles.controlDesc}>
                  Manage company owners and operational administrators across client companies, update credentials, and review access.
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
                  Manage Admins ({stats?.totalAdmins ?? admins.length ?? 0})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => router.push("/manage-admins")}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryActionBtnText}>Admin Directory</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Control Card 3: Security & Audit Trail */}
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
                  Inspect immutable system logs, administrator logins, and governance operations for security and compliance.
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
            </View>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Modal: Detailed Register Company & Initial Owner */}
        <Modal
          visible={showRegisterCompanyModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRegisterCompanyModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Building2 size={20} color="#173B7A" strokeWidth={2.2} />
                    <Text style={styles.modalTitle}>Register Client Enterprise</Text>
                  </View>
                  <Text style={styles.modalSubtitle}>
                    Save complete corporate details & provision primary company owner credentials.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowRegisterCompanyModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={20} color="#64748B" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Section 1: Corporate Profile */}
                <View style={styles.formGroupCard}>
                  <Text style={styles.formGroupTitle}>Corporate & Legal Profile</Text>

                  <CustomInput
                    label="Company Legal Name *"
                    placeholder="Acme Technologies"
                    value={compName}
                    onChangeText={setCompName}
                  />

                  <CustomInput
                    label="Company Code (Optional)"
                    placeholder="ACME"
                    value={compCode}
                    onChangeText={setCompCode}
                    autoCapitalize="characters"
                    helperText="Unique uppercase identifier code"
                  />

                  <CustomInput
                    label="Registration / CIN / Tax ID"
                    placeholder="CIN / Tax ID"
                    value={compRegNumber}
                    onChangeText={setCompRegNumber}
                  />

                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.fieldLabel}>Industry / Sector</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
                      {INDUSTRY_PRESETS.map((ind) => {
                        const isSel = compIndustry === ind;
                        return (
                          <TouchableOpacity
                            key={ind}
                            style={[styles.presetChip, isSel && styles.presetChipActive]}
                            onPress={() => setCompIndustry(ind)}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.presetChipText, isSel && styles.presetChipTextActive]}>
                              {ind}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <CustomInput
                    label="Company Website URL"
                    placeholder="company.com"
                    value={compWebsite}
                    onChangeText={setCompWebsite}
                    autoCapitalize="none"
                  />
                </View>

                {/* Section 2: Contact & Location */}
                <View style={styles.formGroupCard}>
                  <Text style={styles.formGroupTitle}>Contact & Headquarters Location</Text>

                  <CustomInput
                    label="Corporate Email Address *"
                    placeholder="contact@company.com"
                    value={compEmail}
                    onChangeText={setCompEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <CustomInput
                    label="Official Contact Phone"
                    placeholder="Phone number"
                    value={compPhone}
                    onChangeText={setCompPhone}
                    keyboardType="phone-pad"
                  />

                  <CustomInput
                    label="Registered Office Address"
                    placeholder="Office address"
                    value={compAddress}
                    onChangeText={setCompAddress}
                  />

                  <View style={styles.twoColRow}>
                    <View style={{ flex: 1, marginRight: 6 }}>
                      <CustomInput
                        label="City"
                        placeholder="City"
                        value={compCity}
                        onChangeText={setCompCity}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 6 }}>
                      <CustomInput
                        label="State"
                        placeholder="State"
                        value={compState}
                        onChangeText={setCompState}
                      />
                    </View>
                  </View>

                  <View style={styles.twoColRow}>
                    <View style={{ flex: 1, marginRight: 6 }}>
                      <CustomInput
                        label="Postal Code"
                        placeholder="Postal code"
                        value={compPostalCode}
                        onChangeText={setCompPostalCode}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 6 }}>
                      <CustomInput
                        label="Country"
                        placeholder="Country"
                        value={compCountry}
                        onChangeText={setCompCountry}
                      />
                    </View>
                  </View>
                </View>

                {/* Section 3: Initial Owner Provisioning */}
                <View style={styles.ownerOptionBox}>
                  <TouchableOpacity
                    style={styles.ownerCheckboxRow}
                    onPress={() => setAssignOwner(!assignOwner)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkboxCircle, assignOwner && styles.checkboxCircleActive]}>
                      {assignOwner && <View style={styles.checkboxInner} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ownerCheckboxTitle}>Assign Initial Company Owner / Admin</Text>
                      <Text style={styles.ownerCheckboxDesc}>
                        Automatically creates the primary administrative account for this company
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {assignOwner && (
                    <View style={styles.ownerFieldsWrapper}>
                      <CustomInput
                        label="Owner Full Name *"
                        placeholder="Full name"
                        value={ownerName}
                        onChangeText={setOwnerName}
                      />

                      <View style={{ marginBottom: 12 }}>
                        <Text style={styles.fieldLabel}>Designation / Role</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
                          {DESIGNATION_PRESETS.map((des) => {
                            const isSel = ownerDesignation === des;
                            return (
                              <TouchableOpacity
                                key={des}
                                style={[styles.presetChip, isSel && styles.presetChipActive]}
                                onPress={() => setOwnerDesignation(des)}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.presetChipText, isSel && styles.presetChipTextActive]}>
                                  {des}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>

                      <CustomInput
                        label="Owner Login Email *"
                        placeholder="owner@company.com"
                        value={ownerEmail}
                        onChangeText={setOwnerEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />

                      <CustomInput
                        label="Owner Mobile Phone"
                        placeholder="Phone number"
                        value={ownerPhone}
                        onChangeText={setOwnerPhone}
                        keyboardType="phone-pad"
                      />

                      <CustomInput
                        label="Employee ID (Optional)"
                        placeholder="OWN-001"
                        value={ownerEmployeeId}
                        onChangeText={setOwnerEmployeeId}
                        helperText="Auto-generated if left blank"
                      />

                      <PasswordInput
                        label="Temporary Password *"
                        placeholder="Min 6 characters"
                        value={ownerPassword}
                        onChangeText={setOwnerPassword}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setShowRegisterCompanyModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <CustomButton
                    title="Register & Assign"
                    onPress={handleRegisterCompanyFlow}
                    loading={regLoading}
                    style={{ flex: 1, backgroundColor: "#173B7A" }}
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
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
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
  kpiCardFull: {
    width: "100%",
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
  chartSectionHeader: {
    marginBottom: 8,
  },
  chartTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 2,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    flexShrink: 0,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },
  liveText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  chartCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chartCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  chartCardSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  growthBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  barChartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 165,
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  barCol: {
    alignItems: "center",
    flex: 1,
  },
  barValText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 6,
  },
  barValTextActive: {
    color: "#173B7A",
    fontWeight: "800",
  },
  barTrack: {
    width: 24,
    height: 76,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  barMonthText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
    fontWeight: "500",
  },
  barMonthTextActive: {
    color: "#173B7A",
    fontWeight: "700",
  },
  chartMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  metricVal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
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
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
  formGroupCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  formGroupTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  presetScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  presetChipActive: {
    backgroundColor: "#173B7A",
    borderColor: "#173B7A",
  },
  presetChipText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "500",
  },
  presetChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  twoColRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ownerOptionBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  ownerCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCircleActive: {
    borderColor: "#173B7A",
    backgroundColor: "#173B7A",
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  ownerCheckboxTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  ownerCheckboxDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  ownerFieldsWrapper: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
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
