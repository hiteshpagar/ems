import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useState } from "react";

import { router } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";

import API from "../services/api";

import ScreenWrapper from "../components/ScreenWrapper";

import { removeToken } from "../utils/storage";

export default function DashboardScreen() {
  const [employeeCount, setEmployeeCount] = useState(0);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
  });

  const [departmentCount, setDepartmentCount] = useState(0);
  const [averageSalary, setAverageSalary] = useState(0);
  const [highestSalary, setHighestSalary] = useState(0);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);

  const fetchDashboardStats = async () => {
    try {
      const response = await API.get("/dashboard/stats");

      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Employee Count
  const fetchDashboardData = async () => {
    try {
      const response = await API.get("/employees");

      const employees = response.data;

      setEmployees(employees);

      setEmployeeCount(employees.length);

      // Unique Departments
      const departments = new Set(employees.map((emp: any) => emp.department));

      setDepartmentCount(departments.size);

      // Average Salary
      const totalSalary = employees.reduce(
        (sum: number, emp: any) => sum + Number(emp.salary),
        0,
      );

      setAverageSalary(
        employees.length ? Math.round(totalSalary / employees.length) : 0,
      );

      // Highest Salary
      const maxSalary = employees.length
        ? Math.max(...employees.map((emp: any) => Number(emp.salary)))
        : 0;

      setHighestSalary(maxSalary);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchDashboardData();
    fetchDashboardStats();
  }, []);

  // Pull To Refresh
  const onRefresh = () => {
    setRefreshing(true);

    fetchDashboardData();
    fetchDashboardStats();
  };

  // Logout
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },

      {
        text: "Logout",

        onPress: async () => {
          await removeToken();
          router.dismissAll();

          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2F80ED" />

          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning ☀️";
    }

    if (hour < 18) {
      return "Good Afternoon 🌤️";
    }

    return "Good Evening 🌙";
  };

  const recentEmployees = [...employees]
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HERO SECTION */}

        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.heroGradient}
        >
          <View style={styles.circleTopRight} />

          <View style={styles.circleBottomLeft} />

          {/* TOP ROW */}

          <View style={styles.heroTopRow}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#56CCF2", "#2F80ED"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarInitial}>H</Text>
              </LinearGradient>

              <View style={styles.onlineDot} />
            </View>

            <TouchableOpacity style={styles.notifBadge}>
              <Text style={styles.notifIcon}>🔔</Text>

              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* GREETING */}

          <Text style={styles.greeting}>{getGreeting()}</Text>

          <Text style={styles.heroTitle}>Employee{"\n"}Dashboard</Text>

          {/* STATUS TAG */}

          <View style={styles.pillTag}>
            <View style={styles.pillDot} />

            <Text style={styles.pillText}>System Running Smoothly</Text>
          </View>
        </LinearGradient>

        {/* OVERVIEW */}

        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionLabel}>OVERVIEW</Text>

          <View style={styles.statsRow}>
            <LinearGradient
              colors={["#2F80ED", "#56CCF2"]}
              style={styles.statCard}
            >
              <Text style={styles.statEmoji}>👥</Text>
              <Text style={styles.statNumber}>{stats.totalEmployees}</Text>
              <Text style={styles.statLabel}>Employees</Text>
            </LinearGradient>

            <LinearGradient
              colors={["#F2994A", "#F2C94C"]}
              style={styles.statCard}
            >
              <Text style={styles.statEmoji}>🟡</Text>

              <Text style={styles.statNumber}>{stats.pendingLeaves}</Text>

              <Text style={styles.statLabel}>Pending Leaves</Text>
            </LinearGradient>
          </View>

          <View style={[styles.statsRow, { marginTop: 14 }]}>
            <LinearGradient
              colors={["#27AE60", "#6FCF97"]}
              style={styles.statCard}
            >
              <Text style={styles.statEmoji}>🟢</Text>

              <Text style={styles.statNumber}>{stats.approvedLeaves}</Text>

              <Text style={styles.statLabel}>Approved Leaves</Text>
            </LinearGradient>

            <LinearGradient
              colors={["#EB5757", "#FF416C"]}
              style={styles.statCard}
            >
              <Text style={styles.statEmoji}>🔴</Text>

              <Text style={styles.statNumber}>{stats.rejectedLeaves}</Text>

              <Text style={styles.statLabel}>Rejected Leaves</Text>
            </LinearGradient>
          </View>
        </View>

        {/* QUICK ACTIONS */}

        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>

          {/* ADD EMPLOYEE */}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/add-employee")}
          >
            <LinearGradient
              colors={["#1a1a2e", "#16213e"]}
              style={styles.actionCard}
            >
              <View style={styles.actionIconBg}>
                <Text style={styles.actionIconText}>+</Text>
              </View>

              <View style={styles.actionTextGroup}>
                <Text style={styles.actionTitle}>Add Employee</Text>

                <Text style={styles.actionSub}>Register new employee</Text>
              </View>

              <Text style={styles.actionChevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* VIEW EMPLOYEES */}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/employee-list")}
          >
            <LinearGradient
              colors={["#1a1a2e", "#16213e"]}
              style={styles.actionCard}
            >
              <View
                style={[
                  styles.actionIconBg,
                  {
                    backgroundColor: "#11998e",
                  },
                ]}
              >
                <Text style={styles.actionIconText}>☰</Text>
              </View>

              <View style={styles.actionTextGroup}>
                <Text style={styles.actionTitle}>View Employees</Text>

                <Text style={styles.actionSub}>Browse employee list</Text>
              </View>

              <Text style={styles.actionChevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/apply-leave")}
          >
            <LinearGradient
              colors={["#1a1a2e", "#16213e"]}
              style={styles.actionCard}
            >
              <View
                style={[
                  styles.actionIconBg,
                  {
                    backgroundColor: "#F2994A",
                  },
                ]}
              >
                <Text style={styles.actionIconText}>🏖</Text>
              </View>

              <View style={styles.actionTextGroup}>
                <Text style={styles.actionTitle}>Apply Leave</Text>

                <Text style={styles.actionSub}>Submit leave request</Text>
              </View>

              <Text style={styles.actionChevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/attendance")}
          >
            <LinearGradient
              colors={["#1a1a2e", "#16213e"]}
              style={styles.actionCard}
            >
              <View
                style={[
                  styles.actionIconBg,
                  {
                    backgroundColor: "#8E44AD",
                  },
                ]}
              >
                <Text style={styles.actionIconText}>🕒</Text>
              </View>

              <View style={styles.actionTextGroup}>
                <Text style={styles.actionTitle}>Attendance</Text>

                <Text style={styles.actionSub}>Mark employee attendance</Text>
              </View>

              <Text style={styles.actionChevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
  activeOpacity={0.85}
  onPress={() =>
    router.push("/attendance-history")
  }
>
  <LinearGradient
    colors={["#1a1a2e", "#16213e"]}
    style={styles.actionCard}
  >
    <View
      style={[
        styles.actionIconBg,
        {
          backgroundColor: "#16A085",
        },
      ]}
    >
      <Text style={styles.actionIconText}>
        📊
      </Text>
    </View>

    <View style={styles.actionTextGroup}>
      <Text style={styles.actionTitle}>
        Attendance History
      </Text>

      <Text style={styles.actionSub}>
        View attendance records
      </Text>
    </View>

    <Text style={styles.actionChevron}>
      ›
    </Text>
  </LinearGradient>
</TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/leave-list")}
          >
            <LinearGradient
              colors={["#1a1a2e", "#16213e"]}
              style={styles.actionCard}
            >
              <View
                style={[
                  styles.actionIconBg,
                  {
                    backgroundColor: "#27AE60",
                  },
                ]}
              >
                <Text style={styles.actionIconText}>📋</Text>
              </View>

              <View style={styles.actionTextGroup}>
                <Text style={styles.actionTitle}>View Leaves</Text>

                <Text style={styles.actionSub}>Track leave requests</Text>
              </View>

              <Text style={styles.actionChevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionLabel}>RECENT EMPLOYEES</Text>

          {recentEmployees.map((employee) => (
            <View key={employee.id} style={styles.employeeCard}>
              <View style={styles.employeeAvatar}>
                <Text style={styles.employeeAvatarText}>
                  {employee.name
                    ?.split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.employeeName}>{employee.name}</Text>

                <Text style={styles.employeeDepartment}>
                  {employee.department}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* LOGOUT */}

        <View style={styles.sectionWrapper}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleLogout}>
            <LinearGradient
              colors={["#FF416C", "#FF4B2B"]}
              style={styles.logoutCard}
            >
              <Text style={styles.logoutIcon}>⏻</Text>

              <Text style={styles.logoutTitle}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "600",
  },

  heroGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    overflow: "hidden",
  },

  circleTopRight: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(86,204,242,0.08)",
    top: -60,
    right: -60,
  },

  circleBottomLeft: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(47,128,237,0.1)",
    bottom: -40,
    left: -30,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  avatarContainer: {
    position: "relative",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitial: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#38ef7d",
    borderWidth: 2,
    borderColor: "#0F2027",
  },

  notifBadge: {
    position: "relative",
    padding: 8,
  },

  notifIcon: {
    fontSize: 22,
  },

  notifDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF416C",
  },

  greeting: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    marginBottom: 6,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
    lineHeight: 48,
    marginBottom: 20,
  },

  pillTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(56,239,125,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#38ef7d",
    marginRight: 8,
  },

  pillText: {
    color: "#38ef7d",
    fontSize: 12,
    fontWeight: "600",
  },

  sectionWrapper: {
    paddingHorizontal: 20,
    marginTop: 28,
  },

  sectionLabel: {
    color: "rgba(0,0,0,0.4)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 14,
    letterSpacing: 1.2,
  },

  statsRow: {
    flexDirection: "row",
    gap: 14,
  },

  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
  },

  statEmoji: {
    fontSize: 22,
    marginBottom: 10,
  },

  statNumber: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
  },

  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 6,
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2F80ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  actionIconText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  actionTextGroup: {
    flex: 1,
  },

  actionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  actionSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 3,
  },

  actionChevron: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 28,
  },

  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    padding: 18,
    marginBottom: 40,
  },

  logoutIcon: {
    color: "#fff",
    fontSize: 20,
    marginRight: 10,
  },

  logoutTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  employeeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },

  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2F80ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  employeeAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  employeeName: {
    fontSize: 16,
    fontWeight: "600",
  },

  employeeDepartment: {
    color: "gray",
    marginTop: 2,
  },

  actionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },

  actionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
});
