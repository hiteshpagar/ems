import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";

export interface PayslipData {
  id?: number;
  employeeId?: number;
  employeeName: string;
  employeeEmail?: string;
  department?: string;
  designation?: string;
  payrollMonth: string;
  basicSalary?: number;
  totalAllowances?: number;
  grossSalary?: number;
  providentFund?: number;
  professionalTax?: number;
  incomeTax?: number;
  otherDeductions?: number;
  absenceDeduction?: number;
  totalDeductions?: number;
  netSalary?: number;
  unpaidDays?: number;
  generatedAt?: string;
}

const formatCurrency = (amount?: number) => {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatMonthYear = (monthStr: string) => {
  if (!monthStr) return "";
  try {
    const parts = monthStr.split("-");
    if (parts.length === 2) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const date = new Date(parseInt(year, 10), monthIndex, 1);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  } catch {
    // fallback
  }
  return monthStr;
};

export function generatePayslipHtml(slip: PayslipData): string {
  const monthTitle = formatMonthYear(slip.payrollMonth);
  const generatedDate = slip.generatedAt
    ? new Date(slip.generatedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payslip - ${slip.employeeName} - ${slip.payrollMonth}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      padding: 30px;
      color: #1e293b;
      background-color: #ffffff;
      font-size: 13px;
      line-height: 1.5;
    }
    .payslip-container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 24px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .company-title {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .company-subtitle {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .payslip-badge {
      text-align: right;
    }
    .payslip-title {
      font-size: 16px;
      font-weight: 700;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .payslip-month {
      font-size: 13px;
      color: #475569;
      font-weight: 600;
      margin-top: 2px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px 16px;
      margin-bottom: 24px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #e2e8f0;
      padding-bottom: 4px;
    }
    .info-label {
      color: #64748b;
      font-weight: 500;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
    }

    .tables-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .salary-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }
    .salary-table th {
      background-color: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 8px 12px;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
    }
    .salary-table th.amount, .salary-table td.amount {
      text-align: right;
    }
    .salary-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .salary-table tr:last-child td {
      border-bottom: none;
    }
    .table-total {
      background: #f8fafc;
      font-weight: 700;
      border-top: 1px solid #cbd5e1 !important;
      color: #0f172a !important;
    }

    .net-box {
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      border-radius: 6px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .net-label {
      font-size: 14px;
      font-weight: 600;
      color: #1e40af;
    }
    .net-sub {
      font-size: 11px;
      color: #3b82f6;
      margin-top: 2px;
    }
    .net-amount {
      font-size: 22px;
      font-weight: 800;
      color: #1e3a8a;
    }

    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      color: #94a3b8;
      font-size: 11px;
    }
    .sign-box {
      text-align: center;
      width: 180px;
    }
    .sign-line {
      border-top: 1px solid #94a3b8;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="payslip-container">
    <div class="header">
      <div>
        <div class="company-title">EMS Enterprise</div>
        <div class="company-subtitle">Employee Management & Payroll Portal</div>
      </div>
      <div class="payslip-badge">
        <div class="payslip-title">Salary Statement</div>
        <div class="payslip-month">${monthTitle}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Employee ID:</span>
        <span class="info-value">#${slip.employeeId || slip.id || "N/A"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Department:</span>
        <span class="info-value">${slip.department || "General"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Employee Name:</span>
        <span class="info-value">${slip.employeeName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Designation:</span>
        <span class="info-value">${slip.designation || "Staff"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">${slip.employeeEmail || "N/A"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Unpaid / Absent Days:</span>
        <span class="info-value">${slip.unpaidDays ?? 0}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Pay Period:</span>
        <span class="info-value">${slip.payrollMonth}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Generated Date:</span>
        <span class="info-value">${generatedDate}</span>
      </div>
    </div>

    <div class="tables-container">
      <!-- Earnings -->
      <table class="salary-table">
        <thead>
          <tr>
            <th>Earnings</th>
            <th class="amount">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td class="amount">${formatCurrency(slip.basicSalary)}</td>
          </tr>
          <tr>
            <td>Total Allowances</td>
            <td class="amount">${formatCurrency(slip.totalAllowances)}</td>
          </tr>
          <tr class="table-total">
            <td>Gross Earnings</td>
            <td class="amount">${formatCurrency(slip.grossSalary)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Deductions -->
      <table class="salary-table">
        <thead>
          <tr>
            <th>Deductions</th>
            <th class="amount">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Provident Fund (PF)</td>
            <td class="amount">${formatCurrency(slip.providentFund)}</td>
          </tr>
          <tr>
            <td>Professional Tax</td>
            <td class="amount">${formatCurrency(slip.professionalTax)}</td>
          </tr>
          <tr>
            <td>Income Tax (TDS)</td>
            <td class="amount">${formatCurrency(slip.incomeTax)}</td>
          </tr>
          ${
            slip.otherDeductions && slip.otherDeductions > 0
              ? `<tr>
                  <td>Other Deductions</td>
                  <td class="amount">${formatCurrency(slip.otherDeductions)}</td>
                </tr>`
              : ""
          }
          ${
            slip.absenceDeduction && slip.absenceDeduction > 0
              ? `<tr>
                  <td>Absence Deduction</td>
                  <td class="amount">${formatCurrency(slip.absenceDeduction)}</td>
                </tr>`
              : ""
          }
          <tr class="table-total">
            <td>Total Deductions</td>
            <td class="amount">${formatCurrency(slip.totalDeductions)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="net-box">
      <div>
        <div class="net-label">NET TAKE-HOME SALARY</div>
        <div class="net-sub">Total Gross Earnings minus Total Deductions</div>
      </div>
      <div class="net-amount">₹ ${formatCurrency(slip.netSalary)}</div>
    </div>

    <div class="footer">
      <div>
        <div>This is a computer-generated salary slip and requires no physical signature.</div>
        <div style="margin-top: 3px;">Confidential &bull; Generated via EMS Portal on ${generatedDate}</div>
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <div>Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates and shares or prints the payslip as a PDF.
 */
export async function exportPayslipPdf(slip: PayslipData): Promise<void> {
  try {
    const html = generatePayslipHtml(slip);

    if (Platform.OS === "web") {
      // On web browser, Print directly triggers browser PDF save/print
      await Print.printAsync({ html });
      return;
    }

    // On iOS & Android: generate temporary PDF file and share
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: `Payslip_${slip.employeeName.replace(/\\s+/g, "_")}_${slip.payrollMonth}`,
      });
    } else {
      Alert.alert("Success", "Payslip generated successfully at: " + uri);
    }
  } catch (error: any) {
    console.log("Error generating payslip PDF:", error);
    Alert.alert(
      "Export Failed",
      error?.message || "An error occurred while generating the payslip PDF."
    );
  }
}
