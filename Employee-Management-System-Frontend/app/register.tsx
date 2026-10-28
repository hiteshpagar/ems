import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react-native";

import CustomButton from "../components/CustomButton";
import ScreenWrapper from "../components/ScreenWrapper";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

export default function RegisterScreen() {
  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/login")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={18} color={AppColors.text} />
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Lock size={32} color="#173B7A" />
          </View>

          <Text style={styles.title}>Registration Closed</Text>
          <Text style={styles.subtitle}>
            Public self-registration is disabled for security. The System Owner and Super Administrator
            is pre-configured, and company access is managed directly through the administration portal.
          </Text>

          <View style={styles.infoBox}>
            <ShieldCheck size={18} color="#2563EB" />
            <Text style={styles.infoText}>
              If you are a company administrator or employee, please check your email for access
              credentials provided by your organization.
            </Text>
          </View>

          <CustomButton
            title="Return to Login"
            onPress={() => router.replace("/login")}
            style={styles.returnButton}
          />
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
  backButton: {
    width: 38,
    height: 38,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    ...AppShadows.card,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textMuted,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: AppRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  returnButton: {
    width: "100%",
    backgroundColor: "#173B7A",
  },
});
