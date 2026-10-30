import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
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
  "Paid Leave",
  "Unpaid Leave",
  "Work From Home (WFH)",
  "Sick Leave",
];

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

export default function ApplyLeaveScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const { userRole } = useContext(AuthContext);

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  const isHr = userRole === "HR";
  const isManager = isAdmin || isHr;

  // HR and regular employees can ONLY apply for personal leave.
  // Only Company Admin / Super Admin can apply on behalf of other staff.
  const [applyMode, setApplyMode] = useState<"personal" | "staff">(() => {
    if (isAdmin && params.mode === "staff") return "staff";
    return "personal";
  });

  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);

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
      if (response.data) {
        setEmployeeId(response.data.id);
        setEmployeeName(response.data.name || "");
      }
    } catch (error) {
      console.log("Error loading employee info:", error);
    }
  };

  const fetchBalance = useCallback(
    async (targetEmployeeId: number | null) => {
      try {
        const url =
          isAdmin && applyMode === "staff" && targetEmployeeId
            ? `/leaves/balance/${targetEmployeeId}`
            : "/leaves/me/balance";
        const response = await API.get(url);
        setBalance(response.data);
      } catch (error) {
        console.log("Error fetching leave balance:", error);
      }
    },
    [isAdmin, applyMode]
  );

  useEffect(() => {
    if (isAdmin && applyMode === "staff") {
      fetchEmployees();
    } else {
      fetchLoggedInEmployee();
    }
  }, [isAdmin, applyMode]);

  useEffect(() => {
    if (applyMode === "staff") {
      if (employeeId) {
        fetchBalance(employeeId);
      }
    } else {
      fetchBalance(null);
    }
  }, [employeeId, applyMode, fetchBalance]);

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
    if (leaveType === "Unpaid Leave") {
      return null;
    }
    if (leaveType === "Paid Leave" && requestedDays > balance.paidAvailable) {
      return `Exceeds paid leave quota (${balance.paidAvailable} days available for ${balance.year})`;
    }
    if (leaveType === "Sick Leave" && requestedDays > balance.sickAvailable) {
      return `Exceeds sick leave quota (${balance.sickAvailable} days available for ${balance.year})`;
    }
    if (
      leaveType === "Work From Home (WFH)" &&
      requestedDays > balance.wfhAvailable
    ) {
      return `Exceeds WFH quota (${balance.wfhAvailable} days available for ${balance.year})`;
    }
    return null;
  }, [balance, requestedDays, leaveType]);

  const handleApplyLeave = async () => {
    if (applyMode === "staff" && !employeeId) {
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
        employeeId: applyMode === "staff" ? employeeId : undefined,
        employeeName: applyMode === "staff" ? employeeName : undefined,
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });

      Alert.alert(
        "Success",
        applyMode === "personal"
          ? "Personal leave application submitted successfully."
          : "Staff leave request submitted successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
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
        title={
          applyMode === "personal"
            ? isHr
              ? "Apply HR Personal Leave"
              : "Apply Personal Leave"
            : "Staff Leave Application"
        }
        subtitle={
          applyMode === "personal"
            ? "Submit your personal time-off application"
            : "Submit time-off on behalf of an employee"
        }
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Admin Mode Switcher (Personal vs Staff) - Only available to Admin */}
        {isAdmin ? (
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                applyMode === "personal" && styles.modeToggleBtnActive,
              ]}
              onPress={() => setApplyMode("personal")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeToggleText,
                  applyMode === "personal" && styles.modeToggleTextActive,
                ]}
              >
                👤 {isHr ? "HR Personal Leave" : "My Personal Leave"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                applyMode === "staff" && styles.modeToggleBtnActive,
              ]}
              onPress={() => setApplyMode("staff")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeToggleText,
                  applyMode === "staff" && styles.modeToggleTextActive,
                ]}
              >
                👥 On Behalf of Staff
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Leave Balance Overview Card */}
        {balance ? (
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View>
                <Text style={styles.balanceTitle}>
                  {applyMode === "personal"
                    ? "My Annual Leave Balances"
                    : `${employeeName ? `${employeeName}'s` : "Employee"} Leave Balances`}
                </Text>
                <Text style={styles.balanceSubtitle}>
                  Quarterly tracking for {balance.year || new Date().getFullYear()}
                </Text>
              </View>
              <View style={styles.totalBadge}>
                <Text style={styles.totalBadgeValue}>
                  {balance.totalAvailable} / {balance.totalQuota}
                </Text>
                <Text style={styles.totalBadgeLabel}>Days Left</Text>
              </View>
            </View>

            {balance.totalQuota === 0 ? (
              <View style={styles.emptyQuotaNotice}>
                <Text style={styles.emptyQuotaNoticeText}>
                  ℹ️ No quarterly quota has been allocated for {balance.year || new Date().getFullYear()} yet.
                  {isManager ? " You can allocate quotas from the Leave Allocation screen." : " Please contact your administrator."}
                </Text>
              </View>
            ) : (
              <View style={styles.quotaGrid}>
                <View style={[styles.quotaItem, { backgroundColor: AppColors.primaryLight }]}>
                  <Text style={styles.quotaItemTitle}>Paid Leave</Text>
                  <Text style={[styles.quotaItemValue, { color: AppColors.primaryDark }]}>
                    {balance.paidAvailable} / {balance.paidQuota}d
                  </Text>
                  <Text style={styles.quotaItemSub}>Used: {balance.paidUsed}d</Text>
                </View>

                <View style={[styles.quotaItem, { backgroundColor: AppColors.warningLight }]}>
                  <Text style={styles.quotaItemTitle}>Sick Leave</Text>
                  <Text style={[styles.quotaItemValue, { color: AppColors.warning }]}>
                    {balance.sickAvailable} / {balance.sickQuota}d
                  </Text>
                  <Text style={styles.quotaItemSub}>Used: {balance.sickUsed}d</Text>
                </View>

                <View style={[styles.quotaItem, { backgroundColor: AppColors.successLight }]}>
                  <Text style={styles.quotaItemTitle}>WFH</Text>
                  <Text style={[styles.quotaItemValue, { color: AppColors.success }]}>
                    {balance.wfhAvailable} / {balance.wfhQuota}d
                  </Text>
                  <Text style={styles.quotaItemSub}>Used: {balance.wfhUsed}d</Text>
                </View>
              </View>
            )}

            <View style={styles.statusMetaRow}>
              <Text style={styles.statusMetaText}>
                ⏳ Pending: {balance.pendingDays}d  •  ✅ Approved: {balance.approvedDays}d  •  🏖️ Unpaid: {balance.unpaidUsed}d
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          {/* Personal vs Staff Employee Selector */}
          {applyMode === "personal" ? (
            <View style={styles.applicantInfoCard}>
              <View style={styles.applicantIconBox}>
                <Text style={styles.applicantIcon}>👤</Text>
              </View>
              <View style={styles.applicantDetails}>
                <Text style={styles.applicantLabel}>Applicant (Self)</Text>
                <Text style={styles.applicantName}>
                  {employeeName || (isHr ? "HR Manager" : "Logged-in User")}
                </Text>
              </View>
              <View style={styles.personalBadge}>
                <Text style={styles.personalBadgeText}>Personal</Text>
              </View>
            </View>
          ) : (
            <View style={styles.pickerField}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Select Employee</Text>
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
          )}

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
            title={
              applyMode === "personal"
                ? "Submit Personal Leave Request"
                : "Submit Staff Leave Request"
            }
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
  modeToggleContainer: {
    flexDirection: "row",
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: AppRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 16,
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: AppRadius.sm,
  },
  modeToggleBtnActive: {
    backgroundColor: AppColors.primary,
    ...AppShadows.subtle,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  modeToggleTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  applicantInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surfaceMuted,
    padding: 12,
    borderRadius: AppRadius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  applicantIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  applicantIcon: {
    fontSize: 18,
  },
  applicantDetails: {
    flex: 1,
  },
  applicantLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  applicantName: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
    marginTop: 2,
  },
  personalBadge: {
    backgroundColor: AppColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppRadius.sm,
  },
  personalBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.primaryDark,
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
  emptyQuotaNotice: {
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: AppRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  emptyQuotaNoticeText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
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
