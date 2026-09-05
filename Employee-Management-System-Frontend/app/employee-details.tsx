import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";
import CustomButton from "../components/CustomButton";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

export default function EmployeeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployee = async () => {
    try {
      const response = await API.get(`/employees/${id}`);
      setEmployee(response.data);
    } catch (error) {
      console.log("Error fetching employee:", error);
      Alert.alert("Error", "Could not load employee details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Employee",
      `Are you sure you want to delete ${employee?.name || "this employee"}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await API.delete(`/employees/${id}`);
              Alert.alert("Success", "Employee deleted successfully.", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.log("Error deleting employee:", error);
              Alert.alert("Error", "Failed to delete employee.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Employee Details" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!employee) {
    return (
      <ScreenWrapper>
        <AppHeader title="Employee Details" showBack />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Employee not found.</Text>
          <CustomButton
            title="Go Back"
            onPress={() => router.back()}
            variant="secondary"
            style={{ marginTop: 16 }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader title="Employee Details" showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {employee.photoUrl ? (
            <Image
              source={{ uri: employee.photoUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {employee.name?.charAt(0)?.toUpperCase() || "E"}
              </Text>
            </View>
          )}

          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.designation}>
            {employee.designation || employee.department || "Team Member"}
          </Text>

          <View style={styles.badgeWrapper}>
            <StatusBadge status={employee.status || "Active"} showDot />
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <DetailRow label="Full Name" value={employee.name} />
          <View style={styles.divider} />
          <DetailRow label="Email Address" value={employee.email} />
          <View style={styles.divider} />
          <DetailRow label="Employee ID" value={`EMP-${employee.id}`} />
        </View>

        {/* Employment Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Employment Information</Text>

          <DetailRow label="Department" value={employee.department || "—"} />
          <View style={styles.divider} />
          <DetailRow label="Designation" value={employee.designation || "—"} />
          <View style={styles.divider} />
          <DetailRow
            label="Basic Monthly Salary"
            value={
              employee.salary
                ? `₹ ${Number(employee.salary).toLocaleString("en-IN")}`
                : "—"
            }
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CustomButton
            title="Edit Employee"
            onPress={() => router.push(`/edit-employee?id=${employee.id}`)}
            style={styles.editButton}
          />

          <CustomButton
            title="Delete Employee"
            onPress={handleDelete}
            variant="danger"
            loading={deleting}
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: AppColors.danger,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.card,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 14,
    backgroundColor: AppColors.surfaceMuted,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: AppColors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.text,
    textAlign: "center",
  },
  designation: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  badgeWrapper: {
    marginTop: 12,
  },
  infoCard: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: AppColors.textMuted,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 4,
  },
  actionButtons: {
    marginTop: 8,
    gap: 10,
  },
  editButton: {},
  deleteButton: {},
});
