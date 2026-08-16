import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    try {
      await API.post("/auth/forgot-password", {
        email: trimmedEmail,
      });

      Alert.alert("Success", "Password reset OTP sent to your email.", [
        {
          text: "OK",
          onPress: () =>
            router.push(`/reset-password?email=${encodeURIComponent(trimmedEmail)}`),
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
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email to receive a reset OTP.
        </Text>

        <View style={styles.card}><Text style={styles.label}>Email address</Text><CustomInput
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomButton title="Send OTP" onPress={handleSendOtp} />

        <TouchableOpacity onPress={() => router.back()}>
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
