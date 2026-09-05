import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";
import CustomButton from "../components/CustomButton";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

export default function AttendanceScreen() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === "ADMIN";

  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees");
      const data = Array.isArray(response.data) ? response.data : [];
      setEmployees(data);
      if (data.length > 0) {
        setEmployeeId(data[0].id.toString());
        setEmployeeName(data[0].name);
      }
    } catch (error) {
      console.log("Error loading employees for attendance:", error);
    }
  };

  const fetchLoggedInEmployee = async () => {
    try {
      const response = await API.get("/employees/me");
      setEmployeeId(response.data.id.toString());
      setEmployeeName(response.data.name);
    } catch (error) {
      console.log("Error loading current employee:", error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await API.get("/attendance/me/today");
      setTodayAttendance(response.data);
    } catch (error) {
      console.log("Error loading today's attendance:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    } else {
      fetchLoggedInEmployee();
      fetchTodayAttendance();
    }
  }, [userRole]);

  const handleCheckIn = async () => {
    if (!employeeId) {
      Alert.alert("Error", "Please select an employee.");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/attendance/check-in", {
        employeeId,
        employeeName,
      });

      if (!isAdmin) {
        await fetchTodayAttendance();
      }

      Alert.alert("Success", `Check In Successful for ${employeeName || "Employee"}.`);
    } catch (error: any) {
      console.log("Check-in error:", error);
      const msg = error?.response?.data?.message || "Check In Failed";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!employeeId) {
      Alert.alert("Error", "Please select an employee.");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/attendance/check-out", {
        employeeId,
      });

      if (!isAdmin) {
        await fetchTodayAttendance();
      }

      Alert.alert("Success", `Check Out Successful for ${employeeName || "Employee"}.`);
    } catch (error: any) {
      console.log("Check-out error:", error);
      const msg = error?.response?.data?.message || "Check Out Failed";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "--:--";
    const parts = time.split(":");
    if (parts.length < 2) return time;
    let hours = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minute} ${ampm}`;
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isCheckedIn = Boolean(todayAttendance?.checkInTime);
  const isCheckedOut = Boolean(todayAttendance?.checkOutTime);

  return (
    <ScreenWrapper>
      <AppHeader
        title="Attendance"
        subtitle={todayFormatted}
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => router.push("/attendance-history")}
            style={styles.historyNavBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.historyNavText}>History 📊</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Admin Employee Selector */}
        {isAdmin ? (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Select Employee</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={employeeId}
                onValueChange={(value) => {
                  setEmployeeId(value);
                  const emp = employees.find((e) => e.id.toString() === value);
                  if (emp) setEmployeeName(emp.name);
                }}
              >
                {employees.map((emp) => (
                  <Picker.Item
                    key={emp.id}
                    label={`${emp.name} (${emp.department || "No Dept"})`}
                    value={emp.id.toString()}
                  />
                ))}
              </Picker>
            </View>
          </View>
        ) : null}

        {/* Big Attendance Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{todayFormatted}</Text>
            <StatusBadge
              status={
                isCheckedOut
                  ? "Completed"
                  : isCheckedIn
                  ? "Present"
                  : "Not Checked In"
              }
              showDot
            />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricEmoji}>🟢</Text>
              <Text style={styles.metricLabel}>Check-In Time</Text>
              <Text style={styles.metricValue}>
                {formatTime(todayAttendance?.checkInTime)}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricBox}>
              <Text style={styles.metricEmoji}>🔴</Text>
              <Text style={styles.metricLabel}>Check-Out Time</Text>
              <Text style={styles.metricValue}>
                {formatTime(todayAttendance?.checkOutTime)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {isAdmin ? (
              <View style={styles.adminActionRow}>
                <CustomButton
                  title="Check In Employee"
                  onPress={handleCheckIn}
                  loading={submitting}
                  style={styles.halfBtn}
                />
                <CustomButton
                  title="Check Out Employee"
                  onPress={handleCheckOut}
                  loading={submitting}
                  variant="secondary"
                  style={styles.halfBtn}
                />
              </View>
            ) : isCheckedIn && !isCheckedOut ? (
              <CustomButton
                title="Check Out"
                onPress={handleCheckOut}
                loading={submitting}
                variant="danger"
                style={styles.fullBtn}
              />
            ) : !isCheckedIn ? (
              <CustomButton
                title="Check In"
                onPress={handleCheckIn}
                loading={submitting}
                style={styles.fullBtn}
              />
            ) : (
              <View style={styles.doneNotice}>
                <Text style={styles.doneNoticeText}>
                  ✓ Attendance completed for today
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Attendance Summary Highlights */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Quick Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>
                {todayAttendance?.checkInTime ? "1" : "0"}
              </Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>
                {todayAttendance?.checkInTime ? "0" : "1"}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>0</Text>
              <Text style={styles.summaryLabel}>Half Day</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>0</Text>
              <Text style={styles.summaryLabel}>On Leave</Text>
            </View>
          </View>
        </View>

        {/* History Navigation Button */}
        <TouchableOpacity
          style={styles.viewHistoryCard}
          onPress={() => router.push("/attendance-history")}
          activeOpacity={0.8}
        >
          <View style={styles.historyCardLeft}>
            <Text style={styles.historyCardIcon}>📊</Text>
            <View>
              <Text style={styles.historyCardTitle}>Attendance History</Text>
              <Text style={styles.historyCardSub}>
                View all previous date records and timestamps
              </Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  historyNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppRadius.sm,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  historyNavText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: AppColors.borderStrong,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surface,
    overflow: "hidden",
  },
  statusCard: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.card,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
  },
  metricsRow: {
    flexDirection: "row",
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: AppRadius.md,
    padding: 16,
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    alignItems: "center",
  },
  metricDivider: {
    width: 1,
    backgroundColor: AppColors.border,
  },
  metricEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
    fontWeight: "600",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "700",
    color: AppColors.text,
  },
  actionsContainer: {
    marginTop: 4,
  },
  adminActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  halfBtn: {
    flex: 1,
  },
  fullBtn: {
    width: "100%",
  },
  doneNotice: {
    backgroundColor: AppColors.successLight,
    borderRadius: AppRadius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneNoticeText: {
    color: AppColors.success,
    fontWeight: "700",
    fontSize: 14,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryNum: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
  viewHistoryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  historyCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyCardIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  historyCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
  },
  historyCardSub: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: AppColors.textMuted,
    marginLeft: 8,
  },
});
