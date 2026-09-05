import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import API from "../services/api";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

function getErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Required Field", "Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/forgot-password", {
        email: trimmedEmail,
      });

      Alert.alert(
        "OTP Sent",
        "A 6-digit password reset OTP has been sent to your email.",
        [
          {
            text: "Proceed",
            onPress: () =>
              router.push(
                `/reset-password?email=${encodeURIComponent(trimmedEmail)}`
              ),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", getErrorMessage(error));
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we will send you an OTP to reset your password
          </Text>

          <CustomInput
            label="Email"
            placeholder="john.doe@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            required
          />

          <CustomButton
            title="Send OTP"
            onPress={handleSendOtp}
            loading={loading}
            style={styles.actionButton}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={styles.backToLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 18,
    color: AppColors.text,
    fontWeight: "700",
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
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 8,
  },
  backToLogin: {
    marginTop: 24,
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
  },
});
