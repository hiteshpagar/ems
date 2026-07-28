import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email to receive a reset OTP.
        </Text>

        <CustomInput
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomButton title="Send OTP" onPress={handleSendOtp} />

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    color: "#64748B",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
  },

  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
