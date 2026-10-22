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
import { useCallback, useContext, useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import EmptyState from "../components/EmptyState";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

const QUARTERS = [
  { value: 1, label: "Q1 (Jan - Mar)" },
  { value: 2, label: "Q2 (Apr - Jun)" },
  { value: 3, label: "Q3 (Jul - Sep)" },
  { value: 4, label: "Q4 (Oct - Dec)" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

interface AllocationItem {
  id: number;
  employeeId: number;
  employeeName: string;
  year: number;
  quarter: number;
  paidLeaveQuota: number;
  sickLeaveQuota: number;
  wfhQuota: number;
  remarks?: string;
  allocatedAt?: string;
}

export default function LeaveAllocationScreen() {
  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === "ADMIN";

  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [quarter, setQuarter] = useState<number>(1);
  const [paidQuota, setPaidQuota] = useState("3");
  const [sickQuota, setSickQuota] = useState("2");
  const [wfhQuota, setWfhQuota] = useState("5");
  const [remarks, setRemarks] = useState("");

  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await API.get("/employees");
      const data = Array.isArray(response.data) ? response.data : [];
      setEmployees(data);
      if (data.length > 0 && !employeeId) {
        setEmployeeId(data[0].id);
        setEmployeeName(data[0].name);
      }
    } catch (error) {
      console.log("Error loading employees:", error);
    }
  }, [employeeId]);

  const fetchAllocations = useCallback(async () => {
    try {
      const response = await API.get(`/leaves/allocations?year=${year}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setAllocations(data);
    } catch (error) {
      console.log("Error loading allocations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year]);

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
      fetchAllocations();
    }
  }, [isAdmin, fetchEmployees, fetchAllocations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllocations();
  };

  const handleSaveAllocation = async () => {
    if (!employeeId) {
      Alert.alert("Required", "Please select an employee.");
      return;
    }

    const pQuota = parseFloat(paidQuota);
    const sQuota = parseFloat(sickQuota);
    const wQuota = parseFloat(wfhQuota);

    if (isNaN(pQuota) || pQuota < 0 || isNaN(sQuota) || sQuota < 0 || isNaN(wQuota) || wQuota < 0) {
      Alert.alert("Invalid Input", "Please enter valid non-negative numbers for all leave quotas.");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/leaves/allocations", {
        employeeId,
        employeeName,
        year,
        quarter,
        paidLeaveQuota: pQuota,
        sickLeaveQuota: sQuota,
        wfhQuota: wQuota,
        remarks: remarks.trim() || `Q${quarter} ${year} Credit`,
      });

      Alert.alert(
        "Allocation Saved",
        `Q${quarter} ${year} leave balance successfully credited for ${employeeName}.`
      );
      setRemarks("");
      fetchAllocations();
    } catch (error: any) {
      console.log("Error saving allocation:", error);
      const msg = error?.response?.data?.message || "Failed to save allocation.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAllocation = (item: AllocationItem) => {
    Alert.alert(
      "Confirm Delete",
      `Delete Q${item.quarter} ${item.year} allocation for ${item.employeeName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/leaves/allocations/${item.id}`);
              fetchAllocations();
            } catch (error) {
              console.log("Error deleting allocation:", error);
              Alert.alert("Error", "Failed to delete allocation.");
            }
          },
        },
      ]
    );
  };

  if (!isAdmin) {
    return (
      <ScreenWrapper>
        <AppHeader title="Access Denied" showBack />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>Administrator Access Required</Text>
          <Text style={styles.emptySubtitle}>
            Only administrators can configure and allocate employee leave quotas.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Quarterly Leave Allocations"
        subtitle="Manage dynamic quotas per employee"
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.primary}
          />
        }
      >
        {/* Allocation Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>➕ Allocate Quarterly Quota</Text>
          <Text style={styles.cardSub}>
            Credit Paid, Sick, and WFH days to employee quarterly allowances
          </Text>

          {/* Employee Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Employee</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={employeeId}
                onValueChange={(val) => {
                  setEmployeeId(val);
                  const emp = employees.find((e) => e.id === val);
                  if (emp) setEmployeeName(emp.name);
                }}
              >
                {employees.map((emp) => (
                  <Picker.Item
                    key={emp.id}
                    label={`${emp.name} (${emp.department || "General"})`}
                    value={emp.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Year & Quarter Selectors */}
          <View style={styles.row}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.fieldLabel}>Year</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={year}
                  onValueChange={(val) => setYear(val)}
                >
                  {YEARS.map((y) => (
                    <Picker.Item key={y} label={y.toString()} value={y} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={[styles.fieldContainer, { flex: 1.4 }]}>
              <Text style={styles.fieldLabel}>Quarter</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={quarter}
                  onValueChange={(val) => setQuarter(val)}
                >
                  {QUARTERS.map((q) => (
                    <Picker.Item key={q.value} label={q.label} value={q.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Leave Quota Days Inputs */}
          <View style={styles.row}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 6 }]}>
              <CustomInput
                label="Paid (Days)"
                value={paidQuota}
                onChangeText={setPaidQuota}
                keyboardType="numeric"
                placeholder="3"
                required
              />
            </View>

            <View style={[styles.fieldContainer, { flex: 1, marginRight: 6 }]}>
              <CustomInput
                label="Sick (Days)"
                value={sickQuota}
                onChangeText={setSickQuota}
                keyboardType="numeric"
                placeholder="2"
                required
              />
            </View>

            <View style={[styles.fieldContainer, { flex: 1 }]}>
              <CustomInput
                label="WFH (Days)"
                value={wfhQuota}
                onChangeText={setWfhQuota}
                keyboardType="numeric"
                placeholder="5"
                required
              />
            </View>
          </View>

          {/* Remarks */}
          <CustomInput
            label="Remarks (Optional)"
            placeholder="e.g. Q1 annual credit"
            value={remarks}
            onChangeText={setRemarks}
          />

          <CustomButton
            title="Save Allocation"
            onPress={handleSaveAllocation}
            loading={submitting}
            style={styles.saveBtn}
          />
        </View>

        {/* Existing Allocations List Section */}
        <View style={styles.listSectionHeader}>
          <Text style={styles.sectionTitle}>
            Allocations History ({year})
          </Text>
          <Text style={styles.sectionBadge}>
            {allocations.length} records
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={AppColors.primary}
            style={styles.loader}
          />
        ) : allocations.length === 0 ? (
          <EmptyState
            icon="⚖️"
            title="No Allocations Yet"
            message={`No quarterly leave quotas have been allocated for ${year}.`}
          />
        ) : (
          allocations.map((item) => (
            <View key={item.id} style={styles.allocCard}>
              <View style={styles.allocCardHeader}>
                <View>
                  <Text style={styles.allocEmpName}>{item.employeeName}</Text>
                  <Text style={styles.allocQuarter}>
                    Quarter {item.quarter} ({item.year})
                  </Text>
                </View>
                <View style={styles.quarterBadge}>
                  <Text style={styles.quarterBadgeText}>Q{item.quarter}</Text>
                </View>
              </View>

              <View style={styles.allocPillsRow}>
                <View style={[styles.allocPill, { backgroundColor: AppColors.primaryLight }]}>
                  <Text style={styles.allocPillLabel}>Paid</Text>
                  <Text style={[styles.allocPillValue, { color: AppColors.primaryDark }]}>
                    {item.paidLeaveQuota}d
                  </Text>
                </View>

                <View style={[styles.allocPill, { backgroundColor: AppColors.warningLight }]}>
                  <Text style={styles.allocPillLabel}>Sick</Text>
                  <Text style={[styles.allocPillValue, { color: AppColors.warning }]}>
                    {item.sickLeaveQuota}d
                  </Text>
                </View>

                <View style={[styles.allocPill, { backgroundColor: AppColors.successLight }]}>
                  <Text style={styles.allocPillLabel}>WFH</Text>
                  <Text style={[styles.allocPillValue, { color: AppColors.success }]}>
                    {item.wfhQuota}d
                  </Text>
                </View>
              </View>

              <View style={styles.allocFooter}>
                <Text style={styles.allocRemarks} numberOfLines={1}>
                  {item.remarks || `Q${item.quarter} allowance credit`}
                </Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteAllocation(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 20,
    ...AppShadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textSecondary,
    marginBottom: 6,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: AppColors.borderStrong,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surface,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveBtn: {
    marginTop: 8,
  },
  listSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },
  sectionBadge: {
    fontSize: 12,
    color: AppColors.textMuted,
    fontWeight: "600",
  },
  loader: {
    marginVertical: 20,
  },
  allocCard: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: 10,
    ...AppShadows.subtle,
  },
  allocCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  allocEmpName: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
  },
  allocQuarter: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  quarterBadge: {
    backgroundColor: AppColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: AppRadius.sm,
  },
  quarterBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.primaryDark,
  },
  allocPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  allocPill: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: AppRadius.md,
    alignItems: "center",
  },
  allocPillLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: AppColors.textSecondary,
    marginBottom: 2,
  },
  allocPillValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  allocFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 8,
  },
  allocRemarks: {
    fontSize: 12,
    color: AppColors.textMuted,
    fontStyle: "italic",
    flex: 1,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: AppColors.dangerLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: AppRadius.sm,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.danger,
  },
});
