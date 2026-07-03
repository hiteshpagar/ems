import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useState, useContext } from "react";

import { router } from "expo-router";

import API from "../services/api";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";

import { AuthContext } from "../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);

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

        <CustomButton title="Login" onPress={handleLogin} />
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
});
