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
  companyId?: number;
  companyName?: string;
  designation?: string;
  phoneNumber?: string;
  employeeId?: string;
  createdAt?: string;
  lastLoginAt?: string;
  createdOn?: string;
  createdBy?: string;
}

interface CompanyItem {
  id: number;
  name: string;
  code?: string;
  totalAdmins?: number;
  totalEmployees?: number;
}

const DESIGNATION_PRESETS = [
  "Company Owner",
  "Company Administrator",
  "Operations Admin",
  "HR Director",
  "HR Manager",
  "IT Administrator",
];

export default function ManageAdminsScreen() {
  const { userName, userRole } = useContext(AuthContext);

  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [companyFilter, setCompanyFilter] = useState<number | "ALL">("ALL");
  const [sortAsc, setSortAsc] = useState(true);

  // Selected Admin for Screen 3: Details View
  const [selectedAdmin, setSelectedAdmin] = useState<AdminItem | null>(null);

  const formatDateTime = (dateVal?: string | null) => {
    if (!dateVal) return "Recently";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Recently";
    }
  };
  const [detailTab, setDetailTab] = useState<"Profile" | "Activity" | "Permissions">("Profile");

  // Modal 1: Provision Admin State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addConfirmPassword, setAddConfirmPassword] = useState("");
  const [addCompanyId, setAddCompanyId] = useState<number | null>(null);
  const [addCompanyName, setAddCompanyName] = useState("");
  const [addIsNewCompany, setAddIsNewCompany] = useState(false);
  const [addDesignation, setAddDesignation] = useState("Company Owner");
  const [addPhone, setAddPhone] = useState("");
  const [addEmployeeId, setAddEmployeeId] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Modal 2: Edit Admin State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCompanyId, setEditCompanyId] = useState<number | null>(null);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editIsNewCompany, setEditIsNewCompany] = useState(false);
  const [editDesignation, setEditDesignation] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Modal 3: Reset Password State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Modal 4: Manage Companies State
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyCode, setNewCompanyCode] = useState("");
  const [companyActionLoading, setCompanyActionLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await API.get("/super-admin/companies");
      setCompanies(res.data || []);
    } catch (err: any) {
      console.log("Error loading companies:", err);
    }
  }, []);

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

  const loadAllData = useCallback(async () => {
    await Promise.all([fetchAdmins(), fetchCompanies()]);
  }, [fetchAdmins, fetchCompanies]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const handleCreateCompany = async () => {
    const trimmed = newCompanyName.trim();
    if (!trimmed) {
      Alert.alert("Missing Name", "Please enter a company name.");
      return;
    }
    try {
      setCompanyActionLoading(true);
      await API.post("/super-admin/companies", {
        name: trimmed,
        code: newCompanyCode.trim() || undefined,
      });
      Alert.alert("Success", `Company "${trimmed}" registered successfully.`);
      setNewCompanyName("");
      setNewCompanyCode("");
      await fetchCompanies();
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message || "Could not register company.");
    } finally {
      setCompanyActionLoading(false);
    }
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
        companyId: addIsNewCompany ? undefined : (addCompanyId || undefined),
        companyName: addIsNewCompany ? addCompanyName.trim() : undefined,
        designation: addDesignation.trim() || "Company Owner",
        phoneNumber: addPhone.trim() || undefined,
        employeeId: addEmployeeId.trim() || undefined,
      });

      Alert.alert("Success", "Administrator provisioned successfully.");
      setShowAddModal(false);
      setAddName("");
      setAddEmail("");
      setAddPhone("");
      setAddEmployeeId("");
      setAddPassword("");
      setAddConfirmPassword("");
      setAddCompanyId(null);
      setAddCompanyName("");
      setAddIsNewCompany(false);
      setAddDesignation("Company Owner");
      loadAllData();
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
    setEditCompanyId(admin.companyId || null);
    setEditCompanyName(admin.companyName || "");
    setEditIsNewCompany(false);
    setEditDesignation(admin.designation || "");
    setEditPhone(admin.phoneNumber || "");
    setEditEmployeeId(admin.employeeId || "");
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
        companyId: editIsNewCompany ? undefined : (editCompanyId || undefined),
        companyName: editIsNewCompany ? editCompanyName.trim() : undefined,
        designation: editDesignation.trim() || undefined,
        phoneNumber: editPhone.trim() || undefined,
        employeeId: editEmployeeId.trim() || undefined,
      });

      Alert.alert("Success", "Administrator details updated successfully.");
      setShowEditModal(false);
      setSelectedAdmin(res.data);
      loadAllData();
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
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        (a.companyName && a.companyName.toLowerCase().includes(search.toLowerCase())) ||
        (a.designation && a.designation.toLowerCase().includes(search.toLowerCase()));
      if (!matchSearch) return false;

      if (activeFilter.startsWith("COMPANY_")) {
        const compId = Number(activeFilter.replace("COMPANY_", ""));
        return a.companyId === compId;
      }

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
                    <Text style={styles.detailLabel}>Company</Text>
                    <Text style={styles.detailValue}>{selectedAdmin.companyName || "Global / Unassigned"}</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <Briefcase size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Admin Role / Title</Text>
                    <Text style={styles.detailValue}>{selectedAdmin.designation || "Company Owner"}</Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <Phone size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{selectedAdmin.phoneNumber || "—"}</Text>
                  </View>
                </View>

                {/* Account Information Card */}
                <View style={styles.infoCard}>
                  <Text style={[styles.infoCardTitle, { marginBottom: 12 }]}>Account Information</Text>

                  <View style={styles.detailItem}>
                    <CreditCard size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Employee ID</Text>
                    <Text style={styles.detailValue}>{selectedAdmin.employeeId || (selectedAdmin.id ? `ADM-${selectedAdmin.id}` : "—")}</Text>
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
                    <Text style={styles.detailValue}>
                      {formatDateTime(selectedAdmin.createdAt || selectedAdmin.createdOn)}
                    </Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.detailItem}>
                    <Clock size={16} color="#64748B" strokeWidth={2} style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Last Login</Text>
                    <Text style={styles.detailValue}>
                      {formatDateTime(selectedAdmin.lastLoginAt)}
                    </Text>
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

                <CustomInput
                  label="Employee ID"
                  placeholder="e.g. ADM-001 or EMP-101"
                  value={editEmployeeId}
                  onChangeText={setEditEmployeeId}
                />

                <CustomInput
                  label="Phone Number"
                  placeholder="e.g. +91 98765 43210"
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                />

                {/* Company Selection */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Assigned Company / Enterprise</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceScroll}>
                    {companies.map((c) => {
                      const isSelected = !editIsNewCompany && editCompanyId === c.id;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[styles.choiceChip, isSelected && styles.choiceChipActive]}
                          onPress={() => {
                            setEditCompanyId(c.id);
                            setEditCompanyName(c.name);
                            setEditIsNewCompany(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Building2 size={12} color={isSelected ? "#FFFFFF" : "#1E40AF"} strokeWidth={2.2} />
                          <Text style={[styles.choiceChipText, isSelected && styles.choiceChipTextActive]}>
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      style={[styles.choiceChip, editIsNewCompany && styles.choiceChipActive]}
                      onPress={() => {
                        setEditIsNewCompany(true);
                        setEditCompanyId(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.choiceChipText, editIsNewCompany && styles.choiceChipTextActive]}>
                        + New Company
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>

                  {editIsNewCompany && (
                    <CustomInput
                      label="New Company Name *"
                      placeholder="e.g. Acme Innovations"
                      value={editCompanyName}
                      onChangeText={setEditCompanyName}
                      style={{ marginTop: 8 }}
                    />
                  )}
                </View>

                {/* Admin Role / Designation */}
                <View style={styles.formSection}>
                  <CustomInput
                    label="Admin Role / Title"
                    placeholder="e.g. Company Owner or HR Manager"
                    value={editDesignation}
                    onChangeText={setEditDesignation}
                  />
                  <Text style={styles.presetLabel}>Quick Presets:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceScroll}>
                    {DESIGNATION_PRESETS.map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.presetChip, editDesignation === d && styles.presetChipActive]}
                        onPress={() => setEditDesignation(d)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.presetChipText, editDesignation === d && styles.presetChipTextActive]}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

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
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/super-admin-dashboard")}
              activeOpacity={0.7}
              accessibilityLabel="Back to dashboard"
            >
              <ArrowLeft size={20} color="#0F172A" strokeWidth={2.2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>Administrator Roster</Text>
          </View>
          <TouchableOpacity
            style={styles.provisionBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.provisionBtnText}>+ Provision</Text>
          </TouchableOpacity>
        </View>

        {/* Dedicated Company / Enterprise Quick Banner */}
        <TouchableOpacity
          style={styles.companyBanner}
          onPress={() => setShowCompanyModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.companyBannerLeft}>
            <View style={styles.companyBannerIcon}>
              <Building2 size={16} color="#1D4ED8" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.companyBannerTitle} numberOfLines={1}>Companies & Enterprises</Text>
              <Text style={styles.companyBannerSub} numberOfLines={1}>
                {companies.length} {companies.length === 1 ? "company" : "companies"} registered • Tap to manage
              </Text>
            </View>
          </View>
          <View style={styles.companyBannerAction}>
            <Text style={styles.companyBannerActionText}>Manage</Text>
            <ChevronRight size={14} color="#1D4ED8" strokeWidth={2.2} />
          </View>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBox}>
            <Search size={16} color="#94A3B8" strokeWidth={2.2} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, company, or designation..."
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
              ...companies.map((c) => ({
                id: `COMPANY_${c.id}`,
                label: `🏢 ${c.name}`,
              })),
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

                    {/* Company & Designation Badges */}
                    <View style={styles.cardBadgesRow}>
                      {admin.companyName ? (
                        <View style={styles.metaCompanyBadge}>
                          <Building2 size={10} color="#1E40AF" strokeWidth={2} />
                          <Text style={styles.metaCompanyBadgeText} numberOfLines={1}>{admin.companyName}</Text>
                        </View>
                      ) : null}
                      {admin.designation ? (
                        <View style={styles.metaDesignationBadge}>
                          <Briefcase size={10} color="#6D28D9" strokeWidth={2} />
                          <Text style={styles.metaDesignationBadgeText} numberOfLines={1}>{admin.designation}</Text>
                        </View>
                      ) : null}
                    </View>

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
                  placeholder="Enter full name"
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

                <CustomInput
                  label="Employee ID (Optional)"
                  placeholder="e.g. ADM-001 (auto-generated if empty)"
                  value={addEmployeeId}
                  onChangeText={setAddEmployeeId}
                />

                <CustomInput
                  label="Phone Number"
                  placeholder="e.g. +91 98765 43210"
                  value={addPhone}
                  onChangeText={setAddPhone}
                  keyboardType="phone-pad"
                />

                {/* Company Selection */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Assigned Company / Enterprise</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceScroll}>
                    {companies.map((c) => {
                      const isSelected = !addIsNewCompany && addCompanyId === c.id;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[styles.choiceChip, isSelected && styles.choiceChipActive]}
                          onPress={() => {
                            setAddCompanyId(c.id);
                            setAddCompanyName(c.name);
                            setAddIsNewCompany(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Building2 size={12} color={isSelected ? "#FFFFFF" : "#1E40AF"} strokeWidth={2.2} />
                          <Text style={[styles.choiceChipText, isSelected && styles.choiceChipTextActive]}>
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      style={[styles.choiceChip, addIsNewCompany && styles.choiceChipActive]}
                      onPress={() => {
                        setAddIsNewCompany(true);
                        setAddCompanyId(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.choiceChipText, addIsNewCompany && styles.choiceChipTextActive]}>
                        + New Company
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>

                  {addIsNewCompany && (
                    <CustomInput
                      label="New Company Name *"
                      placeholder="e.g. Acme Tech Solutions"
                      value={addCompanyName}
                      onChangeText={setAddCompanyName}
                      style={{ marginTop: 8 }}
                    />
                  )}
                </View>

                {/* Admin Role / Designation */}
                <View style={styles.formSection}>
                  <CustomInput
                    label="Admin Role / Title"
                    placeholder="e.g. Company Owner or HR Manager"
                    value={addDesignation}
                    onChangeText={setAddDesignation}
                  />
                  <Text style={styles.presetLabel}>Quick Presets:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceScroll}>
                    {DESIGNATION_PRESETS.map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.presetChip, addDesignation === d && styles.presetChipActive]}
                        onPress={() => setAddDesignation(d)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.presetChipText, addDesignation === d && styles.presetChipTextActive]}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

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

        {/* Modal: Manage Companies */}
        <Modal
          visible={showCompanyModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCompanyModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Building2 size={20} color="#173B7A" strokeWidth={2.2} />
                  <Text style={styles.modalTitle}>Registered Companies</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCompanyModal(false)}>
                  <X size={20} color="#64748B" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSubtitle}>
                  View enterprises and register new companies for your multi-company HR setup.
                </Text>

                {/* Register New Company Box */}
                <View style={styles.addCompanyBox}>
                  <Text style={styles.addCompanyBoxTitle}>+ Register New Company</Text>
                  <CustomInput
                    label="Company Name *"
                    placeholder="e.g. TechCorp Global Ltd"
                    value={newCompanyName}
                    onChangeText={setNewCompanyName}
                  />
                  <CustomInput
                    label="Company Code (Optional)"
                    placeholder="e.g. TCGL"
                    value={newCompanyCode}
                    onChangeText={setNewCompanyCode}
                    autoCapitalize="characters"
                  />
                  <CustomButton
                    title="Add Company"
                    onPress={handleCreateCompany}
                    loading={companyActionLoading}
                    style={{ marginTop: 6 }}
                  />
                </View>

                {/* Company List */}
                <Text style={[styles.sectionTitleSmall, { marginTop: 16, marginBottom: 8 }]}>
                  Existing Enterprises ({companies.length})
                </Text>

                {companies.length === 0 ? (
                  <View style={styles.emptyCompanyCard}>
                    <Text style={styles.emptyCompanyCardText}>No companies created yet. Add your first company above.</Text>
                  </View>
                ) : (
                  companies.map((c) => (
                    <View key={c.id} style={styles.companyRowCard}>
                      <View style={styles.companyIconCircle}>
                        <Building2 size={16} color="#1D4ED8" strokeWidth={2.2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.companyRowName}>{c.name}</Text>
                        <Text style={styles.companyRowMeta}>
                          {c.code ? `Code: ${c.code} • ` : ""}{c.totalAdmins ?? 0} Admins • {c.totalEmployees ?? 0} Employees
                        </Text>
                      </View>
                    </View>
                  ))
                )}

                <TouchableOpacity
                  style={[styles.modalCancelBtn, { marginTop: 16, alignItems: "center" }]}
                  onPress={() => setShowCompanyModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelBtnText}>Close</Text>
                </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 8,
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
    marginRight: 6,
  },
  backButton: {
    padding: 6,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  provisionBtn: {
    backgroundColor: "#173B7A",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 8,
    flexShrink: 0,
  },
  provisionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  companyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    borderBottomWidth: 1,
    borderBottomColor: "#DBEAFE",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  companyBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  companyBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  companyBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  companyBannerSub: {
    fontSize: 11,
    color: "#3B82F6",
    marginTop: 1,
  },
  companyBannerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    flexShrink: 0,
  },
  companyBannerActionText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#1D4ED8",
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
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  companiesHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  companiesHeaderBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#173B7A",
  },
  cardBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  metaCompanyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaCompanyBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  metaDesignationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F3FF",
    borderColor: "#DDD6FE",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaDesignationBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#6D28D9",
  },
  formSection: {
    marginTop: 10,
    marginBottom: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 6,
  },
  choiceScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  choiceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginRight: 8,
  },
  choiceChipActive: {
    backgroundColor: "#173B7A",
    borderColor: "#173B7A",
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  choiceChipTextActive: {
    color: "#FFFFFF",
  },
  presetLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 6,
    marginBottom: 4,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 6,
  },
  presetChipActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#6366F1",
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },
  presetChipTextActive: {
    color: "#4338CA",
    fontWeight: "700",
  },
  addCompanyBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  addCompanyBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  sectionTitleSmall: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyCompanyCard: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyCompanyCardText: {
    fontSize: 12,
    color: "#64748B",
  },
  companyRowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    marginBottom: 8,
  },
  companyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  companyRowName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  companyRowMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
});
