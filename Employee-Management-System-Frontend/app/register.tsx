import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";
import { useState } from "react";

import API from "../services/api";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    // Basic Validation
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill all fields");

      return;
    }

    try {
      const response = await API.post("/auth/register", {
        fullName,
        email,
        password,
      });

      console.log(response.data);

      Alert.alert("Success", "Registration Successful");

      router.push("/login");
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Registration Failed");
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>EMPLOYEE MANAGEMENT SYSTEM</Text>
        <Text style={styles.title}>Create account</Text>

        <View style={styles.card}><Text style={styles.label}>Full name</Text>
        <Text style={styles.label}>Email address</Text><CustomInput
          placeholder="Enter Full Name"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Password</Text><CustomInput
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

        <CustomButton title="Register" onPress={handleRegister} />

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.link}>Already have an account? Login</Text>
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
    marginBottom: 24,
  },

  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#2563EB",
    fontSize: 14,
  },
  eyebrow: { color: "#2563EB", fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 8 },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 16 },
  label: { color: "#475569", fontSize: 13, fontWeight: "600", marginBottom: 7 },
});
