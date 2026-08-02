import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import CustomInput from "../components/CustomInput";

type Employee = { id: number; name: string; department: string; salary: number };
type Payslip = { id: number; employeeName: string; payrollMonth: string; grossSalary: number; totalDeductions: number; netSalary: number; unpaidDays: number };
const money = (amount?: number) => `₹ ${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const currentMonth = new Date().toISOString().slice(0, 7);
const structureFields = ["basicSalary", "houseRentAllowance", "transportAllowance", "otherAllowance", "providentFund", "professionalTax", "incomeTax", "otherDeductions"];

export default function PayrollScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [month, setMonth] = useState(currentMonth);
  const [form, setForm] = useState<Record<string, string>>({ basicSalary: "", houseRentAllowance: "", transportAllowance: "", otherAllowance: "", providentFund: "", professionalTax: "", incomeTax: "", otherDeductions: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selected = useMemo(() => employees.find((employee) => employee.id === employeeId), [employees, employeeId]);
  const update = (key: string, value: string) => setForm((previous) => ({ ...previous, [key]: value }));
  const load = async () => {
    try {
      const [employeesResponse, payslipsResponse] = await Promise.all([API.get<Employee[]>("/employees"), API.get<Payslip[]>("/payroll/payslips")]);
      setEmployees(employeesResponse.data); setPayslips(payslipsResponse.data); setEmployeeId((value) => value ?? employeesResponse.data[0]?.id ?? null);
    } catch { Alert.alert("Error", "Could not load payroll data"); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!employeeId) return;
    API.get(`/payroll/salary-structures/${employeeId}`).then(({ data }) => {
      if (data) setForm(Object.fromEntries(structureFields.map((key) => [key, String(data[key] ?? 0)])));
      else setForm((previous) => ({ ...previous, basicSalary: String(selected?.salary ?? 0) }));
    }).catch(() => undefined);
  }, [employeeId, selected?.salary]);
  const saveStructure = async () => {
    if (!employeeId) return;
    setSaving(true);
    try { await API.post("/payroll/salary-structures", { employeeId, ...Object.fromEntries(Object.entries(form).map(([key, value]) => [key, Number(value || 0)])) }); Alert.alert("Saved", "Salary structure updated."); }
    catch { Alert.alert("Error", "Could not save the salary structure"); } finally { setSaving(false); }
  };
  const generate = async () => {
    if (!/^\d{4}-\d{2}$/.test(month)) { Alert.alert("Invalid month", "Use YYYY-MM, for example 2026-08."); return; }
    setSaving(true);
    try { const response = await API.post(`/payroll/generate?month=${month}`); setPayslips(response.data); Alert.alert("Payroll generated", `${response.data.length} payslips are ready for ${month}.`); }
    catch { Alert.alert("Error", "Could not generate payroll. Check the month and try again."); } finally { setSaving(false); }
  };
  if (loading) return <ScreenWrapper><View style={styles.loader}><ActivityIndicator size="large" color="#2F80ED" /></View></ScreenWrapper>;
  return <ScreenWrapper><ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <LinearGradient colors={["#0F2027", "#203A43", "#2C5364"]} style={styles.header}><Text style={styles.title}>Payroll</Text><Text style={styles.subtitle}>Salary structures, deductions and monthly payslips</Text></LinearGradient>
    <View style={styles.card}><Text style={styles.heading}>SALARY STRUCTURE</Text><Text style={styles.label}>Employee</Text><View style={styles.picker}><Picker selectedValue={employeeId} onValueChange={setEmployeeId}>{employees.map((employee) => <Picker.Item key={employee.id} label={`${employee.name} · ${employee.department}`} value={employee.id} />)}</Picker></View>
      <Text style={styles.section}>EARNINGS</Text><Field label="Basic salary" value={form.basicSalary} onChange={(v) => update("basicSalary", v)} /><Field label="House rent allowance" value={form.houseRentAllowance} onChange={(v) => update("houseRentAllowance", v)} /><Field label="Transport allowance" value={form.transportAllowance} onChange={(v) => update("transportAllowance", v)} /><Field label="Other allowance" value={form.otherAllowance} onChange={(v) => update("otherAllowance", v)} />
      <Text style={styles.section}>DEDUCTIONS</Text><Field label="Provident fund" value={form.providentFund} onChange={(v) => update("providentFund", v)} /><Field label="Professional tax" value={form.professionalTax} onChange={(v) => update("professionalTax", v)} /><Field label="Income tax" value={form.incomeTax} onChange={(v) => update("incomeTax", v)} /><Field label="Other deductions" value={form.otherDeductions} onChange={(v) => update("otherDeductions", v)} />
      <TouchableOpacity style={styles.primary} onPress={saveStructure} disabled={saving}><Text style={styles.primaryText}>{saving ? "Saving..." : "Save Salary Structure"}</Text></TouchableOpacity>
    </View>
    <View style={styles.card}><Text style={styles.heading}>RUN PAYROLL</Text><Text style={styles.label}>Payroll month (YYYY-MM)</Text><CustomInput value={month} onChangeText={setMonth} placeholder="2026-08" /><Text style={styles.hint}>Absent attendance records reduce pay by the daily gross rate. Generating again refreshes that month’s payslips.</Text><TouchableOpacity style={styles.generate} onPress={generate} disabled={saving}><Text style={styles.primaryText}>{saving ? "Generating..." : "Generate Payslips"}</Text></TouchableOpacity></View>
    <Text style={styles.listHeading}>RECENT PAYSLIPS</Text>{payslips.length === 0 ? <Text style={styles.empty}>No payslips generated yet.</Text> : payslips.map((slip) => <View key={slip.id} style={styles.slip}><View><Text style={styles.name}>{slip.employeeName}</Text><Text style={styles.muted}>{slip.payrollMonth} · {slip.unpaidDays} unpaid day(s)</Text></View><View style={styles.amounts}><Text style={styles.net}>{money(slip.netSalary)}</Text><Text style={styles.muted}>Gross {money(slip.grossSalary)} · Ded. {money(slip.totalDeductions)}</Text></View></View>)}</ScrollView></ScreenWrapper>;
}
function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <><Text style={styles.label}>{label}</Text><CustomInput value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" /></>; }
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#F4F6FB" }, content: { padding: 20, paddingBottom: 48 }, loader: { flex: 1, alignItems: "center", justifyContent: "center" }, header: { padding: 24, borderRadius: 20, marginBottom: 20 }, title: { color: "#fff", fontWeight: "bold", fontSize: 30 }, subtitle: { color: "rgba(255,255,255,0.72)", marginTop: 6 }, card: { backgroundColor: "#fff", borderRadius: 18, padding: 18, marginBottom: 20, elevation: 2 }, heading: { fontSize: 12, letterSpacing: 1.1, fontWeight: "700", color: "#64748B", marginBottom: 14 }, section: { marginTop: 10, marginBottom: 5, color: "#2F80ED", fontSize: 13, fontWeight: "bold" }, label: { color: "#475569", fontSize: 13, fontWeight: "600", marginBottom: 6 }, picker: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, overflow: "hidden", marginBottom: 8 }, primary: { backgroundColor: "#2F80ED", padding: 15, borderRadius: 12, alignItems: "center" }, generate: { backgroundColor: "#16A085", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 12 }, primaryText: { color: "#fff", fontWeight: "700", fontSize: 15 }, hint: { color: "#64748B", fontSize: 12, lineHeight: 17 }, listHeading: { fontWeight: "700", color: "#64748B", letterSpacing: 1.1, fontSize: 12, marginBottom: 12 }, slip: { backgroundColor: "#fff", padding: 16, borderRadius: 14, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" }, name: { fontWeight: "700", fontSize: 16 }, muted: { fontSize: 12, color: "#64748B", marginTop: 4 }, amounts: { alignItems: "flex-end" }, net: { color: "#16A085", fontWeight: "bold", fontSize: 16 }, empty: { color: "#64748B", textAlign: "center", marginTop: 20 } });
