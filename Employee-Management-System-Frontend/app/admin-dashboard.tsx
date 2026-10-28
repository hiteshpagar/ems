import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react-native";

import API from "../services/api";
import BottomNav from "../components/BottomNav";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import PasswordInput from "../components/PasswordInput";
import ScreenWrapper from "../components/ScreenWrapper";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius } from "../constants/theme";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidUrl,
} from "../utils/validators";

interface CompanyOverview {
  companyId: number;
  companyName: string;
  companyCode: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  industry: string;
  registrationNumber: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  totalHrs: number;
  activeHrs: number;
  totalEmployees: number;
  createdAt: string;
}

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

export default function AdminDashboardScreen() {
  const { userName, userEmail, userRole, logout } = useContext(AuthContext);

  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [hrs, setHrs] = useState<HrItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quick Add HR Modal
  const [showAddHrModal, setShowAddHrModal] = useState(false);
  const [hrFullName, setHrFullName] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [hrPhone, setHrPhone] = useState("");
  const [hrDesignation, setHrDesignation] = useState("HR Manager");
  const [hrEmployeeId, setHrEmployeeId] = useState("");
  const [hrPassword, setHrPassword] = useState("");
  const [addHrLoading, setAddHrLoading] = useState(false);

  // Edit Company Profile Modal
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [compPhone, setCompPhone] = useState("");
  const [compAddress, setCompAddress] = useState("");
  const [compWebsite, setCompWebsite] = useState("");
  const [compIndustry, setCompIndustry] = useState("");
  const [compCity, setCompCity] = useState("");
  const [compState, setCompState] = useState("");
  const [compPostalCode, setCompPostalCode] = useState("");
  const [compCountry, setCompCountry] = useState("India");
  const [editCompLoading, setEditCompLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [overviewRes, hrsRes] = await Promise.all([
        API.get("/admin/overview"),
        API.get("/admin/hrs"),
      ]);

      setOverview(overviewRes.data);
      setHrs(hrsRes.data || []);
    } catch (err: any) {
      console.log("Failed to load admin dashboard:", err);
      Alert.alert(
        "Loading Error",
        err?.response?.data?.message || "Failed to load company overview."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to end your administrator session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const openEditCompanyModal = () => {
    if (!overview) return;
    setCompPhone(overview.phone || "");
    setCompAddress(overview.address || "");
    setCompWebsite(overview.website || "");
    setCompIndustry(overview.industry || "IT & Software");
    setCompCity(overview.city || "");
    setCompState(overview.state || "");
    setCompPostalCode(overview.postalCode || "");
    setCompCountry(overview.country || "India");
    setShowEditCompanyModal(true);
  };

  const handleUpdateCompany = async () => {
    if (compPhone.trim() && !isValidPhone(compPhone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number (10-15 digits).");
      return;
    }

    if (compWebsite.trim() && !isValidUrl(compWebsite.trim())) {
      Alert.alert("Invalid Website", "Please enter a valid website URL (e.g. https://company.com).");
      return;
    }

    try {
      setEditCompLoading(true);
      await API.put("/admin/company", {
        phone: compPhone.trim() || undefined,
        address: compAddress.trim() || undefined,
        website: compWebsite.trim() || undefined,
        industry: compIndustry.trim() || undefined,
        city: compCity.trim() || undefined,
        state: compState.trim() || undefined,
        postalCode: compPostalCode.trim() || undefined,
        country: compCountry.trim() || "India",
      });

      Alert.alert("Company Profile Updated", "Your company details have been successfully saved.");
      setShowEditCompanyModal(false);
      loadDashboard();
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err?.response?.data?.message || "Could not update company profile."
      );
    } finally {
      setEditCompLoading(false);
    }
  };

  const handleCreateHr = async () => {
    const trimmedName = hrFullName.trim();
    if (!trimmedName || !isValidName(trimmedName)) {
      Alert.alert("Invalid Name", "HR full name must be at least 2 characters.");
      return;
    }

    const trimmedEmail = hrEmail.trim().toLowerCase();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid corporate email address.");
      return;
    }

    if (hrPhone.trim() && !isValidPhone(hrPhone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid contact phone number.");
      return;
    }

    if (hrPassword && hrPassword.length < 6) {
      Alert.alert("Weak Password", "Temporary password must be at least 6 characters.");
      return;
    }

    try {
      setAddHrLoading(true);
      const res = await API.post("/admin/hrs", {
        fullName: trimmedName,
        email: trimmedEmail,
        phoneNumber: hrPhone.trim() || undefined,
        designation: hrDesignation.trim() || "HR Manager",
        employeeId: hrEmployeeId.trim() || undefined,
        password: hrPassword || undefined,
      });

      Alert.alert(
        "HR Account Created",
        `HR account for "${res.data.fullName}" provisioned successfully. An onboarding email with login credentials has been sent to ${trimmedEmail}.`
      );

      setShowAddHrModal(false);
      setHrFullName("");
      setHrEmail("");
      setHrPhone("");
      setHrDesignation("HR Manager");
      setHrEmployeeId("");
      setHrPassword("");
      loadDashboard();
    } catch (err: any) {
      Alert.alert(
        "Creation Failed",
        err?.response?.data?.message || "Failed to create HR account."
      );
    } finally {
      setAddHrLoading(false);
    }
  };

  const handleToggleHrStatus = (hr: HrItem) => {
    const nextStatus = !hr.active;
    const actionLabel = nextStatus ? "Activate" : "Deactivate";

    Alert.alert(
      `${actionLabel} HR`,
      `Are you sure you want to ${actionLabel.toLowerCase()} access for ${hr.fullName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: actionLabel,
          style: nextStatus ? "default" : "destructive",
          onPress: async () => {
            try {
              await API.patch(`/admin/hrs/${hr.id}/status?active=${nextStatus}`);
              loadDashboard();
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

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#173B7A" />
          <Text style={styles.loadingText}>Loading Company Console...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const initialLetter = userName ? userName.charAt(0).toUpperCase() : "A";

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialLetter}</Text>
            </View>
            <View style={styles.headerTitleCol}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>COMPANY ADMINISTRATOR</Text>
              </View>
              <Text style={styles.headerName} numberOfLines={1}>
                {userName || "Company Administrator"}
              </Text>
              <Text style={styles.headerEmail} numberOfLines={1}>
                {overview?.companyName || userEmail || "Company Workspace"}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push("/notifications")}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Bell size={18} color="#D97706" strokeWidth={2.2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.7}
              accessibilityLabel="Sign out"
            >
              <LogOut size={18} color="#DC2626" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>

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
          {/* Company Identity Hero Banner */}
          <LinearGradient
            colors={["#0E2A5D", "#173B7A", "#1E4E9E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadgeRow}>
                <Building2 size={15} color="#93C5FD" />
                <Text style={styles.heroBadgeText}>
                  {overview?.companyCode ? `CODE: ${overview.companyCode}` : "ENTERPRISE"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.heroEditBtn}
                onPress={openEditCompanyModal}
                activeOpacity={0.8}
              >
                <Text style={styles.heroEditBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.heroTitle}>{overview?.companyName || "Your Company"}</Text>
            <Text style={styles.heroSubtitle}>
              {overview?.industry ? `${overview.industry} • ` : ""}
              {overview?.city ? `${overview.city}, ` : ""}
              {overview?.country || "India"}
            </Text>

            <View style={styles.heroDivider} />

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>HR Managers</Text>
                <Text style={styles.heroStatValue}>{overview?.totalHrs ?? 0}</Text>
              </View>
              <View style={styles.heroStatSep} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Active HRs</Text>
                <Text style={[styles.heroStatValue, { color: "#34D399" }]}>
                  {overview?.activeHrs ?? 0}
                </Text>
              </View>
              <View style={styles.heroStatSep} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Total Staff</Text>
                <Text style={styles.heroStatValue}>{overview?.totalEmployees ?? 0}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Primary Actions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Administration Controls</Text>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#173B7A" }]}
              onPress={() => router.push("/manage-hrs" as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBox, { backgroundColor: "#EFF6FF" }]}>
                <ShieldCheck size={22} color="#173B7A" />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>Manage HRs</Text>
                <Text style={styles.actionDesc}>Directory, permissions & credentials</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#059669" }]}
              onPress={() => setShowAddHrModal(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBox, { backgroundColor: "#ECFDF5" }]}>
                <Plus size={22} color="#059669" />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>Provision New HR</Text>
                <Text style={styles.actionDesc}>Invite HR manager with temp password</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: "#2563EB" }]}
              onPress={openEditCompanyModal}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBox, { backgroundColor: "#F0F9FF" }]}>
                <Building2 size={22} color="#0284C7" />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>Company Profile</Text>
                <Text style={styles.actionDesc}>Contact, address & corporate website</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* HR Management Roster Overview */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTitles}>
              <Text style={styles.sectionTitle}>HR Team ({hrs.length})</Text>
              <Text style={styles.sectionSubtitle}>
                Personnel authorized to manage employees, leaves & payroll
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => router.push("/manage-hrs" as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={14} color="#173B7A" />
            </TouchableOpacity>
          </View>

          {hrs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Users size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No HR Managers Registered Yet</Text>
              <Text style={styles.emptyDesc}>
                Add your first HR officer to begin delegating employee onboarding, attendance, and leave management.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => setShowAddHrModal(true)}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.emptyAddBtnText}>Add First HR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.hrList}>
              {hrs.slice(0, 5).map((hr) => (
                <View key={hr.id} style={styles.hrCard}>
                  <View style={styles.hrCardLeft}>
                    <View
                      style={[
                        styles.hrAvatar,
                        { backgroundColor: hr.active ? "#EFF6FF" : "#F1F5F9" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.hrAvatarText,
                          { color: hr.active ? "#173B7A" : "#64748B" },
                        ]}
                      >
                        {hr.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.hrMeta}>
                      <View style={styles.hrNameRow}>
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
                            {hr.active ? "Active" : "Inactive"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.hrEmail}>{hr.email}</Text>
                      <View style={styles.hrSubRow}>
                        <Text style={styles.hrDesignation}>
                          {hr.designation || "HR Manager"}
                        </Text>
                        {hr.employeeId ? (
                          <Text style={styles.hrEmpId}>• ID: {hr.employeeId}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.hrStatusActionBtn,
                      {
                        backgroundColor: hr.active ? "#FEF2F2" : "#F0FDF4",
                        borderColor: hr.active ? "#FECACA" : "#BBF7D0",
                      },
                    ]}
                    onPress={() => handleToggleHrStatus(hr)}
                    activeOpacity={0.7}
                  >
                    {hr.active ? (
                      <UserX size={15} color="#DC2626" />
                    ) : (
                      <UserCheck size={15} color="#16A34A" />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Company Details Snapshot */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Company Information</Text>
          </View>

          <View style={styles.companyInfoCard}>
            <View style={styles.infoRow}>
              <Mail size={16} color="#64748B" />
              <Text style={styles.infoLabel}>Contact Email:</Text>
              <Text style={styles.infoValue}>{overview?.email || "Not set"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Phone size={16} color="#64748B" />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{overview?.phone || "Not set"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Globe size={16} color="#64748B" />
              <Text style={styles.infoLabel}>Website:</Text>
              <Text style={styles.infoValue}>{overview?.website || "Not set"}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#64748B" />
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>
                {[overview?.address, overview?.city, overview?.state, overview?.country]
                  .filter(Boolean)
                  .join(", ") || "Not set"}
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <BottomNav role={userRole} />
      </View>

      {/* QUICK ADD HR MODAL */}
      <Modal
        visible={showAddHrModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddHrModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Provision HR Manager</Text>
                <Text style={styles.modalSubtitle}>
                  Add an HR officer to {overview?.companyName || "your company"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddHrModal(false)}
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
                placeholder="e.g. Sarah Jenkins"
                value={hrFullName}
                onChangeText={setHrFullName}
              />

              <CustomInput
                label="Corporate Email *"
                placeholder="e.g. sarah.hr@company.com"
                value={hrEmail}
                onChangeText={setHrEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomInput
                label="Phone Number"
                placeholder="e.g. +91 9876543210"
                value={hrPhone}
                onChangeText={setHrPhone}
                keyboardType="phone-pad"
              />

              <CustomInput
                label="HR Designation"
                placeholder="e.g. Senior HR Manager"
                value={hrDesignation}
                onChangeText={setHrDesignation}
              />

              <CustomInput
                label="HR Employee ID (Optional)"
                placeholder="Auto-generated if left blank"
                value={hrEmployeeId}
                onChangeText={setHrEmployeeId}
              />

              <PasswordInput
                label="Temporary Password (Optional)"
                placeholder="Auto-generated if left blank"
                value={hrPassword}
                onChangeText={setHrPassword}
              />

              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>
                  💡 An automated onboarding email with login credentials and a temporary password will be sent. The HR must choose their permanent password upon first sign in.
                </Text>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowAddHrModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <CustomButton
                  title={addHrLoading ? "Provisioning..." : "Create HR Account"}
                  onPress={handleCreateHr}
                  loading={addHrLoading}
                  style={styles.modalSubmitBtn}
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* EDIT COMPANY PROFILE MODAL */}
      <Modal
        visible={showEditCompanyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditCompanyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Company Profile</Text>
                <Text style={styles.modalSubtitle}>
                  Update organization details & address
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEditCompanyModal(false)}
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
                label="Corporate Phone"
                placeholder="e.g. +91 22 2847 1000"
                value={compPhone}
                onChangeText={setCompPhone}
                keyboardType="phone-pad"
              />

              <CustomInput
                label="Official Website"
                placeholder="e.g. https://company.com"
                value={compWebsite}
                onChangeText={setCompWebsite}
                autoCapitalize="none"
              />

              <CustomInput
                label="Industry / Sector"
                placeholder="e.g. Financial Services"
                value={compIndustry}
                onChangeText={setCompIndustry}
              />

              <CustomInput
                label="Corporate Address"
                placeholder="Street address, building, suite"
                value={compAddress}
                onChangeText={setCompAddress}
              />

              <View style={styles.twoCol}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <CustomInput
                    label="City"
                    placeholder="e.g. Mumbai"
                    value={compCity}
                    onChangeText={setCompCity}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <CustomInput
                    label="State"
                    placeholder="e.g. Maharashtra"
                    value={compState}
                    onChangeText={setCompState}
                  />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <CustomInput
                    label="Postal Code"
                    placeholder="e.g. 400001"
                    value={compPostalCode}
                    onChangeText={setCompPostalCode}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <CustomInput
                    label="Country"
                    placeholder="e.g. India"
                    value={compCountry}
                    onChangeText={setCompCountry}
                  />
                </View>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowEditCompanyModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <CustomButton
                  title={editCompLoading ? "Saving..." : "Save Profile"}
                  onPress={handleUpdateCompany}
                  loading={editCompLoading}
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
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#173B7A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerTitleCol: {
    flex: 1,
  },
  roleBadge: {
    backgroundColor: "#FEF2F2",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#DC2626",
    letterSpacing: 0.5,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerEmail: {
    fontSize: 12,
    color: "#64748B",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#0E2A5D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  heroEditBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroEditBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#BFDBFE",
    marginBottom: 14,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    marginBottom: 12,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  heroStatItem: {
    alignItems: "center",
  },
  heroStatLabel: {
    fontSize: 11,
    color: "#BFDBFE",
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroStatSep: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
    gap: 12,
  },
  sectionHeaderTitles: {
    flex: 1,
    paddingRight: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    flexShrink: 0,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#173B7A",
  },
  actionGrid: {
    gap: 10,
    marginBottom: 8,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: "#64748B",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
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
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  hrList: {
    gap: 10,
  },
  hrCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  hrCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  hrAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  hrAvatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  hrMeta: {
    flex: 1,
  },
  hrNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  hrName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  hrEmail: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  hrSubRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  hrDesignation: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E40AF",
  },
  hrEmpId: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: 4,
  },
  hrStatusActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  companyInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    width: 110,
  },
  infoValue: {
    fontSize: 13,
    color: "#0F172A",
    flex: 1,
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
  twoCol: {
    flexDirection: "row",
    alignItems: "center",
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
