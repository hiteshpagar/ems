import { Alert, StyleSheet, Text, View } from "react-native";

import { useEffect, useState } from "react";

import { router, useLocalSearchParams } from "expo-router";

import API from "../services/api";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";

import { LinearGradient } from "expo-linear-gradient";

export default function EditEmployeeScreen() {
  const { id } = useLocalSearchParams();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [department, setDepartment] = useState("");

  const [salary, setSalary] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");

  // Fetch Employee By ID
  const fetchEmployee = async () => {
    try {
      const response = await API.get(`/employees/${id}`);

      const employee = response.data;

      setName(employee.name);
      setEmail(employee.email);
      setDepartment(employee.department);
      setSalary(employee.salary.toString());
      setPhotoUrl(employee.photoUrl || "");
    } catch (error) {
      console.log(error);
    }
  };

  // Update Employee
  const handleUpdateEmployee = async () => {
    try {
      await API.put(`/employees/${id}`, {
        name,
        email,
        department,
        salary: Number(salary),
        photoUrl,
      });

      Alert.alert("Success", "Employee Updated");

      router.back();
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Update Failed");
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Edit Employee</Text>

          <Text style={styles.headerSubtitle}>Update employee information</Text>
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

          <Text style={styles.label}>🖼 Profile Photo URL</Text>

          <CustomInput
            placeholder="https://example.com/photo.jpg"
            value={photoUrl}
            onChangeText={setPhotoUrl}
          />

          <CustomButton
            title="Update Employee"
            onPress={handleUpdateEmployee}
          />
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
