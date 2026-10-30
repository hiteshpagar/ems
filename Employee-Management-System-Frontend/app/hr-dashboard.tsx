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
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  History,
  LogOut,
  Plus,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react-native";

import API from "../services/api";
import BottomNav from "../components/BottomNav";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";
import { AuthContext } from "../context/AuthContext";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
} from "../utils/validators";

interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
}

interface AttendanceStats {
  presentToday: number;
  absentToday: number;
  checkedInToday: number;
}

interface EmployeeItem {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  status?: string;
  active?: boolean;
  joiningDate?: string;
  phone?: string;
}

interface LeaveItem {
  id: number;
  employeeId: number;
  employeeName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
}

export default function HrDashboardScreen() {
  const { userName, userEmail, userRole, logout } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
  });

  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    presentToday: 0,
    absentToday: 0,
    checkedInToday: 0,
  });

  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveItem[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Quick Add Employee Modal State
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPhone, setEmpPhone] = useState("");
  const [empDepartment, setEmpDepartment] = useState("Engineering");
  const [empDesignation, setEmpDesignation] = useState("Software Engineer");
  const [empSalary, setEmpSalary] = useState("");
  const [addEmpLoading, setAddEmpLoading] = useState(false);

  const loadHrData = useCallback(async () => {
    try {
      const [
        statsRes,
        attRes,
        empsRes,
        leavesRes,
        notifRes,
        profileRes,
      ] = await Promise.allSettled([
        API.get("/dashboard/stats"),
        API.get("/dashboard/attendance-stats"),
        API.get("/employees"),
        API.get("/leaves"),
        API.get("/notifications/unread-count"),
        API.get("/profile"),
      ]);

      if (statsRes.status === "fulfilled") {
        setStats(
          statsRes.value.data || {
            totalEmployees: 0,
            pendingLeaves: 0,
            approvedLeaves: 0,
            rejectedLeaves: 0,
          }
        );
      }

      if (attRes.status === "fulfilled") {
        setAttendanceStats(
          attRes.value.data || {
            presentToday: 0,
            absentToday: 0,
            checkedInToday: 0,
          }
        );
      }

      if (empsRes.status === "fulfilled") {
        const rawEmps = Array.isArray(empsRes.value.data) ? empsRes.value.data : [];
        const currentCaller = (userEmail || "").trim().toLowerCase();
        const staffOnly = rawEmps.filter((emp: any) => {
          if (!emp) return false;
          const empMail = (emp.email || "").trim().toLowerCase();

          // HR itself or Admin itself must never be in Total Staff
          if (currentCaller && empMail === currentCaller && (userRole === "HR" || userRole === "ADMIN" || userRole === "SUPER_ADMIN")) {
            return false;
          }

          const des = (emp.designation || "").toLowerCase().trim();
          const dept = (emp.department || "").toLowerCase().trim();

          // Filter out Company Owner and Admin designations
          if (
            des.includes("owner") ||
            des.includes("admin") ||
            des.includes("director") ||
            des.includes("founder") ||
            des.includes("ceo")
          ) {
            return false;
          }

          // Filter out HR designations & HR department
          if (des.includes("hr") || des.includes("human resource")) {
            return false;
          }
          if (dept.includes("human resource") || dept === "hr") {
            return false;
          }

          return true;
        });
        setEmployees(staffOnly);
      }

      if (leavesRes.status === "fulfilled") {
        const allLeaves = Array.isArray(leavesRes.value.data)
          ? leavesRes.value.data
          : [];
        setPendingLeaves(allLeaves.filter((l: any) => l.status === "Pending"));
      }

      if (notifRes.status === "fulfilled") {
        setUnreadNotifCount(notifRes.value.data?.count ?? 0);
      }

      if (profileRes.status === "fulfilled") {
        setUserProfile(profileRes.value.data);
      }
    } catch (error) {
      console.log("Error loading HR dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHrData();
  }, [loadHrData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHrData();
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to end your HR session?", [
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

  const handleQuickAddEmployee = async () => {
    const trimmedName = empName.trim();
    if (!trimmedName || !isValidName(trimmedName)) {
      Alert.alert(
        "Invalid Name",
        "Employee full name must be at least 2 characters."
      );
      return;
    }

    const trimmedEmail = empEmail.trim().toLowerCase();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid corporate email address."
      );
      return;
    }

    if (empPhone.trim() && !isValidPhone(empPhone.trim())) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid 10-15 digit phone number."
      );
      return;
    }

    try {
      setAddEmpLoading(true);
      await API.post("/employees", {
        name: trimmedName,
        email: trimmedEmail,
        phone: empPhone.trim() || undefined,
        department: empDepartment.trim() || "Operations",
        designation: empDesignation.trim() || "Associate",
        salary: empSalary.trim() ? Number(empSalary.trim()) : 35000,
        joiningDate: new Date().toISOString().split("T")[0],
      });

      Alert.alert(
        "Employee Onboarded",
        `New employee "${trimmedName}" has been successfully added to the organization.`
      );

      setShowAddEmpModal(false);
      setEmpName("");
      setEmpEmail("");
      setEmpPhone("");
      setEmpDepartment("Engineering");
      setEmpDesignation("Software Engineer");
      setEmpSalary("");
      loadHrData();
    } catch (err: any) {
      Alert.alert(
        "Onboarding Failed",
        err?.response?.data?.message || "Failed to onboard employee."
      );
    } finally {
      setAddEmpLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: number) => {
    try {
      await API.put(`/leaves/${leaveId}/status`, { status: "Approved" });
      Alert.alert(
        "Leave Approved",
        "Employee leave request has been approved."
      );
      loadHrData();
    } catch (err: any) {
      Alert.alert(
        "Approval Failed",
        err?.response?.data?.message || "Failed to approve leave request."
      );
    }
  };

  const handleRejectLeave = async (leaveId: number) => {
    try {
      await API.put(`/leaves/${leaveId}/status`, { status: "Rejected" });
      Alert.alert(
        "Leave Rejected",
        "Employee leave request has been rejected."
      );
      loadHrData();
    } catch (err: any) {
      Alert.alert(
        "Action Failed",
        err?.response?.data?.message || "Failed to reject leave request."
      );
    }
  };

  const attendanceRate = useMemo(() => {
    const total = stats.totalEmployees || employees.length;
    if (!total) return 0;
    return Math.round((attendanceStats.presentToday / total) * 100);
  }, [stats.totalEmployees, employees.length, attendanceStats.presentToday]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#173B7A" />
          <Text style={styles.loadingText}>Loading HR Console...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const initialLetter = userName ? userName.charAt(0).toUpperCase() : "H";
  const companyTitle = userProfile?.company?.name || "Corporate Workspace";

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Top Header - Exact Same Design as Admin and Super Admin */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialLetter}</Text>
            </View>
            <View style={styles.headerTitleCol}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>HR ADMINISTRATOR</Text>
              </View>
              <Text style={styles.headerName} numberOfLines={1}>
                {userName || "HR Administrator"}
              </Text>
              <Text style={styles.headerEmail} numberOfLines={1}>
                {userProfile?.company?.name || userEmail || "Company Workspace"}
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
              {unreadNotifCount > 0 && <View style={styles.notifDot} />}
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
          {/* HR CONSOLE HERO BANNER (Differentiated Structure with Action Bar) */}
          <LinearGradient
            colors={["#0E2A5D", "#173B7A", "#1E4E9E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadgeRow}>
                <Building2 size={14} color="#93C5FD" />
                <Text style={styles.heroBadgeText}>PEOPLE & TALENT CONSOLE</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>{companyTitle}</Text>
            <Text style={styles.heroSubtitle}>
              Workforce directory, attendance tracking & HR operations
            </Text>

            <View style={styles.heroDivider} />

            {/* Quick Action Buttons inside Hero */}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={styles.heroPrimaryBtn}
                onPress={() => router.push("/add-employee")}
                activeOpacity={0.85}
              >
                <Plus size={15} color="#173B7A" strokeWidth={2.4} />
                <Text style={styles.heroPrimaryBtnText}>Onboard Staff</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.heroSecondaryBtn}
                onPress={() => router.push("/attendance")}
                activeOpacity={0.85}
              >
                <Clock size={14} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.heroSecondaryBtnText}>
                  Attendance Board ›
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* 3 FLOATING KPI PILLARS (Differentiated Layout, 100% Left Aligned) */}
          <View style={styles.kpiRow}>
            {/* KPI 1: Total Staff */}
            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => router.push("/employee-list")}
              activeOpacity={0.8}
            >
              <View
                style={[styles.kpiIconBox, { backgroundColor: "#EFF6FF" }]}
              >
                <Users size={18} color="#173B7A" />
              </View>
              <Text style={styles.kpiValue}>
                {employees.length > 0 ? employees.length : (stats.totalEmployees || 0)}
              </Text>
              <Text style={styles.kpiLabel}>Total Staff</Text>
              <Text style={styles.kpiSub}>Active members</Text>
            </TouchableOpacity>

            {/* KPI 2: Present Today */}
            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => router.push("/attendance")}
              activeOpacity={0.8}
            >
              <View
                style={[styles.kpiIconBox, { backgroundColor: "#DCFCE7" }]}
              >
                <UserCheck size={18} color="#059669" />
              </View>
              <Text style={[styles.kpiValue, { color: "#059669" }]}>
                {attendanceStats.presentToday}
              </Text>
              <Text style={styles.kpiLabel}>Present Today</Text>
              <Text style={styles.kpiSub}>{attendanceRate}% present</Text>
            </TouchableOpacity>

            {/* KPI 3: Pending Leaves */}
            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => router.push("/leave-list?scope=staff")}
              activeOpacity={0.8}
            >
              <View
                style={[styles.kpiIconBox, { backgroundColor: "#FEF3C7" }]}
              >
                <Calendar size={18} color="#D97706" />
              </View>
              <Text style={[styles.kpiValue, { color: "#D97706" }]}>
                {stats.pendingLeaves}
              </Text>
              <Text style={styles.kpiLabel}>Pending Leaves</Text>
              <Text style={styles.kpiSub}>
                {stats.pendingLeaves > 0 ? "Needs review" : "All cleared"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* MODULE 1: WORKFORCE & ORGANIZATION (Structured Thematic Grouping) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workforce & Organization</Text>
            <Text style={styles.sectionSub}>Structure & Staff</Text>
          </View>

          <View style={styles.opsList}>
            {/* 1. Onboard Staff Member */}
            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#2563EB" }]}
              onPress={() => router.push("/add-employee")}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: "#EFF6FF" }]}
              >
                <Plus size={20} color="#2563EB" strokeWidth={2.4} />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>Onboard Staff Member</Text>
                <Text style={styles.actionDesc}>
                  Register new employee with complete descriptive profile
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* 2. Employee Directory */}
            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#173B7A" }]}
              onPress={() => router.push("/employee-list")}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: "#EFF6FF" }]}
              >
                <Users size={20} color="#173B7A" />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>Employee Directory</Text>
                <Text style={styles.actionDesc}>
                  Search, filter & view all active staff profiles
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* 2. Departments */}
            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#4F46E5" }]}
              onPress={() => router.push("/department-list")}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: "#EEF2FF" }]}
              >
                <Building2 size={20} color="#4F46E5" />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>Departments & Teams</Text>
                <Text style={styles.actionDesc}>
                  Organize business units and team hierarchy
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* 3. Designations */}
            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#16A34A" }]}
              onPress={() => router.push("/designation-list")}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: "#F0FDF4" }]}
              >
                <Briefcase size={20} color="#16A34A" />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>
                  Designations & Job Roles
                </Text>
                <Text style={styles.actionDesc}>
                  Job titles, responsibilities & grade levels
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* 4. Holiday Calendar */}
            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#475569" }]}
              onPress={() => router.push("/holiday-list")}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: "#F8FAFC" }]}
              >
                <Calendar size={20} color="#475569" />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>Company Holiday Calendar</Text>
                <Text style={styles.actionDesc}>
                  Annual holiday schedule & company days off
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* MODULE 2: TIME & PAYROLL OPERATIONS (Structured Thematic Grouping) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Time & Payroll Operations</Text>
            <Text style={styles.sectionSub}>Daily Tracking</Text>
          </View>

          <View style={styles.opsList}>
            {/* 1. Staff Leave Requests */}
            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#D97706" }]}
              onPress={() => router.push("/leave-list?scope=staff")}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: "#FFFBEB" }]}
              >
                <Calendar size={20} color="#D97706" />
              </View>
              <View style={styles.actionTextBox}>
                <View style={styles.actionTitleRow}>
                  <Text style={styles.actionTitle}>Staff Leave Requests</Text>
                  {stats.pendingLeaves > 0 && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>
                        {stats.pendingLeaves} Pending
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionDesc}>
                  Review employee time-off & manage quotas
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* 2. Daily Attendance Board */}
            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#7C3AED" }]}
              onPress={() => router.push("/attendance")}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: "#F5F3FF" }]}
              >
                <Clock size={20} color="#7C3AED" />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>Daily Attendance Board</Text>
                <Text style={styles.actionDesc}>
                  Real-time staff check-ins, status & daily shifts
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* 3. Attendance History */}
            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#2563EB" }]}
              onPress={() => router.push("/attendance-history" as any)}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: "#EFF6FF" }]}
              >
                <History size={20} color="#2563EB" />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>
                  Attendance History & Logs
                </Text>
                <Text style={styles.actionDesc}>
                  Workforce attendance records, trends & reports
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* 4. Payroll Processing */}
            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#0284C7" }]}
              onPress={() => router.push("/payroll" as any)}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionIconBox, { backgroundColor: "#F0F9FF" }]}
              >
                <CreditCard size={20} color="#0284C7" />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>Payroll Processing</Text>
                <Text style={styles.actionDesc}>
                  Salary structures, deductions & payslip dispatch
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* ATTENDANCE HEALTH METER */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workforce Presence Today</Text>
          </View>

          <View style={styles.attendanceCard}>
            <View style={styles.attendanceTopRow}>
              <View>
                <Text style={styles.attendancePercentText}>
                  {attendanceRate}%
                </Text>
                <Text style={styles.attendanceSubtext}>
                  {attendanceStats.presentToday} Present •{" "}
                  {attendanceStats.absentToday} Absent
                </Text>
              </View>
              <View style={styles.attBadge}>
                <Text style={styles.attBadgeText}>
                  {attendanceRate >= 80
                    ? "Optimal"
                    : attendanceRate >= 50
                      ? "Average"
                      : "Low"}
                </Text>
              </View>
            </View>

            {/* Segmented Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(attendanceRate, 100)}%` },
                ]}
              />
            </View>
          </View>

          {/* PENDING LEAVE REQUESTS INBOX */}
          <View style={styles.sectionHeaderWithAction}>
            <View>
              <Text style={styles.sectionTitle}>Pending Staff Leaves</Text>
              <Text style={styles.sectionSub}>Requires HR approval</Text>
            </View>
            {pendingLeaves.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/leave-list?scope=staff")}
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllText}>
                  View All ({pendingLeaves.length})
                </Text>
                <ArrowRight size={13} color="#173B7A" />
              </TouchableOpacity>
            )}
          </View>

          {pendingLeaves.length === 0 ? (
            <View style={styles.emptyCard}>
              <CheckCircle2 size={32} color="#059669" />
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptyDesc}>
                There are no pending employee leave applications awaiting your
                review.
              </Text>
            </View>
          ) : (
            <View style={styles.leavesList}>
              {pendingLeaves.slice(0, 3).map((leave) => (
                <View key={leave.id} style={styles.leaveCard}>
                  <View style={styles.leaveCardHeader}>
                    <View style={styles.leaveTypePill}>
                      <Text style={styles.leaveTypePillText}>
                        {leave.leaveType}
                      </Text>
                    </View>
                    <Text style={styles.leaveDateRange}>
                      {leave.startDate} to {leave.endDate}
                    </Text>
                  </View>

                  <Text style={styles.leaveEmpName}>
                    {leave.employeeName || `Employee #${leave.employeeId}`}
                  </Text>
                  {leave.reason ? (
                    <Text style={styles.leaveReason} numberOfLines={2}>
                      "{leave.reason}"
                    </Text>
                  ) : null}

                  {/* Actions */}
                  <View style={styles.leaveActionsRow}>
                    <TouchableOpacity
                      style={[styles.leaveBtn, styles.approveBtn]}
                      onPress={() => handleApproveLeave(leave.id)}
                      activeOpacity={0.8}
                    >
                      <CheckCircle2 size={14} color="#FFFFFF" />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.leaveBtn, styles.rejectBtn]}
                      onPress={() => handleRejectLeave(leave.id)}
                      activeOpacity={0.8}
                    >
                      <XCircle size={14} color="#DC2626" />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        <BottomNav role={userRole} />
      </View>

      {/* QUICK ONBOARD EMPLOYEE MODAL */}
      <Modal
        visible={showAddEmpModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddEmpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Onboard Employee</Text>
                <Text style={styles.modalSubtitle}>
                  Register a new staff member to {companyTitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddEmpModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <CustomInput
                label="Full Name *"
                placeholder="e.g. Rachel Adams"
                value={empName}
                onChangeText={setEmpName}
              />

              <CustomInput
                label="Work Email *"
                placeholder="e.g. rachel.adams@company.com"
                value={empEmail}
                onChangeText={setEmpEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomInput
                label="Phone Number"
                placeholder="e.g. +91 9876543210"
                value={empPhone}
                onChangeText={setEmpPhone}
                keyboardType="phone-pad"
              />

              <CustomInput
                label="Department"
                placeholder="e.g. Engineering, Sales, HR"
                value={empDepartment}
                onChangeText={setEmpDepartment}
              />

              <CustomInput
                label="Designation"
                placeholder="e.g. Frontend Developer"
                value={empDesignation}
                onChangeText={setEmpDesignation}
              />

              <CustomInput
                label="Monthly Salary (₹)"
                placeholder="e.g. 50000"
                value={empSalary}
                onChangeText={setEmpSalary}
                keyboardType="numeric"
              />

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowAddEmpModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <CustomButton
                  title={addEmpLoading ? "Saving..." : "Add to Staff"}
                  onPress={handleQuickAddEmployee}
                  loading={addEmpLoading}
                  style={styles.modalSubmitBtn}
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#173B7A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerTitleCol: {
    flex: 1,
  },
  roleBadge: {
    backgroundColor: "#FEF2F2",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#DC2626",
    letterSpacing: 0.5,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerEmail: {
    fontSize: 12,
    color: "#64748B",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626",
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },

  /* HERO BANNER - Differentiated with integrated action buttons */
  heroCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#0E2A5D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  heroStatusDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  heroLiveStatusText: {
    fontSize: 11,
    color: "#D1FAE5",
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
    textAlign: "left",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#93C5FD",
    lineHeight: 18,
    textAlign: "left",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 14,
  },
  heroActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  heroPrimaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#173B7A",
  },
  heroSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  heroSecondaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  /* 3 FLOATING KPI PILLARS - Left aligned, clean, balanced */
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "flex-start",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
    textAlign: "left",
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "left",
  },
  kpiSub: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
    textAlign: "left",
  },

  /* SECTION HEADERS */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSub: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  sectionHeaderWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#173B7A",
  },

  /* OPERATIONS LISTS */
  opsList: {
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
    textAlign: "left",
  },
  actionDesc: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "left",
    lineHeight: 15,
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#D97706",
  },

  /* ATTENDANCE METER CARD */
  attendanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  attendanceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  attendancePercentText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  attendanceSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  attBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 4,
  },

  /* PENDING LEAVES LIST */
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyDesc: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  leavesList: {
    gap: 12,
    marginBottom: 16,
  },
  leaveCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  leaveCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  leaveTypePill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  leaveTypePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#173B7A",
  },
  leaveDateRange: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  leaveEmpName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  leaveReason: {
    fontSize: 12,
    color: "#475569",
    fontStyle: "italic",
    marginBottom: 10,
    lineHeight: 16,
  },
  leaveActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  leaveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  approveBtn: {
    backgroundColor: "#059669",
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  rejectBtn: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingTop: 18,
    paddingHorizontal: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  modalSubmitBtn: {
    flex: 2,
  },
});
