import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        <CustomInput
          placeholder="Enter Full Name"
          value={fullName}
          onChangeText={setFullName}
        />

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

        <CustomButton title="Register" onPress={handleRegister} />

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.link}>Already have an account? Login</Text>
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
    fontSize: 30,
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
});
