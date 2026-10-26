import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  KeyRound,
  Mail,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  SquarePen,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  UserX,
  X,
  XCircle,
} from "lucide-react-native";

import API from "../services/api";
import BottomNav from "../components/BottomNav";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import PasswordInput from "../components/PasswordInput";
import ScreenWrapper from "../components/ScreenWrapper";
import { AuthContext } from "../context/AuthContext";
import { AppColors } from "../constants/theme";

interface AdminItem {
  id: number;
  fullName: string;
  email: string;
  role: string;
  active?: boolean;
  createdOn?: string;
  createdBy?: string;
}

export default function ManageAdminsScreen() {
  const { userName, userRole } = useContext(AuthContext);

  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sortAsc, setSortAsc] = useState(true);

  // Selected Admin for Screen 3: Details View
  const [selectedAdmin, setSelectedAdmin] = useState<AdminItem | null>(null);
  const [detailTab, setDetailTab] = useState<"Profile" | "Activity" | "Permissions">("Profile");

  // Modal 1: Provision Admin State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addConfirmPassword, setAddConfirmPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Modal 2: Edit Admin State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Modal 3: Reset Password State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await API.get("/super-admin/admins");
      setAdmins(response.data || []);
    } catch (error: any) {
      console.log("Error loading administrators:", error);
      Alert.alert(
        "Connection Error",
        error?.response?.data?.message || "Failed to load administrator records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdmins();
  };

  const handleCreateAdmin = async () => {
    const trimmedName = addName.trim();
    const trimmedEmail = addEmail.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !addPassword) {
      Alert.alert("Missing Information", "Please enter all required administrator credentials.");
      return;
    }
    if (addPassword.length < 6) {
      Alert.alert("Password Length", "Password must be at least 6 characters.");
      return;
    }
    if (addPassword !== addConfirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      setAddLoading(true);
      await API.post("/super-admin/admins", {
        fullName: trimmedName,
        email: trimmedEmail,
        password: addPassword,
      });

      Alert.alert("Success", "Administrator provisioned successfully.");
      setShowAddModal(false);
      setAddName("");
      setAddEmail("");
      setAddPassword("");
      setAddConfirmPassword("");
      fetchAdmins();
    } catch (error: any) {
      Alert.alert(
        "Provisioning Failed",
        error?.response?.data?.message || "Could not provision administrator."
      );
    } finally {
      setAddLoading(false);
    }
  };

  const openEditModal = (admin: AdminItem) => {
    setEditName(admin.fullName);
    setEditEmail(admin.email);
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return;
    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      Alert.alert("Missing Information", "Full name and email address are required.");
      return;
    }

    try {
      setEditLoading(true);
      const res = await API.put(`/super-admin/admins/${selectedAdmin.id}`, {
        fullName: trimmedName,
        email: trimmedEmail,
      });

      Alert.alert("Success", "Administrator details updated successfully.");
      setShowEditModal(false);
      setSelectedAdmin(res.data);
      fetchAdmins();
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error?.response?.data?.message || "Could not update administrator."
      );
    } finally {
      setEditLoading(false);
    }
  };

  const openResetPasswordModal = (admin: AdminItem) => {
    setResetPassword("");
    setResetConfirmPassword("");
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    if (!selectedAdmin) return;

    if (!resetPassword) {
      Alert.alert("Missing Information", "Please enter a new password.");
      return;
    }
    if (resetPassword.length < 6) {
      Alert.alert("Password Length", "Password must be at least 6 characters.");
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      setResetLoading(true);
      await API.put(`/super-admin/admins/${selectedAdmin.id}/reset-password`, {
        newPassword: resetPassword,
      });

      Alert.alert("Success", `Credentials updated for ${selectedAdmin.fullName}.`);
      setShowResetModal(false);
    } catch (error: any) {
      Alert.alert(
        "Password Reset Failed",
        error?.response?.data?.message || "Could not reset password."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteAdmin = (admin: AdminItem) => {
    Alert.alert(
      "Revoke Administrator Access",
      `Are you sure you want to revoke administrative access for "${admin.fullName}" (${admin.email})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke Access",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/super-admin/admins/${admin.id}`);
              Alert.alert("Access Revoked", "Administrator account has been removed.");
              setSelectedAdmin(null);
              fetchAdmins();
            } catch (error: any) {
              Alert.alert(
                "Action Failed",
                error?.response?.data?.message || "Could not remove administrator."
              );
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = (admin: AdminItem) => {
    const isCurrentlyActive = admin.active !== false;
    const actionTitle = isCurrentlyActive ? "Deactivate Administrator" : "Activate Administrator";
    const actionMsg = isCurrentlyActive
      ? `Are you sure you want to temporarily deactivate "${admin.fullName}"? They will not be able to log into the console until reactivated.`
      : `Are you sure you want to reactivate "${admin.fullName}"? Their access will be restored immediately.`;

    Alert.alert(actionTitle, actionMsg, [
      { text: "Cancel", style: "cancel" },
      {
        text: isCurrentlyActive ? "Deactivate" : "Activate",
        style: isCurrentlyActive ? "destructive" : "default",
        onPress: async () => {
          try {
            const res = await API.put(`/super-admin/admins/${admin.id}/toggle-status`);
            const updatedAdmin = res.data;
            setAdmins((prev) =>
              prev.map((a) => (a.id === admin.id ? { ...a, active: updatedAdmin.active } : a))
            );
            if (selectedAdmin && selectedAdmin.id === admin.id) {
              setSelectedAdmin((prev) => (prev ? { ...prev, active: updatedAdmin.active } : null));
            }
            Alert.alert(
              "Status Updated",
              `Administrator "${admin.fullName}" is now ${updatedAdmin.active ? "Active" : "Deactivated"}.`
            );
          } catch (error: any) {
            Alert.alert(
              "Action Failed",
              error?.response?.data?.message || "Could not update administrator status."
            );
          }
        },
      },
    ]);
  };

  // Filter & Sort
  const filteredAdmins = admins
    .filter((a) => {
      const matchSearch =
        a.fullName.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      if (activeFilter === "SUPER_ADMIN") return a.role === "SUPER_ADMIN";
      if (activeFilter === "ADMIN") return a.role === "ADMIN" && a.active !== false;
      if (activeFilter === "INACTIVE") return a.active === false;
      return true;
    })
    .sort((a, b) => {
      if (sortAsc) return a.fullName.localeCompare(b.fullName);
      return b.fullName.localeCompare(a.fullName);
    });

  // ==========================================
  // SCREEN 3: ADMINISTRATOR DETAILS VIEW
  // ==========================================
  if (selectedAdmin) {
    const adminInitial = selectedAdmin.fullName ? selectedAdmin.fullName.charAt(0).toUpperCase() : "A";

    return (
      <ScreenWrapper>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedAdmin(null)}
              activeOpacity={0.7}
              accessibilityLabel="Back to roster"
            >
              <ArrowLeft size={20} color="#0F172A" strokeWidth={2.2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Administrator Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Header Block */}
            <View style={styles.detailsProfileBlock}>
              <View style={styles.detailsAvatar}>
                <Text style={styles.detailsAvatarText}>{adminInitial}</Text>
              </View>
              <View style={styles.detailsNameRow}>
                <Text style={styles.detailsName}>{selectedAdmin.fullName}</Text>
              </View>
              <View style={styles.detailsBadge}>
                <Text style={styles.detailsBadgeText}>{selectedAdmin.role}</Text>
              </View>
              <Text style={styles.detailsEmail}>{selectedAdmin.email}</Text>
              <View style={[styles.activeDotRow, selectedAdmin.active === false && styles.inactiveDotRow]}>
                <View style={[styles.activeDot, selectedAdmin.active === false && styles.inactiveDot]} />
                <Text style={[styles.activeDotText, selectedAdmin.active === false && styles.inactiveDotText]}>
                  {selectedAdmin.active === false ? "Inactive" : "Active"}
                </Text>
              </View>
            </View>

            {/* Action Buttons: 2x2 Grid with Edit, Reset Key, Deactivate/Activate, Revoke */}
            <View style={styles.detailsActionRow}>
              {/* 1. Edit */}
              <TouchableOpacity
                style={styles.editActionCard}
                onPress={() => openEditModal(selectedAdmin)}
                activeOpacity={0.7}
              >
                <SquarePen size={17} color="#2563EB" strokeWidth={2.2} />
                <Text style={styles.editActionCardText}>Edit</Text>
              </TouchableOpacity>

              {/* 2. Reset Key */}
              <TouchableOpacity
                style={styles.resetActionCard}
                onPress={() => openResetPasswordModal(selectedAdmin)}
                activeOpacity={0.7}
              >
                <KeyRound size={17} color="#D97706" strokeWidth={2.2} />
                <Text style={styles.resetActionCardText}>Reset Key</Text>
              </TouchableOpacity>

              {/* 3. Deactivate / Activate */}
              <TouchableOpacity
                style={[
                  styles.toggleStatusActionCard,
                  selectedAdmin.active === false ? styles.activateActionCard : styles.deactivateActionCard,
                ]}
                onPress={() => handleToggleStatus(selectedAdmin)}
                activeOpacity={0.7}
              >
                {selectedAdmin.active === false ? (
                  <UserCheck size={17} color="#16A34A" strokeWidth={2.2} />
                ) : (
                  <UserX size={17} color="#D97706" strokeWidth={2.2} />
                )}
                <Text
                  style={[
                    selectedAdmin.active === false ? styles.activateActionCardText : styles.deactivateActionCardText,
                  ]}
                >
                  {selectedAdmin.active === false ? "Activate" : "Deactivate"}
                </Text>
              </TouchableOpacity>

              {/* 4. Revoke */}
              <TouchableOpacity
                style={styles.revokeActionCard}
                onPress={() => handleDeleteAdmin(selectedAdmin)}
                activeOpacity={0.7}
              >
                <Trash2 size={17} color="#DC2626" strokeWidth={2.2} />
                <Text style={styles.revokeActionCardText}>Revoke</Text>
              </TouchableOpacity>
            </View>

            {/* Segmented Navigation Tabs */}
            <View style={styles.tabBar}>
              {(["Profile", "Activity", "Permissions"] as const).map((tab) => {
                const isTabActive = detailTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabItem, isTabActive && styles.tabItemActive]}
                    onPress={() => setDetailTab(tab)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tabItemText, isTabActive && styles.tabItemTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {detailTab === "Profile" && (
              <>
                {/* Personal Information Card */}
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Text style={styles.infoCardTitle}>Personal Information</Text>
                    <TouchableOpacity
                      style={styles.pillEditBtn}
                      onPress={() => openEditModal(selectedAdmin)}
                      activeOpacity={0.7}
                    >
                      <SquarePen size={12} color="#2563EB" strokeWidth={2.2} />
                      <Text style={styles.pillEditBtnText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailItem}>
                    <User size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Full Name</Text>
                    <Text style={styles.detailValue}>{selectedAdmin.fullName}</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <Mail size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Email Address</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{selectedAdmin.email}</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <Building2 size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Department</Text>
                    <Text style={styles.detailValue}>—</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <Briefcase size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Designation</Text>
                    <Text style={styles.detailValue}>Administrator</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <Phone size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>—</Text>
                  </View>
                </View>

                {/* Account Information Card */}
                <View style={styles.infoCard}>
                  <Text style={[styles.infoCardTitle, { marginBottom: 12 }]}>Account Information</Text>

                  <View style={styles.detailItem}>
                    <CreditCard size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Employee ID</Text>
                    <Text style={styles.detailValue}>—</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <ShieldCheck size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Role</Text>
                    <Text style={styles.detailValue}>Admin</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <Clock size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Account Status</Text>
                    <View style={[styles.activeDotRow, selectedAdmin.active === false && styles.inactiveDotRow]}>
                      <View style={[styles.activeDot, selectedAdmin.active === false && styles.inactiveDot]} />
                      <Text style={[styles.activeDotText, selectedAdmin.active === false && styles.inactiveDotText]}>
                        {selectedAdmin.active === false ? "Inactive (Access Suspended)" : "Active"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <UserPlus size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Created By</Text>
                    <Text style={styles.detailValue}>{userName || "Hitesh Pagar"}</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <Calendar size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Created On</Text>
                    <Text style={styles.detailValue}>Oct 24, 2026, 12:45 PM</Text>
                  </View>
                </View>
              </>
            )}

            {detailTab === "Activity" && (
              <View style={styles.emptyTabCard}>
                <Text style={styles.emptyTabTitle}>No Recent Activity</Text>
                <Text style={styles.emptyTabSubtitle}>This administrator has not performed any audit actions today.</Text>
              </View>
            )}

            {detailTab === "Permissions" && (
              <View style={styles.emptyTabCard}>
                <Text style={styles.emptyTabTitle}>Standard Admin Scope</Text>
                <Text style={styles.emptyTabSubtitle}>Granted operational oversight for Employee, Department, Attendance, and Leave modules.</Text>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Modal: Edit Administrator */}
          <Modal
            visible={showEditModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEditModal(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Administrator</Text>
                  <TouchableOpacity onPress={() => setShowEditModal(false)}>
                    <X size={20} color="#64748B" strokeWidth={2.2} />
                  </TouchableOpacity>
                </View>

                <CustomInput
                  label="Full Name *"
                  placeholder="Full Name"
                  value={editName}
                  onChangeText={setEditName}
                />

                <CustomInput
                  label="Email Address *"
                  placeholder="Email Address"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setShowEditModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <CustomButton
                    title="Save Changes"
                    onPress={handleUpdateAdmin}
                    loading={editLoading}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal: Reset Password */}
          <Modal
            visible={showResetModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowResetModal(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Reset Access Key</Text>
                  <TouchableOpacity onPress={() => setShowResetModal(false)}>
                    <X size={20} color="#64748B" strokeWidth={2.2} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSubtitle}>
                  Assign a new password for {selectedAdmin?.fullName} ({selectedAdmin?.email}).
                </Text>

                <PasswordInput
                  label="New Password *"
                  placeholder="Minimum 6 characters"
                  value={resetPassword}
                  onChangeText={setResetPassword}
                />

                <PasswordInput
                  label="Confirm New Password *"
                  placeholder="Re-enter new password"
                  value={resetConfirmPassword}
                  onChangeText={setResetConfirmPassword}
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setShowResetModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <CustomButton
                    title="Update Credentials"
                    onPress={handleResetPassword}
                    loading={resetLoading}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </View>
          </Modal>

          <BottomNav role={userRole} />
        </View>
      </ScreenWrapper>
    );
  }

  // ==========================================
  // SCREEN 2: ADMINISTRATOR ROSTER
  // ==========================================
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/super-admin-dashboard")}
            activeOpacity={0.7}
            accessibilityLabel="Back to dashboard"
          >
            <ArrowLeft size={20} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Administrator Roster</Text>
          <TouchableOpacity
            style={styles.provisionBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.provisionBtnText}>+ Provision</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBox}>
            <Search size={16} color="#94A3B8" strokeWidth={2.2} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by administrator name or email..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch("")}>
                <XCircle size={16} color="#94A3B8" strokeWidth={2} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Chips Horizontal Bar */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {[
              { id: "ALL", label: `All (${admins.length})` },
              { id: "SUPER_ADMIN", label: "Super Admin" },
              { id: "ADMIN", label: "Admin" },
              { id: "INACTIVE", label: "Inactive" },
            ].map((f) => {
              const isSelected = activeFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List of Admins */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#173B7A"]}
              tintColor="#173B7A"
            />
          }
        >
          {/* Summary line: X of X administrators & Sort Name ↑↓ */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryCount}>
              {filteredAdmins.length} of {admins.length} administrators
            </Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setSortAsc((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Text style={styles.sortText}>Name</Text>
              {sortAsc ? (
                <ArrowUp size={13} color="#64748B" strokeWidth={2.2} />
              ) : (
                <ArrowDown size={13} color="#64748B" strokeWidth={2.2} />
              )}
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#173B7A" />
              <Text style={styles.loadingText}>Loading administrators...</Text>
            </View>
          ) : filteredAdmins.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Shield size={36} color="#94A3B8" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No Administrators Found</Text>
              <Text style={styles.emptyDesc}>
                {search
                  ? "No administrator matched your search query."
                  : "No operational administrators have been provisioned in the system."}
              </Text>
              {!search && (
                <TouchableOpacity
                  style={styles.provisionBtn}
                  onPress={() => setShowAddModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.provisionBtnText}>+ Provision Administrator</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredAdmins.map((admin) => {
              const initial = admin.fullName ? admin.fullName.charAt(0).toUpperCase() : "A";
              return (
                <TouchableOpacity
                  key={admin.id}
                  style={styles.adminCard}
                  onPress={() => setSelectedAdmin(admin)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardAvatar}>
                    <Text style={styles.cardAvatarText}>{initial}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardNameRow}>
                      <Text style={styles.cardName} numberOfLines={1}>{admin.fullName}</Text>
                      <View style={styles.rolePill}>
                        <Text style={styles.rolePillText}>{admin.role}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardEmail} numberOfLines={1}>{admin.email}</Text>
                    <View style={styles.activeDotRow}>
                      <View style={[styles.activeDot, admin.active === false && styles.inactiveDot]} />
                      <Text style={[styles.activeDotText, admin.active === false && styles.inactiveDotText]}>
                        {admin.active === false ? "Inactive" : "Active"}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
                </TouchableOpacity>
              );
            })
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Modal: Provision Administrator */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Provision Administrator</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <X size={20} color="#64748B" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSubtitle}>
                  Create access credentials for an operational administrator.
                </Text>

                <CustomInput
                  label="Full Name *"
                  placeholder="e.g. Rushikesh Wakode"
                  value={addName}
                  onChangeText={setAddName}
                />

                <CustomInput
                  label="Company Email Address *"
                  placeholder="admin@company.com"
                  value={addEmail}
                  onChangeText={setAddEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <PasswordInput
                  label="Temporary Password *"
                  placeholder="Minimum 6 characters"
                  value={addPassword}
                  onChangeText={setAddPassword}
                />

                <PasswordInput
                  label="Confirm Password *"
                  placeholder="Re-enter password"
                  value={addConfirmPassword}
                  onChangeText={setAddConfirmPassword}
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setShowAddModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <CustomButton
                    title="Provision Admin"
                    onPress={handleCreateAdmin}
                    loading={addLoading}
                    style={{ flex: 1 }}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <BottomNav role={userRole} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  provisionBtn: {
    backgroundColor: "#173B7A",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  provisionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  searchBarWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
    padding: 0,
  },
  filterBar: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#173B7A",
    borderColor: "#173B7A",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryCount: {
    fontSize: 12,
    color: "#64748B",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  centerContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 10,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  adminCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardAvatarText: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "700",
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  rolePill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
  },
  cardEmail: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  activeDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  activeDotText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
  },
  inactiveDot: {
    backgroundColor: "#DC2626",
  },
  inactiveDotText: {
    color: "#DC2626",
  },
  inactiveDotRow: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  // Details View Styles (Screen 3)
  detailsProfileBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
  },
  detailsAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  detailsAvatarText: {
    color: "#2563EB",
    fontSize: 26,
    fontWeight: "700",
  },
  detailsNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailsName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  detailsBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  detailsBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  detailsEmail: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
  },
  detailsActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginBottom: 16,
  },
  editActionCard: {
    width: "48%",
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  editActionCardText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  resetActionCard: {
    width: "48%",
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  resetActionCardText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D97706",
  },
  toggleStatusActionCard: {
    width: "48%",
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deactivateActionCard: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  deactivateActionCardText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#D97706",
  },
  activateActionCard: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  activateActionCardText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#16A34A",
  },
  revokeActionCard: {
    width: "48%",
    flexDirection: "row",
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  revokeActionCardText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DC2626",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 14,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: "#173B7A",
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  tabItemTextActive: {
    color: "#173B7A",
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 14,
  },
  infoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  pillEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  pillEditBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 4,
  },
  emptyTabCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTabTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  emptyTabSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    alignItems: "center",
  },
  modalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
});
