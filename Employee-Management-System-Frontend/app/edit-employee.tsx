import { Alert, StyleSheet, Text, View } from "react-native";

import { useEffect, useState } from "react";

import { router, useLocalSearchParams } from "expo-router";

import API from "../services/api";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";

export default function EditEmployeeScreen() {
  const { id } = useLocalSearchParams();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [department, setDepartment] = useState("");

  const [salary, setSalary] = useState("");

  // Fetch Employee By ID
  const fetchEmployee = async () => {
    try {
      const response = await API.get(`/employees/${id}`);

      const employee = response.data;

      setName(employee.name);
      setEmail(employee.email);
      setDepartment(employee.department);
      setSalary(employee.salary.toString());
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
        <Text style={styles.title}>Edit Employee</Text>

        <CustomInput
          placeholder="Enter Name"
          value={name}
          onChangeText={setName}
        />

        <CustomInput
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
        />

        <CustomInput
          placeholder="Enter Department"
          value={department}
          onChangeText={setDepartment}
        />

        <CustomInput
          placeholder="Enter Salary"
          value={salary}
          onChangeText={setSalary}
          keyboardType="numeric"
        />

        <CustomButton title="Update Employee" onPress={handleUpdateEmployee} />
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
});
