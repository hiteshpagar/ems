import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { router } from "expo-router";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import BottomNav from "../components/BottomNav";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

export default function DashboardScreen() {
  const { userRole, userName, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
  });

  const [attendanceStats, setAttendanceStats] = useState({
    presentToday: 0,
    absentToday: 0,
    checkedInToday: 0,
  });

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  const fetchDashboardStats = async () => {
    try {
      const response = await API.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.log("Error fetching dashboard stats:", error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const response = await API.get("/dashboard/attendance-stats");
      setAttendanceStats(response.data);
    } catch (error) {
      console.log("Error fetching attendance stats:", error);
    }
  };

  const fetchUnreadNotificationCount = async () => {
    try {
      const response = await API.get("/notifications/unread-count");
      setUnreadNotificationCount(response.data.count ?? 0);
    } catch (error) {
      console.log("Error fetching unread notification count:", error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await API.get("/attendance/me/today");
      setTodayAttendance(response.data);
    } catch (error) {
      console.log("Error fetching today's attendance:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await API.get("/employees");
      const emps = Array.isArray(response.data) ? response.data : [];
      setEmployees(emps);

      const departments = new Set(emps.map((emp: any) => emp.department).filter(Boolean));
      setDepartmentCount(departments.size);
    } catch (error) {
      console.log("Error fetching employees:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAllData = () => {
    fetchDashboardData();
    fetchDashboardStats();
    fetchAttendanceStats();
    fetchUnreadNotificationCount();
    if (userRole !== "ADMIN") {
      fetchTodayAttendance();
    }
  };

  useEffect(() => {
    loadAllData();
  }, [userRole]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.dismissAll();
          router.replace("/login");
        },
      },
    ]);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const recentEmployees = [...employees].slice(0, 4);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const isAdmin = userRole === "ADMIN";

  return (
    <ScreenWrapper>
      <View style={styles.screen}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerUserRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName?.charAt(0)?.toUpperCase() || (isAdmin ? "A" : "E")}
              </Text>
            </View>
            <View style={styles.headerTitles}>
              <Text style={styles.greetingText}>
                {getGreeting()}, {userName?.split(" ")[0] || (isAdmin ? "Admin" : "Employee")} 👋
              </Text>
              <Text style={styles.subGreetingText}>
                {isAdmin ? "Here's what's happening today." : "Manage your daily work & activities."}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => router.push("/notifications")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${unreadNotificationCount} unread notifications`}
          >
            <Text style={styles.notifIcon}>🔔</Text>
            {unreadNotificationCount > 0 ? (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={AppColors.primary}
            />
          }
        >
          {/* STATS OVERVIEW - ADMIN */}
          {isAdmin ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statsCol}>
                  <StatCard
                    label="Employees"
                    value={stats.totalEmployees || employees.length}
                    subtext="Total active"
                    icon={<Text style={styles.statEmoji}>👥</Text>}
                    iconBgColor={AppColors.primaryLight}
                    onPress={() => router.push("/employee-list")}
                  />
                </View>
                <View style={styles.statsCol}>
                  <StatCard
                    label="Present Today"
                    value={attendanceStats.presentToday}
                    subtext="Checked in"
                    icon={<Text style={styles.statEmoji}>🟢</Text>}
                    iconBgColor={AppColors.successLight}
                    onPress={() => router.push("/attendance")}
                  />
                </View>
              </View>

              <View style={[styles.statsGrid, { marginTop: 12 }]}>
                <View style={styles.statsCol}>
                  <StatCard
                    label="Pending Leaves"
                    value={stats.pendingLeaves}
                    subtext="Requires action"
                    icon={<Text style={styles.statEmoji}>🏖️</Text>}
                    iconBgColor={AppColors.warningLight}
                    onPress={() => router.push("/leave-list")}
                  />
                </View>
                <View style={styles.statsCol}>
                  <StatCard
                    label="Departments"
                    value={departmentCount}
                    subtext="Company units"
                    icon={<Text style={styles.statEmoji}>🏢</Text>}
                    iconBgColor={AppColors.purpleLight}
                    onPress={() => router.push("/department-list")}
                  />
                </View>
              </View>
            </View>
          ) : (
            /* TODAY'S ATTENDANCE - EMPLOYEE */
            <View style={styles.section}>
              <View style={styles.employeeTodayCard}>
                <View style={styles.todayCardHeader}>
                  <View>
                    <Text style={styles.todayTitle}>{"Today's Attendance"}</Text>
                    <Text style={styles.todaySubtitle}>
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <StatusBadge
                    status={todayAttendance?.status || "Not Checked In"}
                    showDot
                  />
                </View>

                <View style={styles.timeRow}>
                  <View style={styles.timeBox}>
                    <Text style={styles.timeLabel}>Check-In</Text>
                    <Text style={styles.timeValue}>
                      {todayAttendance?.checkInTime || "--:--"}
                    </Text>
                  </View>
                  <View style={styles.timeDivider} />
                  <View style={styles.timeBox}>
                    <Text style={styles.timeLabel}>Check-Out</Text>
                    <Text style={styles.timeValue}>
                      {todayAttendance?.checkOutTime || "--:--"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.attendanceActionBtn}
                  onPress={() => router.push("/attendance")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.attendanceActionText}>
                    {todayAttendance?.checkInTime && !todayAttendance?.checkOutTime
                      ? "Check Out"
                      : "Mark Attendance"}
                  </Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* QUICK ACTIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.actionGrid}>
              {isAdmin ? (
                <>
                  <ActionTile
                    title="Add Employee"
                    subtitle="Register member"
                    icon="➕"
                    iconBg={AppColors.primaryLight}
                    onPress={() => router.push("/add-employee")}
                  />
                  <ActionTile
                    title="Leave Requests"
                    subtitle={`${stats.pendingLeaves} pending`}
                    icon="📋"
                    iconBg={AppColors.warningLight}
                    onPress={() => router.push("/leave-list")}
                  />
                  <ActionTile
                    title="Attendance"
                    subtitle="Daily records"
                    icon="🕒"
                    iconBg={AppColors.successLight}
                    onPress={() => router.push("/attendance")}
                  />
                  <ActionTile
                    title="Payroll"
                    subtitle="Structures & slips"
                    icon="💵"
                    iconBg={AppColors.infoLight}
                    onPress={() => router.push("/payroll" as any)}
                  />
                  <ActionTile
                    title="Departments"
                    subtitle={`${departmentCount} units`}
                    icon="🏢"
                    iconBg={AppColors.purpleLight}
                    onPress={() => router.push("/department-list")}
                  />
                  <ActionTile
                    title="Designations"
                    subtitle="Job roles"
                    icon="💼"
                    iconBg={AppColors.indigoLight}
                    onPress={() => router.push("/designation-list")}
                  />
                  <ActionTile
                    title="Holidays"
                    subtitle="Company calendar"
                    icon="🗓️"
                    iconBg={AppColors.warningLight}
                    onPress={() => router.push("/holiday-list")}
                  />
                  <ActionTile
                    title="Audit Logs"
                    subtitle="Activity tracking"
                    icon="📜"
                    iconBg={AppColors.indigoLight}
                    onPress={() => router.push("/audit-logs" as any)}
                  />
                  <ActionTile
                    title="Employees"
                    subtitle="Team directory"
                    icon="👥"
                    iconBg={AppColors.primaryLight}
                    onPress={() => router.push("/employee-list")}
                  />
                </>
              ) : (
                <>
                  <ActionTile
                    title="Apply Leave"
                    subtitle="Request time off"
                    icon="🏖️"
                    iconBg={AppColors.warningLight}
                    onPress={() => router.push("/apply-leave")}
                  />
                  <ActionTile
                    title="My Leaves"
                    subtitle="History & status"
                    icon="📋"
                    iconBg={AppColors.primaryLight}
                    onPress={() => router.push("/leave-list")}
                  />
                  <ActionTile
                    title="Attendance"
                    subtitle="History & logs"
                    icon="🕒"
                    iconBg={AppColors.successLight}
                    onPress={() => router.push("/attendance-history")}
                  />
                  <ActionTile
                    title="My Payslips"
                    subtitle="Salary statements"
                    icon="💵"
                    iconBg={AppColors.infoLight}
                    onPress={() => router.push("/payslips" as any)}
                  />
                  <ActionTile
                    title="Holidays"
                    subtitle="Upcoming holidays"
                    icon="🗓️"
                    iconBg={AppColors.purpleLight}
                    onPress={() => router.push("/holiday-list")}
                  />
                  <ActionTile
                    title="My Profile"
                    subtitle="View information"
                    icon="👤"
                    iconBg={AppColors.indigoLight}
                    onPress={() => router.push("/profile")}
                  />
                </>
              )}
            </View>
          </View>

          {/* ATTENDANCE ANALYTICS - ADMIN */}
          {isAdmin && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attendance Analytics</Text>
              <View style={styles.analyticsCard}>
                <View style={styles.analyticsRow}>
                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsEmoji}>🟢</Text>
                    <Text style={styles.analyticsNum}>{attendanceStats.presentToday}</Text>
                    <Text style={styles.analyticsLabel}>Present Today</Text>
                  </View>
                  <View style={styles.analyticsDivider} />
                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsEmoji}>🔴</Text>
                    <Text style={styles.analyticsNum}>{attendanceStats.absentToday}</Text>
                    <Text style={styles.analyticsLabel}>Absent Today</Text>
                  </View>
                  <View style={styles.analyticsDivider} />
                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsEmoji}>🕒</Text>
                    <Text style={styles.analyticsNum}>{attendanceStats.checkedInToday}</Text>
                    <Text style={styles.analyticsLabel}>Checked In</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* RECENT EMPLOYEES / RECENT TEAM */}
          {isAdmin && recentEmployees.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Employees</Text>
                <TouchableOpacity
                  onPress={() => router.push("/employee-list")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardList}>
                {recentEmployees.map((emp) => (
                  <TouchableOpacity
                    key={emp.id}
                    style={styles.empRow}
                    onPress={() => router.push(`/employee-details?id=${emp.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.empAvatar}>
                      <Text style={styles.empAvatarText}>
                        {emp.name?.charAt(0)?.toUpperCase() || "E"}
                      </Text>
                    </View>
                    <View style={styles.empInfo}>
                      <Text style={styles.empName}>{emp.name}</Text>
                      <Text style={styles.empDept}>{emp.department || "No department"}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* SIGN OUT */}
          <View style={[styles.section, { marginBottom: 32 }]}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutIcon}>⏻</Text>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Persistent Bottom Nav */}
        <BottomNav role={userRole} />
      </View>
    </ScreenWrapper>
  );
}

function ActionTile({
  title,
  subtitle,
  icon,
  iconBg,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionTile}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.actionIconBg, { backgroundColor: iconBg }]}>
        <Text style={styles.actionIcon}>{icon}</Text>
      </View>
      <Text style={styles.actionTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.actionSubtitle} numberOfLines={1}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: AppColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  headerUserRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  headerTitles: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },
  subGreetingText: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifIcon: {
    fontSize: 18,
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AppColors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.primary,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statsCol: {
    flex: 1,
  },
  statEmoji: {
    fontSize: 18,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionTile: {
    width: "48%",
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: AppRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
  },
  actionSubtitle: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  employeeTodayCard: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.card,
  },
  todayCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  todayTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: AppColors.text,
  },
  todaySubtitle: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: "row",
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: AppRadius.md,
    padding: 12,
    marginBottom: 16,
  },
  timeBox: {
    flex: 1,
    alignItems: "center",
  },
  timeDivider: {
    width: 1,
    backgroundColor: AppColors.border,
  },
  timeLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
    fontWeight: "500",
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },
  attendanceActionBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: AppRadius.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  attendanceActionText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 6,
  },
  arrowIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  analyticsCard: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  analyticsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  analyticsItem: {
    flex: 1,
    alignItems: "center",
  },
  analyticsDivider: {
    width: 1,
    height: 36,
    backgroundColor: AppColors.border,
  },
  analyticsEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  analyticsNum: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
  },
  analyticsLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  cardList: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    overflow: "hidden",
    ...AppShadows.subtle,
  },
  empRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  empAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  empAvatarText: {
    color: AppColors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  empInfo: {
    flex: 1,
  },
  empName: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  empDept: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: AppColors.textMuted,
  },
  logoutButton: {
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.dangerLight,
    borderRadius: AppRadius.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIcon: {
    fontSize: 16,
    color: AppColors.danger,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.danger,
  },
});
