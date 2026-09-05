import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import EmptyState from "../components/EmptyState";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

const money = (amount?: number) =>
  `₹ ${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

export default function PayslipsScreen() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const response = await API.get("/payroll/payslips/me");
      setPayslips(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Error loading payslips:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="My Payslips" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading payslip records...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="My Payslips"
        subtitle={`${payslips.length} monthly statements`}
        showBack
      />

      <View style={styles.container}>
        <FlatList
          data={payslips}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={AppColors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="💵"
              title="No Payslips Yet"
              message="No monthly salary statements have been generated for your account yet."
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.monthText}>
                    📅 {item.payrollMonth}
                  </Text>
                  <Text style={styles.captionText}>Net Take Home</Text>
                </View>
                <Text style={styles.netAmount}>{money(item.netSalary)}</Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionHeader}>Earnings</Text>
              <BreakdownLine label="Basic Salary" value={item.basicSalary} />
              <BreakdownLine label="Allowances" value={item.totalAllowances} />
              <BreakdownLine label="Gross Salary" value={item.grossSalary} bold />

              <View style={styles.divider} />

              <Text style={styles.sectionHeader}>Deductions</Text>
              <BreakdownLine
                label="Provident Fund (PF)"
                value={item.providentFund}
                negative
              />
              <BreakdownLine
                label="Professional Tax"
                value={item.professionalTax}
                negative
              />
              <BreakdownLine
                label="Income Tax (TDS)"
                value={item.incomeTax}
                negative
              />
              {item.otherDeductions ? (
                <BreakdownLine
                  label="Other Deductions"
                  value={item.otherDeductions}
                  negative
                />
              ) : null}
              {item.unpaidDays ? (
                <BreakdownLine
                  label={`Absence Deduction (${item.unpaidDays} day${
                    item.unpaidDays > 1 ? "s" : ""
                  })`}
                  value={item.absenceDeduction}
                  negative
                />
              ) : null}
              <BreakdownLine
                label="Total Deductions"
                value={item.totalDeductions}
                negative
                bold
              />
            </View>
          )}
        />
      </View>
    </ScreenWrapper>
  );
}

function BreakdownLine({
  label,
  value,
  negative = false,
  bold = false,
}: {
  label: string;
  value: number;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <View style={styles.line}>
      <Text style={[styles.lineLabel, bold && styles.boldText]}>{label}</Text>
      <Text
        style={[
          styles.lineValue,
          negative && styles.negativeValue,
          bold && styles.boldText,
        ]}
      >
        {negative ? "− " : ""}
        {money(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthText: {
    fontSize: 17,
    fontWeight: "700",
    color: AppColors.text,
  },
  captionText: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  netAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: AppColors.success,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  lineLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  lineValue: {
    fontSize: 13,
    fontWeight: "500",
    color: AppColors.text,
  },
  negativeValue: {
    color: AppColors.danger,
  },
  boldText: {
    fontWeight: "700",
    color: AppColors.text,
  },
});
