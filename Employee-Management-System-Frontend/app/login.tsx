import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { router } from "expo-router";

import API from "../services/api";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import PasswordInput from "../components/PasswordInput";
import ScreenWrapper from "../components/ScreenWrapper";
import { AuthContext } from "../context/AuthContext";
import { getRememberedSession } from "../utils/storage";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (!email.trim() || !password) {
      Alert.alert("Required Fields", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      if (response.data) {
        await login(
          response.data.token,
          response.data.role,
          response.data.fullName,
          email.trim(),
          rememberMe
        );

        router.replace("/dashboard");
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

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{"Don't have an account? "}</Text>
          <TouchableOpacity
            onPress={() => router.push("/register")}
            activeOpacity={0.7}
          >
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
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
