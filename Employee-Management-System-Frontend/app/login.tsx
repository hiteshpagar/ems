import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useState, useContext, useEffect } from "react";

import { router } from "expo-router";

import API from "../services/api";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";

import { AuthContext } from "../context/AuthContext";
import { getRememberedSession } from "../utils/storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

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
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");

      return;
    }

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      console.log(response.data);

      if (response.data) {
        // Save user in AsyncStorage
        await login(
          response.data.token,
          response.data.role,
          response.data.fullName,
          email.trim(),
          rememberMe,
        );

        console.log(response.data);

        Alert.alert("Success", "Login Successful");

        router.replace("/dashboard");
      } else {
        Alert.alert("Error", "Invalid Credentials");
      }
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Login Failed");
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brandMark}><Text style={styles.brandInitial}>E</Text></View>
        <Text style={styles.eyebrow}>EMPLOYEE MANAGEMENT SYSTEM</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to manage your workday.</Text>

        <View style={styles.formCard}>
        <Text style={styles.label}>Email address</Text>
        <CustomInput
          placeholder="name@company.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <CustomInput
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoComplete="password"
            style={styles.passwordInput}
          />
          <TouchableOpacity style={styles.showButton} onPress={() => setShowPassword((current) => !current)} accessibilityRole="button" accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
            <Text style={styles.showText}>{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.rememberRow}
          onPress={() => setRememberMe((value) => !value)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <View>
            <Text style={styles.rememberText}>Remember Me</Text>
          </View>
        </TouchableOpacity>

        <CustomButton title="Login" onPress={handleLogin} />

        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
        </View>
        <Text style={styles.footer}>Secure access for your organization</Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 32,
  },

  brandMark: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  brandInitial: { color: "#fff", fontSize: 22, fontWeight: "700" },
  eyebrow: { color: "#2563EB", fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 8 },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: { color: "#64748B", fontSize: 15, marginTop: 8, marginBottom: 28 },
  formCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 16 },
  label: { color: "#475569", fontSize: 13, fontWeight: "600", marginBottom: 7 },
  passwordRow: { position: "relative" },
  passwordInput: { paddingRight: 58 },
  showButton: { position: "absolute", right: 10, top: 10, padding: 6 },
  showText: { color: "#2563EB", fontSize: 13, fontWeight: "600" },

  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -3,
    marginBottom: 18,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#2F80ED",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  checkboxChecked: {
    backgroundColor: "#2F80ED",
  },

  checkmark: {
    color: "#fff",
    fontWeight: "bold",
  },

  rememberText: {
    fontSize: 14,
    fontWeight: "600",
  },

  rememberHint: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
  footer: { textAlign: "center", color: "#94A3B8", fontSize: 12, marginTop: 24 },
});
