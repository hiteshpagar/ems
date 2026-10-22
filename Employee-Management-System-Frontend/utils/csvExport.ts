import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";

/**
 * Escapes a single CSV value to conform to RFC 4180 standard.
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val);
  // If value contains comma, quotes, or newline, escape double quotes and wrap in quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Converts headers and rows to standard CSV string content.
 */
export function buildCsvString(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const headerLine = headers.map(escapeCsvValue).join(",");
  const rowLines = rows.map((row) => row.map(escapeCsvValue).join(","));
  return [headerLine, ...rowLines].join("\r\n");
}

/**
 * Exports data to a CSV file across Web, Android, and iOS.
 */
export async function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): Promise<void> {
  try {
    const csvContent = "\uFEFF" + buildCsvString(headers, rows); // prepend UTF-8 BOM for Excel compatibility

    if (Platform.OS === "web") {
      // Browser: Download file via Blob and anchor tag
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // Native Mobile (iOS / Android)
    const normalizedName = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    let targetUri = "";

    try {
      // Modern Expo SDK 54+ File & Paths API
      const file = new FileSystem.File(FileSystem.Paths.cache, normalizedName);
      file.create({ overwrite: true });
      file.write(csvContent);
      targetUri = file.uri;
    } catch {
      // Fallback for environments with legacy API
      const cacheDir = (FileSystem as any).cacheDirectory ?? "";
      targetUri = `${cacheDir}${normalizedName}`;
      if (typeof (FileSystem as any).writeAsStringAsync === "function") {
        await (FileSystem as any).writeAsStringAsync(targetUri, csvContent);
      }
    }

    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable && targetUri) {
      await Sharing.shareAsync(targetUri, {
        mimeType: "text/csv",
        dialogTitle: `Export ${normalizedName}`,
        UTI: "public.comma-separated-values-text",
      });
    } else {
      Alert.alert("Success", `CSV exported to: ${targetUri}`);
    }
  } catch (error: any) {
    console.log("Error exporting CSV:", error);
    Alert.alert("Export Error", error?.message || "Failed to export data to CSV.");
  }
}

/**
 * Exports attendance records to CSV.
 */
export async function exportAttendanceCsv(records: any[]): Promise<void> {
  const headers = [
    "Record ID",
    "Employee ID",
    "Employee Name",
    "Date",
    "Check-In Time",
    "Check-Out Time",
    "Total Hours",
    "Status",
    "Remarks",
  ];

  const rows = records.map((r) => [
    r.id ?? "",
    r.employeeId ?? "",
    r.employeeName ?? "",
    r.date ?? "",
    r.checkInTime ?? "",
    r.checkOutTime ?? "",
    r.totalHours ?? "",
    r.status ?? "",
    r.remarks ?? "",
  ]);

  const timestamp = new Date().toISOString().slice(0, 10);
  await exportToCsv(`attendance_report_${timestamp}.csv`, headers, rows);
}

/**
 * Exports leave requests to CSV.
 */
export async function exportLeavesCsv(records: any[]): Promise<void> {
  const headers = [
    "Leave ID",
    "Employee ID",
    "Employee Name",
    "Leave Type",
    "Start Date",
    "End Date",
    "Status",
    "Reason",
    "Rejection Reason",
  ];

  const rows = records.map((l) => [
    l.id ?? "",
    l.employeeId ?? "",
    l.employeeName ?? "",
    l.leaveType ?? "",
    l.startDate ?? "",
    l.endDate ?? "",
    l.status ?? "",
    l.reason ?? "",
    l.rejectionReason ?? "",
  ]);

  const timestamp = new Date().toISOString().slice(0, 10);
  await exportToCsv(`leave_requests_${timestamp}.csv`, headers, rows);
}

/**
 * Exports payroll payslips to CSV.
 */
export async function exportPayrollCsv(records: any[]): Promise<void> {
  const headers = [
    "Payslip ID",
    "Employee ID",
    "Employee Name",
    "Email",
    "Department",
    "Designation",
    "Payroll Month",
    "Basic Salary (INR)",
    "Total Allowances (INR)",
    "Gross Salary (INR)",
    "PF (INR)",
    "Professional Tax (INR)",
    "Income Tax (INR)",
    "Other Deductions (INR)",
    "Absence Deduction (INR)",
    "Total Deductions (INR)",
    "Net Salary (INR)",
    "Unpaid Days",
  ];

  const rows = records.map((p) => [
    p.id ?? "",
    p.employeeId ?? "",
    p.employeeName ?? "",
    p.employeeEmail ?? "",
    p.department ?? "",
    p.designation ?? "",
    p.payrollMonth ?? "",
    p.basicSalary ?? 0,
    p.totalAllowances ?? 0,
    p.grossSalary ?? 0,
    p.providentFund ?? 0,
    p.professionalTax ?? 0,
    p.incomeTax ?? 0,
    p.otherDeductions ?? 0,
    p.absenceDeduction ?? 0,
    p.totalDeductions ?? 0,
    p.netSalary ?? 0,
    p.unpaidDays ?? 0,
  ]);

  const timestamp = new Date().toISOString().slice(0, 10);
  await exportToCsv(`payroll_report_${timestamp}.csv`, headers, rows);
}

/**
 * Exports audit logs to CSV.
 */
export async function exportAuditLogsCsv(records: any[]): Promise<void> {
  const headers = [
    "Log ID",
    "Timestamp",
    "Action",
    "Module",
    "Target ID",
    "Performed By",
    "Description",
    "IP Address",
  ];

  const rows = records.map((log) => [
    log.id ?? "",
    log.timestamp ?? "",
    log.action ?? "",
    log.module ?? "",
    log.targetId ?? "",
    log.performedBy ?? "",
    log.description ?? "",
    log.ipAddress ?? "",
  ]);

  const timestamp = new Date().toISOString().slice(0, 10);
  await exportToCsv(`audit_logs_${timestamp}.csv`, headers, rows);
}
