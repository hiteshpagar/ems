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
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  KeyRound,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SquarePen,
  Trash2,
  UserCheck,
  Users,
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
import {
  isValidEmail,
  isValidName,
  isValidPhone,
} from "../utils/validators";

interface HrItem {
  id: number;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  companyId: number;
  companyName: string;
  designation: string;
  phoneNumber?: string;
  employeeId?: string;
  createdAt?: string;
  lastLoginAt?: string;
  passwordChangeRequired?: boolean;
}

export default function ManageHrsScreen() {
  const { userRole } = useContext(AuthContext);

  const [hrs, setHrs] = useState<HrItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFullName, setCreateFullName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createDesignation, setCreateDesignation] = useState("HR Manager");
  const [createEmployeeId, setCreateEmployeeId] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHr, setSelectedHr] = useState<HrItem | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

  const fetchHrs = useCallback(async () => {
    try {
      const response = await API.get("/admin/hrs");
      setHrs(response.data || []);
    } catch (error: any) {
      console.log("Error fetching HRs:", error);
      Alert.alert(
        "Loading Error",
        error?.response?.data?.message || "Failed to load company HR roster."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHrs();
  }, [fetchHrs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHrs();
  };

  const filteredHrs = useMemo(() => {
    return hrs.filter((hr) => {
      const matchesSearch =
        hr.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hr.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hr.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hr.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === "ACTIVE") return hr.active === true;
      if (filterStatus === "INACTIVE") return hr.active === false;
      return true;
    });
  }, [hrs, searchQuery, filterStatus]);

  const handleCreateHr = async () => {
    const trimmedName = createFullName.trim();
    if (!trimmedName || !isValidName(trimmedName)) {
      Alert.alert("Invalid Name", "HR full name must be at least 2 characters.");
      return;
    }

    const trimmedEmail = createEmail.trim().toLowerCase();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid corporate email address.");
      return;
    }

    if (createPhone.trim() && !isValidPhone(createPhone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number (10-15 digits).");
      return;
    }

    if (createPassword && createPassword.length < 6) {
      Alert.alert("Weak Password", "Temporary password must be at least 6 characters.");
      return;
    }

    try {
      setCreateLoading(true);
      const res = await API.post("/admin/hrs", {
        fullName: trimmedName,
        email: trimmedEmail,
        phoneNumber: createPhone.trim() || undefined,
        designation: createDesignation.trim() || "HR Manager",
        employeeId: createEmployeeId.trim() || undefined,
        password: createPassword || undefined,
      });

      Alert.alert(
        "HR Account Created",
        `HR account for "${res.data.fullName}" provisioned successfully. An onboarding email with credentials has been sent to ${trimmedEmail}.`
      );

      setShowCreateModal(false);
      setCreateFullName("");
      setCreateEmail("");
      setCreatePhone("");
      setCreateDesignation("HR Manager");
      setCreateEmployeeId("");
      setCreatePassword("");
      fetchHrs();
    } catch (error: any) {
      Alert.alert(
        "Creation Failed",
        error?.response?.data?.message || "Failed to create HR account."
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (hr: HrItem) => {
    setSelectedHr(hr);
    setEditFullName(hr.fullName);
    setEditEmail(hr.email);
    setEditPhone(hr.phoneNumber || "");
    setEditDesignation(hr.designation || "HR Manager");
    setEditEmployeeId(hr.employeeId || "");
    setEditActive(hr.active);
    setShowEditModal(true);
  };

  const handleUpdateHr = async () => {
    if (!selectedHr) return;

    const trimmedName = editFullName.trim();
    if (!trimmedName || !isValidName(trimmedName)) {
      Alert.alert("Invalid Name", "HR full name must be at least 2 characters.");
      return;
    }

    const trimmedEmail = editEmail.trim().toLowerCase();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid corporate email address.");
      return;
    }

    if (editPhone.trim() && !isValidPhone(editPhone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number (10-15 digits).");
      return;
    }

    try {
      setEditLoading(true);
      await API.put(`/admin/hrs/${selectedHr.id}`, {
        fullName: trimmedName,
        email: trimmedEmail,
        phoneNumber: editPhone.trim() || undefined,
        designation: editDesignation.trim() || undefined,
        employeeId: editEmployeeId.trim() || undefined,
        active: editActive,
      });

      Alert.alert("HR Updated", "HR account details updated successfully.");
      setShowEditModal(false);
      fetchHrs();
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error?.response?.data?.message || "Failed to update HR details."
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = (hr: HrItem) => {
    const nextStatus = !hr.active;
    const actionLabel = nextStatus ? "Activate" : "Deactivate";

    Alert.alert(
      `${actionLabel} HR Account`,
      `Are you sure you want to ${actionLabel.toLowerCase()} access for "${hr.fullName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: actionLabel,
          style: nextStatus ? "default" : "destructive",
          onPress: async () => {
            try {
              await API.patch(`/admin/hrs/${hr.id}/status?active=${nextStatus}`);
              fetchHrs();
            } catch (err: any) {
              Alert.alert(
                "Action Failed",
                err?.response?.data?.message || `Failed to ${actionLabel.toLowerCase()} HR.`
              );
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = (hr: HrItem) => {
    Alert.alert(
      "Reset HR Password",
      `Issue a new temporary password and email it to ${hr.email}? The HR will be forced to change it upon next sign in.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Issue Temp Password",
          onPress: async () => {
            try {
              await API.post(`/admin/hrs/${hr.id}/reset-password`);
              Alert.alert(
                "Password Reset Sent",
                `A temporary password has been generated and emailed to ${hr.email}.`
              );
              fetchHrs();
            } catch (err: any) {
              Alert.alert(
                "Reset Failed",
                err?.response?.data?.message || "Failed to reset password."
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteHr = (hr: HrItem) => {
    Alert.alert(
      "Delete HR Account",
      `Are you sure you want to permanently delete "${hr.fullName}" from the company? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/admin/hrs/${hr.id}`);
              Alert.alert("HR Removed", `Account for ${hr.fullName} has been removed.`);
              fetchHrs();
            } catch (err: any) {
              Alert.alert(
                "Deletion Failed",
                err?.response?.data?.message || "Failed to delete HR account."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#173B7A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Manage HR Team</Text>
            <Text style={styles.headerSubtitle}>
              {hrs.length} HR {hrs.length === 1 ? "Officer" : "Officers"} Registered
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add HR</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filter Bar */}
        <View style={styles.filterSection}>
          <View style={styles.searchBar}>
            <Search size={18} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, or designation..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter Pills */}
          <View style={styles.pillRow}>
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((filter) => {
              const active = filterStatus === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setFilterStatus(filter)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {filter === "ALL"
                      ? `All (${hrs.length})`
                      : filter === "ACTIVE"
                      ? `Active (${hrs.filter((h) => h.active).length})`
                      : `Inactive (${hrs.filter((h) => !h.active).length})`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* HR Cards Scroll View */}
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#173B7A" />
            <Text style={styles.loadingText}>Loading HR Roster...</Text>
          </View>
        ) : (
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
            {filteredHrs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Users size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>
                  {searchQuery ? "No matching HRs found" : "No HR managers registered yet"}
                </Text>
                <Text style={styles.emptyDesc}>
                  {searchQuery
                    ? "Try adjusting your search criteria or clear the query filter."
                    : "Add HR personnel to manage day-to-day employee operations, leaves, attendance, and payroll."}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={styles.emptyAddBtn}
                    onPress={() => setShowCreateModal(true)}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.emptyAddBtnText}>Add New HR</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredHrs.map((hr) => (
                <View key={hr.id} style={styles.hrCard}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.avatar,
                          { backgroundColor: hr.active ? "#EFF6FF" : "#F1F5F9" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            { color: hr.active ? "#173B7A" : "#64748B" },
                          ]}
                        >
                          {hr.fullName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.cardHeaderMeta}>
                        <View style={styles.nameRow}>
                          <Text style={styles.hrName}>{hr.fullName}</Text>
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: hr.active ? "#DCFCE7" : "#FEE2E2",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: hr.active ? "#15803D" : "#B91C1C" },
                              ]}
                            >
                              {hr.active ? "Active" : "Deactivated"}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.hrDesignation}>
                          {hr.designation || "HR Officer"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Contact / Detail Grid */}
                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Mail size={14} color="#64748B" />
                      <Text style={styles.detailText}>{hr.email}</Text>
                    </View>
                    {hr.phoneNumber ? (
                      <View style={styles.detailRow}>
                        <Phone size={14} color="#64748B" />
                        <Text style={styles.detailText}>{hr.phoneNumber}</Text>
                      </View>
                    ) : null}
                    {hr.employeeId ? (
                      <View style={styles.detailRow}>
                        <Shield size={14} color="#64748B" />
                        <Text style={styles.detailText}>ID: {hr.employeeId}</Text>
                      </View>
                    ) : null}
                    {hr.passwordChangeRequired && (
                      <View style={styles.tempPassWarning}>
                        <Clock size={12} color="#D97706" />
                        <Text style={styles.tempPassText}>
                          Temporary password issued • Pending first-time password set
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Bar */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnFlex]}
                      onPress={() => openEditModal(hr)}
                      activeOpacity={0.7}
                    >
                      <SquarePen size={14} color="#173B7A" />
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnFlex]}
                      onPress={() => handleResetPassword(hr)}
                      activeOpacity={0.7}
                    >
                      <KeyRound size={14} color="#D97706" />
                      <Text style={[styles.actionBtnText, { color: "#D97706" }]} numberOfLines={1}>
                        Reset Pass
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        styles.actionBtnFlex,
                        {
                          backgroundColor: hr.active ? "#FEF2F2" : "#F0FDF4",
                          borderColor: hr.active ? "#FECACA" : "#BBF7D0",
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => handleToggleStatus(hr)}
                      activeOpacity={0.7}
                    >
                      {hr.active ? (
                        <>
                          <UserX size={14} color="#DC2626" />
                          <Text style={[styles.actionBtnText, { color: "#DC2626" }]} numberOfLines={1}>
                            Deactivate
                          </Text>
                        </>
                      ) : (
                        <>
                          <UserCheck size={14} color="#16A34A" />
                          <Text style={[styles.actionBtnText, { color: "#16A34A" }]} numberOfLines={1}>
                            Activate
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDeleteHr(hr)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        <BottomNav role={userRole} />
      </View>

      {/* CREATE HR MODAL */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add HR Manager</Text>
                <Text style={styles.modalSubtitle}>
                  Provision an HR account for your company
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <CustomInput
                label="Full Name *"
                placeholder="e.g. Johnathan Smith"
                value={createFullName}
                onChangeText={setCreateFullName}
              />

              <CustomInput
                label="Corporate Email *"
                placeholder="e.g. j.smith@company.com"
                value={createEmail}
                onChangeText={setCreateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomInput
                label="Contact Phone"
                placeholder="e.g. +91 9876543210"
                value={createPhone}
                onChangeText={setCreatePhone}
                keyboardType="phone-pad"
              />

              <CustomInput
                label="HR Designation"
                placeholder="e.g. Human Resources Manager"
                value={createDesignation}
                onChangeText={setCreateDesignation}
              />

              <CustomInput
                label="HR ID / Staff Code (Optional)"
                placeholder="Auto-generated if left blank"
                value={createEmployeeId}
                onChangeText={setCreateEmployeeId}
              />

              <PasswordInput
                label="Temporary Password (Optional)"
                placeholder="Auto-generated if left blank"
                value={createPassword}
                onChangeText={setCreatePassword}
              />

              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>
                  💡 An automated onboarding email with login credentials and a temporary password will be sent. The HR must choose their own permanent password on first login.
                </Text>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <CustomButton
                  title={createLoading ? "Creating..." : "Create Account"}
                  onPress={handleCreateHr}
                  loading={createLoading}
                  style={styles.modalSubmitBtn}
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* EDIT HR MODAL */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit HR Details</Text>
                <Text style={styles.modalSubtitle}>
                  Update profile for {selectedHr?.fullName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <CustomInput
                label="Full Name *"
                placeholder="Full name"
                value={editFullName}
                onChangeText={setEditFullName}
              />

              <CustomInput
                label="Corporate Email *"
                placeholder="Corporate email"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomInput
                label="Contact Phone"
                placeholder="Phone number"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />

              <CustomInput
                label="Designation"
                placeholder="e.g. HR Generalist"
                value={editDesignation}
                onChangeText={setEditDesignation}
              />

              <CustomInput
                label="Employee ID"
                placeholder="Employee ID"
                value={editEmployeeId}
                onChangeText={setEditEmployeeId}
              />

              <View style={styles.statusToggleRow}>
                <Text style={styles.statusToggleLabel}>Account Active Status</Text>
                <TouchableOpacity
                  style={[
                    styles.statusToggleButton,
                    { backgroundColor: editActive ? "#DCFCE7" : "#FEE2E2" },
                  ]}
                  onPress={() => setEditActive(!editActive)}
                >
                  <Text
                    style={[
                      styles.statusToggleText,
                      { color: editActive ? "#15803D" : "#B91C1C" },
                    ]}
                  >
                    {editActive ? "ACTIVE" : "INACTIVE"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <CustomButton
                  title={editLoading ? "Saving..." : "Save Changes"}
                  onPress={handleUpdateHr}
                  loading={editLoading}
                  style={styles.modalSubmitBtn}
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
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
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#173B7A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    padding: 0,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  pillActive: {
    backgroundColor: "#173B7A",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyDesc: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#173B7A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 6,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  hrCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "700",
  },
  cardHeaderMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hrName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  hrDesignation: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
    marginTop: 2,
  },
  cardDetails: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: "#475569",
  },
  tempPassWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    backgroundColor: "#FEF3C7",
    padding: 6,
    borderRadius: 6,
  },
  tempPassText: {
    fontSize: 11,
    color: "#B45309",
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
  },
  actionBtnFlex: {
    flex: 1,
    minWidth: 80,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#173B7A",
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    minWidth: 36,
    flexGrow: 0,
    flexShrink: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "88%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  noticeBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  noticeText: {
    fontSize: 12,
    color: "#166534",
    lineHeight: 17,
  },
  statusToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  statusToggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  statusToggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  modalSubmitBtn: {
    flex: 2,
    backgroundColor: "#173B7A",
  },
});
