import { Alert, StyleSheet, Text, View } from "react-native";

import { useState } from "react";

import { router } from "expo-router";

import API from "../services/api";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";

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
        <Text style={styles.title}>Add Employee</Text>

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

        <CustomButton title="Add Employee" onPress={handleAddEmployee} />
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
