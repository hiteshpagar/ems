import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import DatePickerField from "../components/DatePickerField";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Annual Leave",
  "Paid Leave",
  "Unpaid Leave",
  "Maternity Leave",
  "Paternity Leave",
];

interface LeaveBalance {
  totalQuota: number;
  totalUsed: number;
  totalAvailable: number;
  casualQuota: number;
  casualUsed: number;
  casualAvailable: number;
  sickQuota: number;
  sickUsed: number;
  sickAvailable: number;
  paidQuota: number;
  paidUsed: number;
  paidAvailable: number;
  pendingDays: number;
  approvedDays: number;
}

export default function ApplyLeaveScreen() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === "ADMIN";

  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees");
      const data = Array.isArray(response.data) ? response.data : [];
      setEmployees(data);
      if (data.length > 0) {
        setEmployeeId(data[0].id);
        setEmployeeName(data[0].name);
      }
    } catch (error) {
      console.log("Error loading employees:", error);
    }
  };

  const fetchLoggedInEmployee = async () => {
    try {
      const response = await API.get("/employees/me");
      setEmployeeId(response.data.id);
      setEmployeeName(response.data.name);
    } catch (error) {
      console.log("Error loading employee info:", error);
    }
  };

  const fetchBalance = useCallback(
    async (targetEmployeeId: number | null) => {
      try {
        const url =
          isAdmin && targetEmployeeId
            ? `/leaves/balance/${targetEmployeeId}`
            : "/leaves/me/balance";
        const response = await API.get(url);
        setBalance(response.data);
      } catch (error) {
        console.log("Error fetching leave balance:", error);
      }
    },
    [isAdmin]
  );

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    } else {
      fetchLoggedInEmployee();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (employeeId) {
      fetchBalance(employeeId);
    } else if (!isAdmin) {
      fetchBalance(null);
    }
  }, [employeeId, isAdmin, fetchBalance]);

  const requestedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return 0;
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const quotaWarning = useMemo(() => {
    if (!balance || requestedDays <= 0) return null;
    if (requestedDays > balance.totalAvailable) {
      return `Exceeds total annual balance (${balance.totalAvailable} days available)`;
    }
    const type = leaveType.toLowerCase();
    if (type.includes("casual") && requestedDays > balance.casualAvailable) {
      return `Exceeds casual leave quota (${balance.casualAvailable} days available)`;
    }
    if (type.includes("sick") && requestedDays > balance.sickAvailable) {
      return `Exceeds sick leave quota (${balance.sickAvailable} days available)`;
    }
    if (
      (type.includes("paid") || type.includes("annual")) &&
      requestedDays > balance.paidAvailable
    ) {
      return `Exceeds paid/annual leave quota (${balance.paidAvailable} days available)`;
    }
    return null;
  }, [balance, requestedDays, leaveType]);

  const handleApplyLeave = async () => {
    if (isAdmin && !employeeId) {
      Alert.alert("Required Field", "Please select an employee.");
      return;
    }

    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      Alert.alert("Required Fields", "Please fill in all required fields.");
      return;
    }

    if (quotaWarning) {
      Alert.alert("Quota Exceeded", quotaWarning);
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/leaves", {
        employeeId,
        employeeName,
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });

      Alert.alert("Success", "Leave request submitted successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.log("Error applying leave:", error);
      const msg =
        error?.response?.data?.message || "Failed to submit leave request.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title="Apply Leave"
        subtitle="Submit a new time-off request"
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Leave Balance Overview Card */}
        {balance ? (
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View>
                <Text style={styles.balanceTitle}>Annual Leave Balance</Text>
                <Text style={styles.balanceSubtitle}>
                  Allowance tracking for {new Date().getFullYear()}
                </Text>
              </View>
              <View style={styles.totalBadge}>
                <Text style={styles.totalBadgeValue}>
                  {balance.totalAvailable} / {balance.totalQuota}
                </Text>
                <Text style={styles.totalBadgeLabel}>Days Left</Text>
              </View>
            </View>

            <View style={styles.quotaGrid}>
              <View style={[styles.quotaItem, { backgroundColor: AppColors.primaryLight }]}>
                <Text style={styles.quotaItemTitle}>Casual</Text>
                <Text style={[styles.quotaItemValue, { color: AppColors.primaryDark }]}>
                  {balance.casualAvailable} / {balance.casualQuota}d
                </Text>
                <Text style={styles.quotaItemSub}>Used: {balance.casualUsed}d</Text>
              </View>

              <View style={[styles.quotaItem, { backgroundColor: AppColors.warningLight }]}>
                <Text style={styles.quotaItemTitle}>Sick</Text>
                <Text style={[styles.quotaItemValue, { color: AppColors.warning }]}>
                  {balance.sickAvailable} / {balance.sickQuota}d
                </Text>
                <Text style={styles.quotaItemSub}>Used: {balance.sickUsed}d</Text>
              </View>

              <View style={[styles.quotaItem, { backgroundColor: AppColors.successLight }]}>
                <Text style={styles.quotaItemTitle}>Paid / Annual</Text>
                <Text style={[styles.quotaItemValue, { color: AppColors.success }]}>
                  {balance.paidAvailable} / {balance.paidQuota}d
                </Text>
                <Text style={styles.quotaItemSub}>Used: {balance.paidUsed}d</Text>
              </View>
            </View>

            {balance.pendingDays > 0 || balance.approvedDays > 0 ? (
              <View style={styles.statusMetaRow}>
                <Text style={styles.statusMetaText}>
                  ⏳ Pending: {balance.pendingDays}d  •  ✅ Approved: {balance.approvedDays}d
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          {/* Admin Employee Selector */}
          {isAdmin ? (
            <View style={styles.pickerField}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Employee</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={employeeId}
                  onValueChange={(value) => {
                    setEmployeeId(value);
                    const emp = employees.find((e) => e.id === value);
                    if (emp) setEmployeeName(emp.name);
                  }}
                >
                  {employees.map((emp) => (
                    <Picker.Item
                      key={emp.id}
                      label={`${emp.name} (${emp.department || "No Dept"})`}
                      value={emp.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          ) : null}

          {/* Leave Type */}
          <View style={styles.pickerField}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Leave Type</Text>
              <Text style={styles.requiredStar}> *</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={leaveType}
                onValueChange={(value) => setLeaveType(value)}
              >
                {LEAVE_TYPES.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {/* From Date */}
          <DatePickerField
            label="From Date"
            placeholder="Select start date"
            value={startDate}
            onChange={setStartDate}
            required
          />

          {/* To Date */}
          <DatePickerField
            label="To Date"
            placeholder="Select end date"
            value={endDate}
            onChange={setEndDate}
            minimumDate={startDate ? new Date(startDate) : undefined}
            required
          />

          {/* Real-time Duration and Quota Banner */}
          {requestedDays > 0 ? (
            <View
              style={[
                styles.durationBanner,
                quotaWarning ? styles.durationWarningBanner : styles.durationSuccessBanner,
              ]}
            >
              <Text
                style={[
                  styles.durationText,
                  quotaWarning ? styles.durationWarningText : styles.durationSuccessText,
                ]}
              >
                {quotaWarning ? `⚠️ ${quotaWarning}` : `🗓️ Duration: ${requestedDays} day${requestedDays > 1 ? "s" : ""}`}
              </Text>
            </View>
          ) : null}

          {/* Reason */}
          <CustomInput
            label="Reason for Leave"
            placeholder="Please specify why you need leave..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            required
          />

          <CustomButton
            title="Submit Leave"
            onPress={handleApplyLeave}
            loading={submitting}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 16,
    ...AppShadows.card,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },
  balanceSubtitle: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  totalBadge: {
    backgroundColor: AppColors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: AppRadius.md,
    alignItems: "center",
  },
  totalBadgeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.primaryDark,
  },
  totalBadgeLabel: {
    fontSize: 10,
    color: AppColors.primaryDark,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  quotaGrid: {
    flexDirection: "row",
    gap: 8,
  },
  quotaItem: {
    flex: 1,
    padding: 10,
    borderRadius: AppRadius.md,
    alignItems: "center",
  },
  quotaItemTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  quotaItemValue: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  quotaItemSub: {
    fontSize: 10,
    color: AppColors.textMuted,
  },
  statusMetaRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    alignItems: "center",
  },
  statusMetaText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  durationBanner: {
    padding: 12,
    borderRadius: AppRadius.md,
    marginBottom: 16,
    borderWidth: 1,
  },
  durationSuccessBanner: {
    backgroundColor: AppColors.primaryLight,
    borderColor: AppColors.primary,
  },
  durationWarningBanner: {
    backgroundColor: AppColors.dangerLight,
    borderColor: AppColors.danger,
  },
  durationText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  durationSuccessText: {
    color: AppColors.primaryDark,
  },
  durationWarningText: {
    color: AppColors.danger,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.card,
  },
  pickerField: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  requiredStar: {
    color: AppColors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: AppColors.borderStrong,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surface,
    overflow: "hidden",
  },
  submitBtn: {
    marginTop: 8,
  },
});
