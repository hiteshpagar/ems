import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useContext, useEffect, useState } from "react";
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

export default function ApplyLeaveScreen() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    } else {
      fetchLoggedInEmployee();
    }
  }, [userRole]);

  const handleApplyLeave = async () => {
    if (isAdmin && !employeeId) {
      Alert.alert("Required Field", "Please select an employee.");
      return;
    }

    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      Alert.alert("Required Fields", "Please fill in all required fields.");
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
