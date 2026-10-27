import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  ArrowLeft,
  ChevronRight,
  Lock,
  LogOut,
  SquarePen,
} from "lucide-react-native";

import API from "../services/api";
import BottomNav from "../components/BottomNav";
import ScreenWrapper from "../components/ScreenWrapper";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { logout, userRole, userName, userEmail } = useContext(AuthContext);

  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isAdmin = userRole === "ADMIN";

  const fetchProfile = async () => {
    try {
      const response = await API.get("/profile");
      setProfile(response.data);
    } catch (error) {
      console.log("Error loading profile:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.dismissAll();
          router.replace("/login");
        },
      },
    ]);
  };

  const displayName = profile?.name || userName || "Administrator";
  const displayEmail = profile?.email || userEmail || "admin@example.com";
  const initial = displayName.charAt(0).toUpperCase();

  const roleLabel = isSuperAdmin
    ? "Super Administrator"
    : isAdmin
    ? "Administrator"
    : "Employee";

  const departmentLabel =
    profile?.department || (isSuperAdmin ? "Executive Board" : "—");
  const designationLabel =
    profile?.designation || (isSuperAdmin ? "Super Administrator" : "—");

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color={AppColors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.accent}
          />
        }
      >
        {/* Profile Avatar & Summary */}
        <View style={styles.profileSummaryBlock}>
          {profile?.photoUrl ? (
            <Image
              source={{ uri: profile.photoUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}

          <Text style={styles.fullName}>{displayName}</Text>
          <Text style={styles.roleSubtext}>{roleLabel}</Text>
          <Text style={styles.emailSubtext}>{displayEmail}</Text>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        {/* 1. Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <TouchableOpacity
              style={styles.editPillButton}
              onPress={() => router.push("/edit-profile")}
              activeOpacity={0.7}
            >
              <SquarePen
                size={12}
                color={AppColors.accent}
                strokeWidth={2.2}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.editPillText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <DetailRow label="Full Name" value={displayName} />
          <View style={styles.rowDivider} />
          <DetailRow label="Email Address" value={displayEmail} />
          <View style={styles.rowDivider} />
          <DetailRow label="Phone Number" value={profile?.phone || "—"} />
          <View style={styles.rowDivider} />
          {(profile as any)?.company?.name ? (
            <>
              <DetailRow label="Company" value={(profile as any).company.name} />
              <View style={styles.rowDivider} />
            </>
          ) : null}
          <DetailRow label="Department" value={departmentLabel} />
          <View style={styles.rowDivider} />
          <DetailRow label="Designation" value={designationLabel} />
          <View style={styles.rowDivider} />
          <DetailRow
            label="Monthly Salary"
            value={
              profile?.salary
                ? `₹ ${Number(profile.salary).toLocaleString("en-IN")}`
                : "—"
            }
          />
        </View>

        {/* 2. Account Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>

          <DetailRow
            label="Employee ID"
            value={profile?.employeeId || (profile?.id ? `EMP-${profile.id}` : "—")}
          />
          <View style={styles.rowDivider} />
          <DetailRow label="Role" value={roleLabel} />
          <View style={styles.rowDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Status</Text>
            <View style={styles.statusValueRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
          <View style={styles.rowDivider} />
          <DetailRow
            label="Last Login"
            value="Oct 24, 2026, 2:05 PM"
          />
        </View>

        {/* 3. Account Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>

          {/* Edit Profile Details */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/edit-profile")}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconContainer}>
                <SquarePen size={15} color="#D97706" strokeWidth={2.2} />
              </View>
              <Text style={styles.actionLabel}>Edit Profile Details</Text>
            </View>
            <ChevronRight
              size={18}
              color={AppColors.textMuted}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Reset / Change Password */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/forgot-password")}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconContainer}>
                <Lock size={15} color="#D97706" strokeWidth={2.2} />
              </View>
              <Text style={styles.actionLabel}>Reset / Change Password</Text>
            </View>
            <ChevronRight
              size={18}
              color={AppColors.textMuted}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut
            size={18}
            color={AppColors.accent}
            strokeWidth={2.2}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Persistent Bottom Nav Bar */}
      <BottomNav role={userRole} />
    </ScreenWrapper>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: AppColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: AppRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  profileSummaryBlock: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: AppColors.accent,
  },
  fullName: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textPrimary,
    textAlign: "center",
  },
  roleSubtext: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  emailSubtext: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.successBackground,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: AppRadius.pill,
    marginTop: 10,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: AppColors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.success,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  editPillButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppRadius.pill,
  },
  editPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.accent,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "400",
  },
  detailValue: {
    fontSize: 13,
    color: AppColors.textPrimary,
    fontWeight: "600",
    maxWidth: "58%",
    textAlign: "right",
  },
  statusValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowDivider: {
    height: 1,
    backgroundColor: AppColors.border,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.textPrimary,
  },
  signOutButton: {
    height: 48,
    borderRadius: AppRadius.md,
    borderWidth: 1.5,
    borderColor: AppColors.accent,
    backgroundColor: AppColors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.accent,
  },
});
