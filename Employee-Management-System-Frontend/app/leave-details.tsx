import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";
import CustomButton from "../components/CustomButton";
import { formatDate } from "../utils/date";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

export default function LeaveDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [leave, setLeave] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === "ADMIN";

  const fetchLeave = async () => {
    try {
      const response =
        isAdmin
          ? await API.get(`/leaves/${id}`)
          : await API.get(`/leaves/me/${id}`);

      setLeave(response.data);
    } catch (error) {
      console.log("Error loading leave:", error);
      Alert.alert("Error", "Could not load leave details.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      setUpdating(true);
      await API.put(`/leaves/${id}/status`, { status });

      Alert.alert("Success", `Leave status updated to ${status}.`, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log("Error updating leave status:", error);
      Alert.alert("Error", "Failed to update leave status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Leave Request",
      "Are you sure you want to delete this leave request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await API.delete(`/leaves/${id}`);
              Alert.alert("Success", "Leave request deleted successfully.", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.log("Error deleting leave:", error);
              Alert.alert("Error", "Failed to delete leave request.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchLeave();
  }, [id]);

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Leave Details" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading leave details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!leave) {
    return (
      <ScreenWrapper>
        <AppHeader title="Leave Details" showBack />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Leave request not found.</Text>
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
      <AppHeader title="Leave Details" showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerTitles}>
              {isAdmin && leave.employeeName ? (
                <Text style={styles.employeeName}>{leave.employeeName}</Text>
              ) : null}
              <Text style={styles.leaveType}>
                🏖️ {leave.leaveType || "Leave Request"}
              </Text>
            </View>
            <StatusBadge status={leave.status || "Pending"} showDot />
          </View>

          <View style={styles.durationBox}>
            <View style={styles.durationCol}>
              <Text style={styles.durationLabel}>From Date</Text>
              <Text style={styles.durationDate}>{formatDate(leave.startDate)}</Text>
            </View>

            <Text style={styles.durationArrow}>→</Text>

            <View style={styles.durationCol}>
              <Text style={styles.durationLabel}>To Date</Text>
              <Text style={styles.durationDate}>{formatDate(leave.endDate)}</Text>
            </View>
          </View>
        </View>

        {/* Reason Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Reason for Leave</Text>
          <Text style={styles.reasonText}>
            {leave.reason || "No reason specified."}
          </Text>
        </View>

        {/* Admin Action Buttons (Approve / Reject) */}
        {isAdmin && (leave.status || "").toLowerCase() === "pending" ? (
          <View style={styles.adminActionRow}>
            <CustomButton
              title="Approve"
              onPress={() => updateStatus("Approved")}
              variant="success"
              loading={updating}
              style={styles.adminBtn}
            />
            <CustomButton
              title="Reject"
              onPress={() => updateStatus("Rejected")}
              variant="danger"
              loading={updating}
              style={styles.adminBtn}
            />
          </View>
        ) : null}

        {/* Delete Action */}
        <CustomButton
          title="Delete Request"
          onPress={handleDelete}
          variant="outline"
          loading={deleting}
          style={styles.deleteBtn}
        />
      </ScrollView>
    </ScreenWrapper>
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
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitles: {
    flex: 1,
    marginRight: 10,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 4,
  },
  leaveType: {
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  durationBox: {
    flexDirection: "row",
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: AppRadius.md,
    padding: 14,
    alignItems: "center",
    justifyContent: "space-between",
  },
  durationCol: {
    flex: 1,
  },
  durationLabel: {
    fontSize: 11,
    color: AppColors.textMuted,
    fontWeight: "500",
    marginBottom: 2,
  },
  durationDate: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
  },
  durationArrow: {
    fontSize: 18,
    color: AppColors.textMuted,
    marginHorizontal: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 10,
  },
  reasonText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 22,
  },
  adminActionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  adminBtn: {
    flex: 1,
  },
  deleteBtn: {
    marginTop: 4,
  },
});
