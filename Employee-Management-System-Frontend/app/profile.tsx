import { useContext, useEffect, useState } from "react";
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

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";
import CustomButton from "../components/CustomButton";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { logout, userRole } = useContext(AuthContext);

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

  useEffect(() => {
    fetchProfile();
  }, []);

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

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="My Profile" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader title="My Profile" showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.primary}
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {profile?.photoUrl ? (
            <Image
              source={{ uri: profile.photoUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}

          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.designation}>
            {profile?.designation || profile?.department || "Team Member"}
          </Text>
          <Text style={styles.emailText}>{profile?.email}</Text>

          <View style={styles.badgeWrapper}>
            <StatusBadge status="Active" showDot />
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <DetailRow label="Full Name" value={profile?.name || "—"} />
          <View style={styles.divider} />
          <DetailRow label="Email Address" value={profile?.email || "—"} />
          <View style={styles.divider} />
          <DetailRow label="Department" value={profile?.department || "—"} />
          {profile?.designation ? (
            <>
              <View style={styles.divider} />
              <DetailRow label="Designation" value={profile.designation} />
            </>
          ) : null}
          <View style={styles.divider} />
          <DetailRow
            label="Monthly Salary"
            value={
              profile?.salary
                ? `₹ ${Number(profile.salary).toLocaleString("en-IN")}`
                : "—"
            }
          />
        </View>

        {/* Account Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <DetailRow
            label="Employee ID"
            value={profile?.id ? `EMP-${profile.id}` : "—"}
          />
          <View style={styles.divider} />
          <DetailRow
            label="Role"
            value={userRole === "ADMIN" ? "Administrator" : "Employee"}
          />
          <View style={styles.divider} />
          <DetailRow label="Account Status" value="Active" />
        </View>

        {/* Quick Actions */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/edit-profile")}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={styles.actionText}>Edit Profile Details</Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/forgot-password")}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>🔒</Text>
              <Text style={styles.actionText}>Reset / Change Password</Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <CustomButton
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutBtn}
        />
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
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 12,
    backgroundColor: AppColors.surfaceMuted,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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
  },
  designation: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  emailText: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 4,
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  actionChevron: {
    fontSize: 20,
    color: AppColors.textMuted,
  },
  logoutBtn: {
    marginTop: 4,
  },
});
