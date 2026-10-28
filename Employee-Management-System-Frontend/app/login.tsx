import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { AlertCircle, KeyRound, Lock, ShieldCheck, X } from "lucide-react-native";

import API from "../services/api";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import PasswordInput from "../components/PasswordInput";
import ScreenWrapper from "../components/ScreenWrapper";
import { AuthContext } from "../context/AuthContext";
import { getRememberedSession } from "../utils/storage";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";
import { isValidEmail } from "../utils/validators";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // First-Time Login / Force Password Change State
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [firstTimeEmail, setFirstTimeEmail] = useState("");
  const [firstTimeTempPassword, setFirstTimeTempPassword] = useState("");
  const [firstTimeNewPassword, setFirstTimeNewPassword] = useState("");
  const [firstTimeConfirmPassword, setFirstTimeConfirmPassword] = useState("");
  const [firstTimeLoading, setFirstTimeLoading] = useState(false);

  const { login } = useContext(AuthContext);

  useEffect(() => {
    getRememberedSession().then((session) => {
      if (session?.email) {
        setEmail(session.email);
        setRememberMe(true);
      }
    });
  }, []);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Required Fields", "Please enter your email and password.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      if (response.data) {
        // Intercept first-time login requiring password change
        if (response.data.requiresPasswordChange) {
          setFirstTimeEmail(email.trim());
          setFirstTimeTempPassword(password);
          setFirstTimeNewPassword("");
          setFirstTimeConfirmPassword("");
          setShowFirstTimeModal(true);
          return;
        }

        await login(
          response.data.token,
          response.data.role,
          response.data.fullName,
          email.trim(),
          rememberMe
        );

        if (response.data.role === "SUPER_ADMIN") {
          router.replace("/super-admin-dashboard");
        } else if (response.data.role === "ADMIN") {
          router.replace("/admin-dashboard" as any);
        } else {
          router.replace("/dashboard");
        }
      } else {
        Alert.alert("Login Failed", "Invalid credentials. Please try again.");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password. Please try again.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstTimePasswordSubmit = async () => {
    if (!firstTimeNewPassword) {
      Alert.alert("Missing Password", "Please enter your new permanent password.");
      return;
    }
    if (firstTimeNewPassword.length < 6) {
      Alert.alert("Password Too Short", "New permanent password must be at least 6 characters.");
      return;
    }
    if (firstTimeNewPassword !== firstTimeConfirmPassword) {
      Alert.alert("Password Mismatch", "New password and confirmation do not match.");
      return;
    }
    if (firstTimeNewPassword === firstTimeTempPassword) {
      Alert.alert(
        "Invalid Password",
        "Your new permanent password must be different from your temporary password."
      );
      return;
    }

    try {
      setFirstTimeLoading(true);
      const res = await API.post("/auth/first-time-password", {
        email: firstTimeEmail.trim(),
        temporaryPassword: firstTimeTempPassword,
        newPassword: firstTimeNewPassword,
      });

      if (res.data?.token) {
        await login(
          res.data.token,
          res.data.role,
          res.data.fullName,
          firstTimeEmail.trim(),
          rememberMe
        );

        setShowFirstTimeModal(false);
        Alert.alert(
          "Password Updated",
          "Your personal password has been activated. Welcome to your workspace!"
        );

        if (res.data.role === "SUPER_ADMIN") {
          router.replace("/super-admin-dashboard");
        } else if (res.data.role === "ADMIN") {
          router.replace("/admin-dashboard" as any);
        } else {
          router.replace("/dashboard");
        }
      }
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error?.response?.data?.message || "Could not update password. Please check your credentials."
      );
    } finally {
      setFirstTimeLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandSection}>
          <View style={styles.brandIconContainer}>
            <Text style={styles.brandIconText}>👥</Text>
          </View>
          <Text style={styles.brandName}>EMS</Text>
          <Text style={styles.brandSubtitle}>EMPLOYEE MANAGEMENT SYSTEM</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Please login to your account</Text>

          <CustomInput
            label="Email"
            placeholder="john.doe@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            autoComplete="password"
          />

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe((prev) => !prev)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxChecked,
                ]}
              >
                {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.rememberText}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/forgot-password")}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
        </View>

        {/* Enterprise Access Notice */}
        <View style={styles.enterpriseNoticeRow}>
          <ShieldCheck size={16} color="#2563EB" />
          <Text style={styles.enterpriseNoticeText}>
            Enterprise Portal • Access restricted to authorized personnel.
          </Text>
        </View>

        {/* First-Time Sign-In / Mandatory Password Change Modal */}
        <Modal
          visible={showFirstTimeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFirstTimeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalIconCircle}>
                  <KeyRound size={22} color="#173B7A" />
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowFirstTimeModal(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>Set Your Personal Password</Text>
              <Text style={styles.modalSubtitle}>
                Welcome to EMS! As an administrator, you have signed in with a temporary password.
                Please choose your permanent private password to continue.
              </Text>

              <View style={styles.modalInfoBanner}>
                <ShieldCheck size={16} color="#2563EB" />
                <Text style={styles.modalInfoText}>
                  Signing in as <Text style={{ fontWeight: "700" }}>{firstTimeEmail}</Text>
                </Text>
              </View>

              <PasswordInput
                label="Temporary Password"
                placeholder="Enter temporary password"
                value={firstTimeTempPassword}
                onChangeText={setFirstTimeTempPassword}
                required
              />

              <PasswordInput
                label="New Permanent Password"
                placeholder="Minimum 6 characters"
                value={firstTimeNewPassword}
                onChangeText={setFirstTimeNewPassword}
                required
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Re-enter permanent password"
                value={firstTimeConfirmPassword}
                onChangeText={setFirstTimeConfirmPassword}
                required
              />

              <CustomButton
                title="Save Password & Enter Dashboard"
                onPress={handleFirstTimePasswordSubmit}
                loading={firstTimeLoading}
                style={styles.modalSubmitButton}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 440,
    padding: 24,
    ...AppShadows.card,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  modalInfoText: {
    fontSize: 12,
    color: "#1E40AF",
  },
  modalSubmitButton: {
    marginTop: 10,
    backgroundColor: "#173B7A",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  enterpriseNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    gap: 8,
    paddingHorizontal: 16,
  },
  enterpriseNoticeText: {
    fontSize: 12,
    color: AppColors.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  brandIconContainer: {
    width: 60,
    height: 60,
    borderRadius: AppRadius.lg,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    ...AppShadows.card,
  },
  brandIconText: {
    fontSize: 28,
  },
  brandName: {
    fontSize: 26,
    fontWeight: "800",
    color: AppColors.text,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.primary,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.card,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.text,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 2,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: AppColors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: AppColors.surface,
  },
  checkboxChecked: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: -1,
  },
  rememberText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  forgotText: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: "600",
  },
  loginButton: {
    marginTop: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: AppColors.textMuted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.primary,
  },
});
