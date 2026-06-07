import { Alert, StyleSheet, Text, View } from "react-native";

import { useState } from "react";

import { router } from "expo-router";

import API from "../services/api";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";

import { LinearGradient } from "expo-linear-gradient";

export default function AddEmployeeScreen() {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [department, setDepartment] = useState("");

  const [salary, setSalary] = useState("");

  const handleAddEmployee = async () => {
    if (!name || !email || !department || !salary) {
      Alert.alert("Error", "Please fill all fields");

      return;
    }

    try {
      const response = await API.post("/employees", {
        name,
        email,
        department,
        salary: Number(salary),
      });

      console.log(response.data);

      Alert.alert("Success", "Employee Added Successfully");

      router.back();
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed to Add Employee");
    }
  };

  

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Add Employee</Text>

          <Text style={styles.headerSubtitle}>
            Build your team and manage employees
          </Text>
        </LinearGradient>
        <View style={styles.formCard}>
          <Text style={styles.label}>👤 Full Name</Text>
          <CustomInput
            placeholder="Enter Name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>📧 Email Address</Text>
          <CustomInput
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>🏢 Department</Text>
          <CustomInput
            placeholder="Enter Department"
            value={department}
            onChangeText={setDepartment}
          />

          <Text style={styles.label}>💰 Salary</Text>
          <CustomInput
            placeholder="Enter Salary"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
          />

          <CustomButton title="Add Employee" onPress={handleAddEmployee} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6FB",
  },

  header: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 5,
  },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
    color: "#444",
  },
});
