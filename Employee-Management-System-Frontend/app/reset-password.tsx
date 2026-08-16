import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";
import API from "../services/api";

function getErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const initialEmail = typeof params.email === "string" ? params.email : "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail || !trimmedOtp || !newPassword) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      await API.post("/auth/reset-password", {
        email: trimmedEmail,
        otp: trimmedOtp,
        newPassword,
      });

      Alert.alert("Success", "Password reset successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", getErrorMessage(error));
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text>
        <Text style={styles.title}>Set a new password</Text>
        <Text style={styles.subtitle}>
          Enter the OTP sent to your email and choose a new password.
        </Text>

        <View style={styles.card}><Text style={styles.label}>Email address</Text><CustomInput
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>One-time password</Text><CustomInput
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>New password</Text><CustomInput
          placeholder="Enter New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <CustomButton title="Reset Password" onPress={handleResetPassword} />

        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity></View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },

  subtitle: {
    color: "#64748B",
    fontSize: 15,
    textAlign: "left",
    marginBottom: 28,
  },

  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
  eyebrow: { color: "#2563EB", fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 8 },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 16 },
  label: { color: "#475569", fontSize: 13, fontWeight: "600", marginBottom: 7 },
});
