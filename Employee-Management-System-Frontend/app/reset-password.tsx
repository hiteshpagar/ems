import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the OTP sent to your email and choose a new password.
        </Text>

        <CustomInput
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomInput
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
        />

        <CustomInput
          placeholder="Enter New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <CustomButton title="Reset Password" onPress={handleResetPassword} />

        <TouchableOpacity onPress={() => router.replace("/login")}>
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
