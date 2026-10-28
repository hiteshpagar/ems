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
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Hash,
  Mail,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  SquarePen,
  Tag,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
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
  isValidCompanyCode,
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidUrl,
} from "../utils/validators";

interface CompanyItem {
  id: number;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  registrationNumber?: string;
  industry?: string;
  website?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  totalAdmins?: number;
  totalEmployees?: number;
  createdAt?: string;
}

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
}

const INDUSTRY_PRESETS = [
  "IT & Software",
  "Manufacturing",
  "Healthcare",
  "Finance & Banking",
  "Retail & E-commerce",
  "Consulting & Services",
  "Logistics & Supply",
  "Education",
  "Other",
];

const DESIGNATION_PRESETS = [
  "Company Owner",
  "Founder & CEO",
  "Managing Director",
  "Chief Operations Officer",
  "HR Director",
  "Company Administrator",
];

export default function ManageCompaniesScreen() {
  const { userRole } = useContext(AuthContext);

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Expanded company ID to view assigned admins
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(null);
  const [companyAdmins, setCompanyAdmins] = useState<AdminItem[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Modal 1: Comprehensive Register Company & Primary Owner State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState("");
  const [regCode, setRegCode] = useState("");
  const [regRegNumber, setRegRegNumber] = useState("");
  const [regIndustry, setRegIndustry] = useState("IT & Software");
  const [regWebsite, setRegWebsite] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regState, setRegState] = useState("");
  const [regPostalCode, setRegPostalCode] = useState("");
  const [regCountry, setRegCountry] = useState("India");

  // Initial Company Owner State
  const [regAssignOwner, setRegAssignOwner] = useState(true);
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regOwnerDesignation, setRegOwnerDesignation] = useState("Company Owner");
  const [regOwnerEmail, setRegOwnerEmail] = useState("");
  const [regOwnerPhone, setRegOwnerPhone] = useState("");
  const [regOwnerEmployeeId, setRegOwnerEmployeeId] = useState("");
  const [regOwnerPassword, setRegOwnerPassword] = useState("");
  const [regOwnerConfirmPassword, setRegOwnerConfirmPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Modal 2: Edit Company Details
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editRegNumber, setEditRegNumber] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Modal 3: Add Admin/Owner to Existing Company
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [targetCompany, setTargetCompany] = useState<CompanyItem | null>(null);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminDesignation, setAdminDesignation] = useState("Company Owner");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminEmployeeId, setAdminEmployeeId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await API.get("/super-admin/companies");
      setCompanies(res.data || []);
    } catch (err: any) {
      console.log("Error loading companies:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCompanies();
  };

  const resetRegForm = () => {
    setRegName("");
    setRegCode("");
    setRegRegNumber("");
    setRegIndustry("IT & Software");
    setRegWebsite("");
    setRegEmail("");
    setRegPhone("");
    setRegAddress("");
    setRegCity("");
    setRegState("");
    setRegPostalCode("");
    setRegCountry("India");
    setRegAssignOwner(true);
    setRegOwnerName("");
    setRegOwnerDesignation("Company Owner");
    setRegOwnerEmail("");
    setRegOwnerPhone("");
    setRegOwnerEmployeeId("");
    setRegOwnerPassword("");
    setRegOwnerConfirmPassword("");
  };

  const handleToggleExpand = async (company: CompanyItem) => {
    if (expandedCompanyId === company.id) {
      setExpandedCompanyId(null);
      setCompanyAdmins([]);
      return;
    }

    setExpandedCompanyId(company.id);
    setLoadingAdmins(true);
    try {
      const res = await API.get(`/super-admin/companies/${company.id}/admins`);
      setCompanyAdmins(res.data || []);
    } catch (error) {
      console.log("Failed to fetch company admins:", error);
      setCompanyAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Register New Company with Full Details & Optional Primary Owner
  const handleRegisterCompany = async () => {
    const trimmedName = regName.trim();
    if (!trimmedName || !isValidName(trimmedName)) {
      Alert.alert("Invalid Name", "Company legal name must be at least 2 characters.");
      return;
    }

    if (regCode.trim() && !isValidCompanyCode(regCode.trim())) {
      Alert.alert(
        "Invalid Company Code",
        "Company code must be 2 to 12 alphanumeric characters without spaces (e.g. ACME, TECH)."
      );
      return;
    }

    if (regEmail.trim() && !isValidEmail(regEmail.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid company contact email (e.g. info@company.com).");
      return;
    }

    if (regPhone.trim() && !isValidPhone(regPhone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid corporate phone number (7 to 15 digits).");
      return;
    }

    if (regWebsite.trim() && !isValidUrl(regWebsite.trim())) {
      Alert.alert("Invalid Website", "Please enter a valid website URL (e.g. https://company.com).");
      return;
    }

    if (regAssignOwner) {
      const trimmedOwnerName = regOwnerName.trim();
      const trimmedOwnerEmail = regOwnerEmail.trim().toLowerCase();
      if (!trimmedOwnerName || !trimmedOwnerEmail || !regOwnerPassword) {
        Alert.alert(
          "Owner Information Required",
          "Please enter the Primary Company Owner Name, Login Email, and Temporary Password."
        );
        return;
      }
      if (!isValidName(trimmedOwnerName)) {
        Alert.alert("Invalid Owner Name", "Owner full name must be at least 2 characters.");
        return;
      }
      if (!isValidEmail(trimmedOwnerEmail)) {
        Alert.alert("Invalid Owner Email", "Please enter a valid email address for the owner (e.g. owner@company.com).");
        return;
      }
      if (regOwnerPassword.length < 6) {
        Alert.alert("Password Too Short", "Owner temporary password must be at least 6 characters.");
        return;
      }
      if (regOwnerPassword !== regOwnerConfirmPassword) {
        Alert.alert("Password Mismatch", "Passwords do not match.");
        return;
      }
      if (regOwnerPhone.trim() && !isValidPhone(regOwnerPhone.trim())) {
        Alert.alert("Invalid Phone", "Please enter a valid phone number for the owner.");
        return;
      }
    }

    try {
      setRegLoading(true);
      // 1. Register detailed company in database
      let newCompany: any = null;
      try {
        const compRes = await API.post("/super-admin/companies", {
          name: trimmedName,
          code: regCode.trim() || undefined,
          registrationNumber: regRegNumber.trim() || undefined,
          industry: regIndustry.trim() || undefined,
          website: regWebsite.trim() || undefined,
          email: regEmail.trim().toLowerCase() || undefined,
          phone: regPhone.trim() || undefined,
          address: regAddress.trim() || undefined,
          city: regCity.trim() || undefined,
          state: regState.trim() || undefined,
          postalCode: regPostalCode.trim() || undefined,
          country: regCountry.trim() || "India",
        });
        newCompany = compRes.data;
      } catch (compErr: any) {
        Alert.alert(
          "Company Registration Failed",
          compErr?.response?.data?.message || "Could not register company."
        );
        return;
      }

      // 2. If assign owner checked, immediately provision the owner bound to this company
      if (regAssignOwner && newCompany?.id) {
        try {
          await API.post("/super-admin/admins", {
            fullName: regOwnerName.trim(),
            email: regOwnerEmail.trim().toLowerCase(),
            password: regOwnerPassword,
            companyId: newCompany.id,
            designation: regOwnerDesignation.trim() || "Company Owner",
            phoneNumber: regOwnerPhone.trim() || undefined,
            employeeId: regOwnerEmployeeId.trim() || undefined,
          });

          Alert.alert(
            "Company & Owner Registered",
            `Company "${trimmedName}" registered with complete corporate details. An onboarding email with login credentials and temporary password has been dispatched to ${regOwnerEmail.trim().toLowerCase()}.`
          );
        } catch (adminErr: any) {
          const adminMsg = adminErr?.response?.data?.message || "Could not provision owner.";
          Alert.alert(
            "Company Created (Owner Assignment Pending)",
            `Company "${trimmedName}" was created successfully. However, owner assignment could not be completed:\n\n${adminMsg}\n\nYou can assign an owner at any time directly from the company card.`
          );
        }
      } else {
        Alert.alert(
          "Company Registered",
          `Company "${trimmedName}" registered with full corporate profile.`
        );
      }

      setShowRegisterModal(false);
      resetRegForm();
      fetchCompanies();
    } catch (error: any) {
      Alert.alert(
        "Unexpected Error",
        error?.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setRegLoading(false);
    }
  };

  // Open Edit Modal with all company attributes
  const openEditCompanyModal = (company: CompanyItem) => {
    setSelectedCompany(company);
    setEditName(company.name || "");
    setEditCode(company.code || "");
    setEditRegNumber(company.registrationNumber || "");
    setEditIndustry(company.industry || "IT & Software");
    setEditWebsite(company.website || "");
    setEditEmail(company.email || "");
    setEditPhone(company.phone || "");
    setEditAddress(company.address || "");
    setEditCity(company.city || "");
    setEditState(company.state || "");
    setEditPostalCode(company.postalCode || "");
    setEditCountry(company.country || "India");
    setShowEditModal(true);
  };

  // Update Company
  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;
    const trimmedName = editName.trim();
    if (!trimmedName || !isValidName(trimmedName)) {
      Alert.alert("Invalid Name", "Company legal name must be at least 2 characters.");
      return;
    }

    if (editCode.trim() && !isValidCompanyCode(editCode.trim())) {
      Alert.alert(
        "Invalid Company Code",
        "Company code must be 2 to 12 alphanumeric characters without spaces (e.g. ACME, TECH)."
      );
      return;
    }

    if (editEmail.trim() && !isValidEmail(editEmail.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid company contact email (e.g. info@company.com).");
      return;
    }

    if (editPhone.trim() && !isValidPhone(editPhone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid corporate phone number (7 to 15 digits).");
      return;
    }

    if (editWebsite.trim() && !isValidUrl(editWebsite.trim())) {
      Alert.alert("Invalid Website", "Please enter a valid website URL (e.g. https://company.com).");
      return;
    }

    try {
      setEditLoading(true);
      await API.put(`/super-admin/companies/${selectedCompany.id}`, {
        name: trimmedName,
        code: editCode.trim() || undefined,
        registrationNumber: editRegNumber.trim() || undefined,
        industry: editIndustry.trim() || undefined,
        website: editWebsite.trim() || undefined,
        email: editEmail.trim() || undefined,
        phone: editPhone.trim() || undefined,
        address: editAddress.trim() || undefined,
        city: editCity.trim() || undefined,
        state: editState.trim() || undefined,
        postalCode: editPostalCode.trim() || undefined,
        country: editCountry.trim() || undefined,
      });

      Alert.alert("Success", "Company profile updated successfully.");
      setShowEditModal(false);
      fetchCompanies();
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error?.response?.data?.message || "Could not update company."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Company
  const handleDeleteCompany = (company: CompanyItem) => {
    if ((company.totalAdmins && company.totalAdmins > 0) || (company.totalEmployees && company.totalEmployees > 0)) {
      Alert.alert(
        "Cannot Delete Active Company",
        `"${company.name}" has ${company.totalAdmins || 0} administrator(s) and ${company.totalEmployees || 0} employee(s). All members must be removed or reassigned before this company can be deregistered.`
      );
      return;
    }

    Alert.alert(
      "Unregister Company",
      `Are you sure you want to remove "${company.name}"? This will deregister the company.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove Company",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/super-admin/companies/${company.id}`);
              Alert.alert("Removed", `Company "${company.name}" has been removed.`);
              fetchCompanies();
            } catch (error: any) {
              Alert.alert(
                "Action Prohibited",
                error?.response?.data?.message || "Could not remove company."
              );
            }
          },
        },
      ]
    );
  };

  // Open Add Admin Modal for specific company
  const openAddAdminForCompany = (company: CompanyItem) => {
    setTargetCompany(company);
    setAdminName("");
    setAdminEmail("");
    setAdminDesignation("Company Owner");
    setAdminPhone("");
    setAdminEmployeeId("");
    setAdminPassword("");
    setAdminConfirmPassword("");
    setShowAddAdminModal(true);
  };

  // Provision Admin for Company
  const handleCreateAdminForCompany = async () => {
    if (!targetCompany) return;
    const trimmedName = adminName.trim();
    const trimmedEmail = adminEmail.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !adminPassword) {
      Alert.alert("Missing Credentials", "Full Name, Work Email, and Temporary Password are required.");
      return;
    }
    if (!isValidName(trimmedName)) {
      Alert.alert("Invalid Name", "Full Name must be at least 2 characters.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid corporate email address (e.g. admin@company.com).");
      return;
    }
    if (adminPassword.length < 6) {
      Alert.alert("Password Length", "Password must be at least 6 characters.");
      return;
    }
    if (adminPassword !== adminConfirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    if (adminPhone.trim() && !isValidPhone(adminPhone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number (7 to 15 digits).");
      return;
    }

    try {
      setAdminLoading(true);
      await API.post("/super-admin/admins", {
        fullName: trimmedName,
        email: trimmedEmail,
        password: adminPassword,
        companyId: targetCompany.id,
        designation: adminDesignation.trim() || "Company Owner",
        phoneNumber: adminPhone.trim() || undefined,
        employeeId: adminEmployeeId.trim() || undefined,
      });

      Alert.alert(
        "Administrator Assigned",
        `Admin / Company Owner "${trimmedName}" provisioned successfully for ${targetCompany.name}. An onboarding email with temporary credentials has been sent to ${trimmedEmail}.`
      );
      setShowAddAdminModal(false);
      fetchCompanies();
      if (expandedCompanyId === targetCompany.id) {
        handleToggleExpand(targetCompany);
      }
    } catch (error: any) {
      Alert.alert(
        "Provisioning Failed",
        error?.response?.data?.message || "Could not add administrator."
      );
    } finally {
      setAdminLoading(false);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.industry && c.industry.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  return (
    <ScreenWrapper>
      {/* Top Header - Guaranteed 100% width, no text truncation */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/super-admin-dashboard")}
            activeOpacity={0.7}
            accessibilityLabel="Back to console"
          >
            <ArrowLeft size={18} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>
              Client Enterprises
            </Text>
            <Text style={styles.headerSubtitle}>
              {companies.length} Registered {companies.length === 1 ? "Enterprise" : "Enterprises"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={fetchCompanies}
          activeOpacity={0.7}
          accessibilityLabel="Refresh list"
        >
          <RotateCcw size={16} color="#475569" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#173B7A" />
        }
      >
        {/* Register Company Hero Action Button */}
        <TouchableOpacity
          style={styles.registerHeroBtn}
          onPress={() => setShowRegisterModal(true)}
          activeOpacity={0.88}
        >
          <View style={styles.registerHeroLeft}>
            <View style={styles.registerHeroIconCircle}>
              <Plus size={20} color="#FFFFFF" strokeWidth={2.6} />
            </View>
            <View style={styles.registerHeroTextCol}>
              <Text style={styles.registerHeroTitle}>Register Company</Text>
              <Text style={styles.registerHeroSubtitle}>
                Add corporate profile & provision initial administrator
              </Text>
            </View>
          </View>
          <View style={styles.registerHeroBadge}>
            <ChevronRight size={16} color="#173B7A" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#94A3B8" strokeWidth={2.2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search enterprise by name, code, industry, city..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#173B7A" />
            <Text style={styles.loadingText}>Loading registered enterprises...</Text>
          </View>
        ) : filteredCompanies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Building2 size={36} color="#94A3B8" strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>
              {search ? "No matching companies found" : "No enterprises registered yet"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? `No company matches "${search}". Try searching another name or code.`
                : "Register client companies to securely establish multi-tenant workspaces and provision company owners."}
            </Text>
            {!search && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => setShowRegisterModal(true)}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.emptyBtnText}>Register First Company</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredCompanies.map((company) => {
            const isExpanded = expandedCompanyId === company.id;
            const fullAddress = [company.address, company.city, company.state, company.country]
              .filter(Boolean)
              .join(", ");
            const hasOwner = Boolean(company.totalAdmins && company.totalAdmins > 0);

            return (
              <View key={company.id} style={styles.companyCard}>
                {/* Company Header Row */}
                <View style={styles.companyHeader}>
                  <View style={styles.companyIconBox}>
                    <Building2 size={24} color="#1D4ED8" strokeWidth={2.2} />
                  </View>
                  <View style={styles.companyInfo}>
                    <View style={styles.companyTitleRow}>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {company.name}
                      </Text>
                      {company.code ? (
                        <View style={styles.codePill}>
                          <Text style={styles.codePillText}>{company.code}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Metadata Badges Strip */}
                    <View style={styles.metaBadgesRow}>
                      <View style={styles.statusPillActive}>
                        <View style={styles.statusDotActive} />
                        <Text style={styles.statusPillTextActive}>Active Tenant</Text>
                      </View>
                      {company.industry ? (
                        <View style={styles.industryBadge}>
                          <Tag size={10} color="#047857" strokeWidth={2} />
                          <Text style={styles.industryBadgeText}>{company.industry}</Text>
                        </View>
                      ) : null}
                      {company.registrationNumber ? (
                        <View style={styles.regBadge}>
                          <Hash size={10} color="#4338CA" strokeWidth={2} />
                          <Text style={styles.regBadgeText} numberOfLines={1}>
                            {company.registrationNumber}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Actions: Edit & Delete */}
                  <View style={styles.cardTopActions}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => openEditCompanyModal(company)}
                      activeOpacity={0.7}
                      accessibilityLabel="Edit company"
                    >
                      <SquarePen size={15} color="#2563EB" strokeWidth={2.2} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionIconBtn, { backgroundColor: "#FEF2F2" }]}
                      onPress={() => handleDeleteCompany(company)}
                      activeOpacity={0.7}
                      accessibilityLabel="Delete company"
                    >
                      <Trash2 size={15} color="#DC2626" strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Company Contact & Location Details */}
                {(company.email || company.phone || fullAddress || company.website) ? (
                  <View style={styles.companyDetailsGrid}>
                    {company.email ? (
                      <View style={styles.detailRow}>
                        <Mail size={13} color="#64748B" strokeWidth={2} />
                        <Text style={styles.detailText} numberOfLines={1}>
                          {company.email}
                        </Text>
                      </View>
                    ) : null}

                    {company.phone ? (
                      <View style={styles.detailRow}>
                        <Phone size={13} color="#64748B" strokeWidth={2} />
                        <Text style={styles.detailText} numberOfLines={1}>
                          {company.phone}
                        </Text>
                      </View>
                    ) : null}

                    {fullAddress ? (
                      <View style={styles.detailRow}>
                        <MapPin size={13} color="#64748B" strokeWidth={2} />
                        <Text style={styles.detailText} numberOfLines={1}>
                          {fullAddress}
                        </Text>
                      </View>
                    ) : null}

                    {company.website ? (
                      <View style={styles.detailRow}>
                        <Globe size={13} color="#2563EB" strokeWidth={2} />
                        <Text style={[styles.detailText, { color: "#2563EB" }]} numberOfLines={1}>
                          {company.website}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {/* Governance Summary & Provision Action - Employee count removed */}
                <View style={styles.companyFooter}>
                  {hasOwner ? (
                    <View style={styles.ownerStatBadge}>
                      <ShieldCheck size={13} color="#1E40AF" strokeWidth={2.2} />
                      <Text style={styles.ownerStatText}>
                        {company.totalAdmins} {company.totalAdmins === 1 ? "Admin / Owner Active" : "Admins / Owners Active"}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.noOwnerWarningBadge}>
                      <AlertCircle size={13} color="#B45309" strokeWidth={2.2} />
                      <Text style={styles.noOwnerWarningText}>No Owner Assigned Yet</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.addOwnerBtn}
                    onPress={() => openAddAdminForCompany(company)}
                    activeOpacity={0.7}
                  >
                    <UserPlus size={13} color="#FFFFFF" strokeWidth={2.2} />
                    <Text style={styles.addOwnerBtnText}>+ Add Owner</Text>
                  </TouchableOpacity>
                </View>

                {/* Toggle Admins Drawer */}
                <View style={styles.expandDrawerRow}>
                  <TouchableOpacity
                    style={styles.expandToggleBtn}
                    onPress={() => handleToggleExpand(company)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.expandToggleText}>
                      {isExpanded ? "Hide Assigned Admins" : `View Assigned Admins (${company.totalAdmins ?? 0})`}
                    </Text>
                    {isExpanded ? (
                      <ChevronDown size={15} color="#1E40AF" strokeWidth={2.2} />
                    ) : (
                      <ChevronRight size={15} color="#1E40AF" strokeWidth={2.2} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Expanded Admins List for This Company */}
                {isExpanded && (
                  <View style={styles.adminsContainer}>
                    <Text style={styles.adminsSectionTitle}>
                      Assigned Administrators & Owners ({companyAdmins.length})
                    </Text>

                    {loadingAdmins ? (
                      <ActivityIndicator size="small" color="#173B7A" style={{ marginVertical: 10 }} />
                    ) : companyAdmins.length === 0 ? (
                      <View style={styles.emptyAdminsBox}>
                        <Text style={styles.emptyAdminsText}>
                          No administrators or company owners added yet.
                        </Text>
                        <TouchableOpacity
                          style={styles.inlineAddBtn}
                          onPress={() => openAddAdminForCompany(company)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.inlineAddBtnText}>+ Provision Primary Owner</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      companyAdmins.map((adm) => (
                        <View key={adm.id} style={styles.adminMiniCard}>
                          <View style={styles.adminAvatar}>
                            <Text style={styles.adminAvatarText}>
                              {adm.fullName ? adm.fullName.charAt(0).toUpperCase() : "A"}
                            </Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                              <Text style={styles.adminName}>{adm.fullName}</Text>
                              <View style={styles.roleBadge}>
                                <Text style={styles.roleBadgeText}>
                                  {adm.designation || "Company Owner"}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.adminEmail}>{adm.email}</Text>
                            {adm.phoneNumber ? (
                              <Text style={styles.adminPhone}>📞 {adm.phoneNumber}</Text>
                            ) : null}
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* MODAL 1: Comprehensive Register Company & Primary Owner */}
      <Modal
        visible={showRegisterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Building2 size={18} color="#173B7A" strokeWidth={2.4} />
                  <Text style={styles.modalTitle}>Register Client Enterprise</Text>
                </View>
                <Text style={styles.modalSubtitle}>
                  Save complete corporate details & provision initial company owner credentials.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowRegisterModal(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* SECTION A: CORPORATE & LEGAL DETAILS */}
              <View style={styles.formGroupCard}>
                <View style={styles.formGroupHeader}>
                  <Building2 size={16} color="#1E40AF" strokeWidth={2.2} />
                  <Text style={styles.formGroupTitle}>Corporate & Legal Information</Text>
                </View>

                <CustomInput
                  label="Company Legal Name *"
                  placeholder="Acme Technologies"
                  value={regName}
                  onChangeText={setRegName}
                />

                <CustomInput
                  label="Company Identifier Code *"
                  placeholder="ACME"
                  value={regCode}
                  onChangeText={setRegCode}
                  autoCapitalize="characters"
                  helperText="Unique uppercase identifier code"
                />

                <CustomInput
                  label="Registration / CIN / GSTIN / Tax ID"
                  placeholder="CIN / Tax ID"
                  value={regRegNumber}
                  onChangeText={setRegRegNumber}
                />

                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Industry / Sector</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
                    {INDUSTRY_PRESETS.map((ind) => {
                      const isSel = regIndustry === ind;
                      return (
                        <TouchableOpacity
                          key={ind}
                          style={[styles.presetChip, isSel && styles.presetChipActive]}
                          onPress={() => setRegIndustry(ind)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.presetChipText, isSel && styles.presetChipTextActive]}>
                            {ind}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <CustomInput
                  label="Company Website URL"
                  placeholder="company.com"
                  value={regWebsite}
                  onChangeText={setRegWebsite}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              {/* SECTION B: CONTACT & HEADQUARTERS LOCATION */}
              <View style={styles.formGroupCard}>
                <View style={styles.formGroupHeader}>
                  <MapPin size={16} color="#1E40AF" strokeWidth={2.2} />
                  <Text style={styles.formGroupTitle}>Contact & Location</Text>
                </View>

                <CustomInput
                  label="Corporate Email Address *"
                  placeholder="info@company.com"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <CustomInput
                  label="Official Contact Phone *"
                  placeholder="Phone number"
                  value={regPhone}
                  onChangeText={setRegPhone}
                  keyboardType="phone-pad"
                />

                <CustomInput
                  label="Registered Office Address *"
                  placeholder="Office address"
                  value={regAddress}
                  onChangeText={setRegAddress}
                />

                <View style={styles.twoColRow}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <CustomInput
                      label="City"
                      placeholder="City"
                      value={regCity}
                      onChangeText={setRegCity}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <CustomInput
                      label="State"
                      placeholder="State"
                      value={regState}
                      onChangeText={setRegState}
                    />
                  </View>
                </View>

                <View style={styles.twoColRow}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <CustomInput
                      label="Postal / PIN Code"
                      placeholder="Postal code"
                      value={regPostalCode}
                      onChangeText={setRegPostalCode}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <CustomInput
                      label="Country"
                      placeholder="Country"
                      value={regCountry}
                      onChangeText={setRegCountry}
                    />
                  </View>
                </View>
              </View>

              {/* SECTION C: PRIMARY COMPANY OWNER / ADMINISTRATOR */}
              <View style={styles.formGroupCard}>
                <TouchableOpacity
                  style={styles.ownerToggleRow}
                  onPress={() => setRegAssignOwner(!regAssignOwner)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkboxSquare, regAssignOwner && styles.checkboxSquareActive]}>
                    {regAssignOwner && <View style={styles.checkboxInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ownerToggleTitle}>Assign Initial Company Owner / Admin</Text>
                    <Text style={styles.ownerToggleSubtitle}>
                      Creates top administrative access for this company so there is no setup issue
                    </Text>
                  </View>
                </TouchableOpacity>

                {regAssignOwner && (
                  <View style={styles.ownerSubForm}>
                    <CustomInput
                      label="Owner Full Name *"
                      placeholder="Full Name"
                      value={regOwnerName}
                      onChangeText={setRegOwnerName}
                    />

                    <View style={styles.fieldSection}>
                      <Text style={styles.fieldLabel}>Designation / Title</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
                        {DESIGNATION_PRESETS.map((des) => {
                          const isSel = regOwnerDesignation === des;
                          return (
                            <TouchableOpacity
                              key={des}
                              style={[styles.presetChip, isSel && styles.presetChipActive]}
                              onPress={() => setRegOwnerDesignation(des)}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.presetChipText, isSel && styles.presetChipTextActive]}>
                                {des}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>

                    <CustomInput
                      label="Owner Login Email Address *"
                      placeholder="owner@company.com"
                      value={regOwnerEmail}
                      onChangeText={setRegOwnerEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <CustomInput
                      label="Owner Direct Mobile *"
                      placeholder="Phone number"
                      value={regOwnerPhone}
                      onChangeText={setRegOwnerPhone}
                      keyboardType="phone-pad"
                    />

                    <CustomInput
                      label="Employee ID (Optional)"
                      placeholder="OWN-001"
                      value={regOwnerEmployeeId}
                      onChangeText={setRegOwnerEmployeeId}
                      helperText="Auto-generated if left blank"
                    />

                    <PasswordInput
                      label="Temporary Password *"
                      placeholder="Min 6 characters"
                      value={regOwnerPassword}
                      onChangeText={setRegOwnerPassword}
                    />

                    <PasswordInput
                      label="Confirm Password *"
                      placeholder="Confirm password"
                      value={regOwnerConfirmPassword}
                      onChangeText={setRegOwnerConfirmPassword}
                    />
                  </View>
                )}
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowRegisterModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <CustomButton
                  title="Save & Register Enterprise"
                  onPress={handleRegisterCompany}
                  loading={regLoading}
                  style={{ flex: 1, backgroundColor: "#173B7A" }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Comprehensive Edit Company */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Company Details</Text>
                <Text style={styles.modalSubtitle}>Update complete corporate organization profile.</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={20} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <CustomInput
                label="Enterprise Name *"
                placeholder="Company Name"
                value={editName}
                onChangeText={setEditName}
              />

              <CustomInput
                label="Company Code"
                placeholder="ACME"
                value={editCode}
                onChangeText={setEditCode}
                autoCapitalize="characters"
              />

              <CustomInput
                label="Registration / CIN / Tax ID"
                placeholder="Tax / CIN ID"
                value={editRegNumber}
                onChangeText={setEditRegNumber}
              />

              <CustomInput
                label="Industry / Sector"
                placeholder="IT & Software"
                value={editIndustry}
                onChangeText={setEditIndustry}
              />

              <CustomInput
                label="Company Website"
                placeholder="company.com"
                value={editWebsite}
                onChangeText={setEditWebsite}
                autoCapitalize="none"
              />

              <CustomInput
                label="Contact Email"
                placeholder="info@company.com"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomInput
                label="Phone Number"
                placeholder="Phone number"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />

              <CustomInput
                label="Office Address"
                placeholder="Address"
                value={editAddress}
                onChangeText={setEditAddress}
              />

              <View style={styles.twoColRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <CustomInput
                    label="City"
                    placeholder="City"
                    value={editCity}
                    onChangeText={setEditCity}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <CustomInput
                    label="State"
                    placeholder="State"
                    value={editState}
                    onChangeText={setEditState}
                  />
                </View>
              </View>

              <View style={styles.twoColRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <CustomInput
                    label="Postal Code"
                    placeholder="Postal Code"
                    value={editPostalCode}
                    onChangeText={setEditPostalCode}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <CustomInput
                    label="Country"
                    placeholder="Country"
                    value={editCountry}
                    onChangeText={setEditCountry}
                  />
                </View>
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
                  onPress={handleUpdateCompany}
                  loading={editLoading}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Add Admin / Company Owner */}
      <Modal
        visible={showAddAdminModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddAdminModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Admin / Owner</Text>
                <Text style={styles.modalSubtitle}>
                  For: {targetCompany?.name} ({targetCompany?.code || `ID #${targetCompany?.id}`})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddAdminModal(false)}>
                <X size={20} color="#64748B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.lockedCompanyNotice}>
                <Building2 size={15} color="#1E40AF" strokeWidth={2.2} />
                <Text style={styles.lockedCompanyNoticeText}>
                  This administrator will be linked directly to{" "}
                  <Text style={{ fontWeight: "700" }}>{targetCompany?.name}</Text>.
                </Text>
              </View>

              <CustomInput
                label="Full Name *"
                placeholder="Full Name"
                value={adminName}
                onChangeText={setAdminName}
              />

              <CustomInput
                label="Work Email Address *"
                placeholder="admin@company.com"
                value={adminEmail}
                onChangeText={setAdminEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Admin Role / Title */}
              <View style={styles.fieldSection}>
                <CustomInput
                  label="Role / Title"
                  placeholder="Role / Title"
                  value={adminDesignation}
                  onChangeText={setAdminDesignation}
                />
                <Text style={styles.presetLabel}>Quick Presets:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
                  {DESIGNATION_PRESETS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.presetChip, adminDesignation === d && styles.presetChipActive]}
                      onPress={() => setAdminDesignation(d)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.presetChipText, adminDesignation === d && styles.presetChipTextActive]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <CustomInput
                label="Employee ID (Optional)"
                placeholder="ADM-001"
                value={adminEmployeeId}
                onChangeText={setAdminEmployeeId}
                helperText="Auto-generated if left blank"
              />

              <CustomInput
                label="Mobile / Phone Number"
                placeholder="Phone number"
                value={adminPhone}
                onChangeText={setAdminPhone}
                keyboardType="phone-pad"
              />

              <PasswordInput
                label="Temporary Password *"
                placeholder="Min 6 characters"
                value={adminPassword}
                onChangeText={setAdminPassword}
              />

              <PasswordInput
                label="Confirm Password *"
                placeholder="Confirm password"
                value={adminConfirmPassword}
                onChangeText={setAdminConfirmPassword}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowAddAdminModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <CustomButton
                  title="Provision Admin"
                  onPress={handleCreateAdminForCompany}
                  loading={adminLoading}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNav role={userRole} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  registerHeroBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#173B7A",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    shadowColor: "#173B7A",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  registerHeroLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
    marginRight: 8,
  },
  registerHeroIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  registerHeroTextCol: {
    flex: 1,
  },
  registerHeroTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  registerHeroSubtitle: {
    fontSize: 11.5,
    color: "rgba(255, 255, 255, 0.88)",
    marginTop: 2,
  },
  registerHeroBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: "#0F172A",
    height: "100%",
  },
  clearBtn: {
    padding: 4,
  },
  centerContainer: {
    paddingVertical: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748B",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#173B7A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  companyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 14,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  companyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  companyInfo: {
    flex: 1,
  },
  companyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  companyName: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  codePill: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  codePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  metaBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    flexWrap: "wrap",
  },
  statusPillActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  statusPillTextActive: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803D",
  },
  industryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  industryBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#047857",
  },
  regBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  regBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#4338CA",
  },
  cardTopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 6,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  companyDetailsGrid: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: "#475569",
    flex: 1,
  },
  companyFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },
  ownerStatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    flex: 1,
  },
  ownerStatText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  noOwnerWarningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    flex: 1,
  },
  noOwnerWarningText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#B45309",
  },
  addOwnerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#173B7A",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexShrink: 0,
  },
  addOwnerBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  expandDrawerRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F8FAFC",
  },
  expandToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  expandToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  adminsContainer: {
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  adminsSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  emptyAdminsBox: {
    paddingVertical: 12,
    alignItems: "center",
  },
  emptyAdminsText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
  },
  inlineAddBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#1D4ED8",
    borderRadius: 6,
  },
  inlineAddBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  adminMiniCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 6,
  },
  adminAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#173B7A",
    alignItems: "center",
    justifyContent: "center",
  },
  adminAvatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  adminName: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  roleBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  adminEmail: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  adminPhone: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
  },
  formGroupCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  formGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  formGroupTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  twoColRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldSection: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  presetScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  presetChipActive: {
    backgroundColor: "#173B7A",
    borderColor: "#173B7A",
  },
  presetChipText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "500",
  },
  presetChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  presetLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 4,
  },
  ownerToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSquareActive: {
    borderColor: "#173B7A",
    backgroundColor: "#173B7A",
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  ownerToggleTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  ownerToggleSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  ownerSubForm: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  lockedCompanyNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  lockedCompanyNoticeText: {
    fontSize: 12,
    color: "#1E40AF",
    flex: 1,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
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
