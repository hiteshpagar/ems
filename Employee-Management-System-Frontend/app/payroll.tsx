import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useState } from "react";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

type Employee = {
  id: number;
  name: string;
  department: string;
  salary: number;
};

type Payslip = {
  id: number;
  employeeName: string;
  payrollMonth: string;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  unpaidDays: number;
};

const money = (amount?: number) =>
  `₹ ${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

const currentMonth = new Date().toISOString().slice(0, 7);

const structureFields = [
  "basicSalary",
  "houseRentAllowance",
  "transportAllowance",
  "otherAllowance",
  "providentFund",
  "professionalTax",
  "incomeTax",
  "otherDeductions",
];

export default function PayrollScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [month, setMonth] = useState(currentMonth);
  const [form, setForm] = useState<Record<string, string>>({
    basicSalary: "",
    houseRentAllowance: "",
    transportAllowance: "",
    otherAllowance: "",
    providentFund: "",
    professionalTax: "",
    incomeTax: "",
    otherDeductions: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selected = useMemo(
    () => employees.find((emp) => emp.id === employeeId),
    [employees, employeeId]
  );

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const load = async () => {
    try {
      const [employeesResponse, payslipsResponse] = await Promise.all([
        API.get<Employee[]>("/employees"),
        API.get<Payslip[]>("/payroll/payslips"),
      ]);
      setEmployees(employeesResponse.data || []);
      setPayslips(payslipsResponse.data || []);
      setEmployeeId((value) => value ?? employeesResponse.data[0]?.id ?? null);
    } catch {
      Alert.alert("Error", "Could not load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!employeeId) return;
    API.get(`/payroll/salary-structures/${employeeId}`)
      .then(({ data }) => {
        if (data) {
          setForm(
            Object.fromEntries(
              structureFields.map((key) => [key, String(data[key] ?? 0)])
            )
          );
        } else {
          setForm((prev) => ({
            ...prev,
            basicSalary: String(selected?.salary ?? 0),
          }));
        }
      })
      .catch(() => undefined);
  }, [employeeId, selected?.salary]);

  const totalEarnings =
    Number(form.basicSalary || 0) +
    Number(form.houseRentAllowance || 0) +
    Number(form.transportAllowance || 0) +
    Number(form.otherAllowance || 0);

  const totalDeductions =
    Number(form.providentFund || 0) +
    Number(form.professionalTax || 0) +
    Number(form.incomeTax || 0) +
    Number(form.otherDeductions || 0);

  const calculatedNet = Math.max(0, totalEarnings - totalDeductions);

  const saveStructure = async () => {
    if (!employeeId) return;
    setSaving(true);
    try {
      await API.post("/payroll/salary-structures", {
        employeeId,
        ...Object.fromEntries(
          Object.entries(form).map(([key, value]) => [key, Number(value || 0)])
        ),
      });
      Alert.alert("Success", "Salary structure saved successfully.");
    } catch {
      Alert.alert("Error", "Could not save the salary structure");
    } finally {
      setSaving(false);
    }
  };

  const generate = async () => {
    if (!/^\d{4}-\d{2}$/.test(month.trim())) {
      Alert.alert("Invalid Month", "Use YYYY-MM format, for example 2026-08.");
      return;
    }
    setGenerating(true);
    try {
      const response = await API.post(`/payroll/generate?month=${month.trim()}`);
      setPayslips(response.data || []);
      Alert.alert(
        "Payroll Generated",
        `${response.data.length} payslips are ready for ${month}.`
      );
    } catch {
      Alert.alert(
        "Error",
        "Could not generate payroll. Check the month and try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Payroll" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading payroll data...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Payroll & Payslips"
        subtitle="Manage salary structures and payroll cycles"
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Salary Structure Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Salary Structure</Text>

          <View style={styles.pickerField}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Select Employee</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={employeeId} onValueChange={setEmployeeId}>
                {employees.map((emp) => (
                  <Picker.Item
                    key={emp.id}
                    label={`${emp.name} · ${emp.department || "No Dept"}`}
                    value={emp.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Earnings */}
          <Text style={styles.subHeading}>Earnings</Text>
          <Field
            label="Basic Salary"
            value={form.basicSalary}
            onChange={(v) => update("basicSalary", v)}
          />
          <Field
            label="House Rent Allowance (HRA)"
            value={form.houseRentAllowance}
            onChange={(v) => update("houseRentAllowance", v)}
          />
          <Field
            label="Transport Allowance"
            value={form.transportAllowance}
            onChange={(v) => update("transportAllowance", v)}
          />
          <Field
            label="Other Allowance"
            value={form.otherAllowance}
            onChange={(v) => update("otherAllowance", v)}
          />

          {/* Deductions */}
          <Text style={[styles.subHeading, { marginTop: 12 }]}>Deductions</Text>
          <Field
            label="Provident Fund (PF)"
            value={form.providentFund}
            onChange={(v) => update("providentFund", v)}
          />
          <Field
            label="Professional Tax"
            value={form.professionalTax}
            onChange={(v) => update("professionalTax", v)}
          />
          <Field
            label="Income Tax (TDS)"
            value={form.incomeTax}
            onChange={(v) => update("incomeTax", v)}
          />
          <Field
            label="Other Deductions"
            value={form.otherDeductions}
            onChange={(v) => update("otherDeductions", v)}
          />

          {/* Net Salary Preview Banner */}
          <View style={styles.netSummaryBanner}>
            <Text style={styles.netBannerLabel}>Estimated Net Salary</Text>
            <Text style={styles.netBannerAmount}>{money(calculatedNet)}</Text>
          </View>

          <CustomButton
            title="Save Salary Structure"
            onPress={saveStructure}
            loading={saving}
            style={styles.actionBtn}
          />
        </View>

        {/* Run Payroll Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Run Monthly Payroll</Text>

          <CustomInput
            label="Payroll Month (YYYY-MM)"
            value={month}
            onChangeText={setMonth}
            placeholder="2026-08"
            helperText="Absent attendance records automatically adjust salary calculation."
          />

          <CustomButton
            title="Generate Payslips"
            onPress={generate}
            loading={generating}
            variant="success"
            style={styles.actionBtn}
          />
        </View>

        {/* Generated Payslips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Generated Payslips</Text>
          {payslips.length === 0 ? (
            <View style={styles.emptyPayslips}>
              <Text style={styles.emptyPayslipsText}>
                No payslips generated yet for this period.
              </Text>
            </View>
          ) : (
            payslips.map((slip) => (
              <View key={slip.id} style={styles.slipCard}>
                <View style={styles.slipLeft}>
                  <Text style={styles.slipName}>{slip.employeeName}</Text>
                  <Text style={styles.slipMonth}>
                    📅 {slip.payrollMonth} · {slip.unpaidDays} unpaid day(s)
                  </Text>
                </View>

                <View style={styles.slipRight}>
                  <Text style={styles.slipNet}>{money(slip.netSalary)}</Text>
                  <Text style={styles.slipGross}>
                    Gross {money(slip.grossSalary)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <CustomInput
      label={label}
      value={value}
      onChangeText={onChange}
      keyboardType="decimal-pad"
      placeholder="0"
      containerStyle={{ marginBottom: 10 }}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 14,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pickerField: {
    marginBottom: 16,
  },
  labelRow: {
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: AppColors.borderStrong,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surface,
    overflow: "hidden",
  },
  netSummaryBanner: {
    backgroundColor: AppColors.primary,
    borderRadius: AppRadius.md,
    padding: 14,
    alignItems: "center",
    marginVertical: 12,
  },
  netBannerLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
  netBannerAmount: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  actionBtn: {
    marginTop: 4,
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 12,
  },
  emptyPayslips: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  emptyPayslipsText: {
    color: AppColors.textMuted,
    fontSize: 13,
  },
  slipCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  slipLeft: {
    flex: 1,
  },
  slipName: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
  },
  slipMonth: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  slipRight: {
    alignItems: "flex-end",
  },
  slipNet: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.success,
  },
  slipGross: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginTop: 2,
  },
});
