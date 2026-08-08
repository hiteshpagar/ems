import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <View style={styles.container}>
        <Text style={styles.title}>Employee Management System</Text>

        <CustomInput
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
        />

        <CustomInput
          placeholder="Enter Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

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
    marginBottom: 40,
  },

  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#007AFF",
    fontSize: 16,
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -3,
    marginBottom: 18,
  },

  checkbox: {
    width: 22,
    height: 22,
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
    fontSize: 15,
    fontWeight: "600",
  },

  rememberHint: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
});
