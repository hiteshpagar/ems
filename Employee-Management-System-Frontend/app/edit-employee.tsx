import { Picker } from "@react-native-picker/picker";
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { useCallback, useEffect, useMemo, useState } from "react";

import { router, useLocalSearchParams } from "expo-router";

import API from "../services/api";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";

import { LinearGradient } from "expo-linear-gradient";

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
}

export default function EditEmployeeScreen() {
  const { id } = useLocalSearchParams();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [departmentId, setDepartmentId] = useState<number | null>(null);

  const [designationId, setDesignationId] = useState<number | null>(null);

  const [salary, setSalary] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");

  const [departments, setDepartments] = useState<Department[]>([]);

  const [designations, setDesignations] = useState<Designation[]>([]);

  const [loading, setLoading] = useState(true);

  const filteredDesignations = useMemo(
    () =>
      designations.filter(
        (designation) => designation.departmentId === departmentId,
      ),
    [departmentId, designations],
  );

  const selectedDepartment = departments.find(
    (department) => department.id === departmentId,
  );

  const selectedDesignation = designations.find(
    (designation) => designation.id === designationId,
  );

  // Fetch Employee By ID and master data
  const fetchEmployeeData = useCallback(async () => {
    try {
      const [employeeResponse, departmentResponse, designationResponse] =
        await Promise.all([
          API.get(`/employees/${id}`),
          API.get<Department[]>("/departments"),
          API.get<Designation[]>("/designations"),
        ]);

      const employee = employeeResponse.data;
      const departmentData = Array.isArray(departmentResponse.data)
        ? departmentResponse.data
        : [];
      const designationData = Array.isArray(designationResponse.data)
        ? designationResponse.data
        : [];
      const matchedDepartment = departmentData.find(
        (department) => department.name === employee.department,
      );
      const matchedDesignation = designationData.find(
        (designation) =>
          designation.name === employee.designation &&
          designation.departmentId === matchedDepartment?.id,
      );

      setDepartments(departmentData);
      setDesignations(designationData);
      setName(employee.name);
      setEmail(employee.email);
      setDepartmentId(matchedDepartment?.id ?? departmentData[0]?.id ?? null);
      setDesignationId(matchedDesignation?.id ?? null);
      setSalary(employee.salary.toString());
      setPhotoUrl(employee.photoUrl || "");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to load employee data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setDesignationId((currentDesignationId) => {
      const currentStillValid = filteredDesignations.some(
        (designation) => designation.id === currentDesignationId,
      );

      if (currentStillValid) {
        return currentDesignationId;
      }

      return filteredDesignations[0]?.id ?? null;
    });
  }, [filteredDesignations]);

  // Update Employee
  const handleUpdateEmployee = async () => {
    if (!name || !email || !salary) {
      Alert.alert("Error", "Please fill all fields");

      return;
    }

    if (!selectedDepartment || !selectedDesignation) {
      Alert.alert("Error", "Please select department and designation");

      return;
    }

    try {
      await API.put(`/employees/${id}`, {
        name,
        email,
        department: selectedDepartment.name,
        designation: selectedDesignation.name,
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
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2F80ED" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={departmentId}
              onValueChange={(value) => setDepartmentId(value)}
              enabled={departments.length > 0}
              style={styles.picker}
            >
              {departments.length === 0 ? (
                <Picker.Item label="Create a department first" value={null} />
              ) : (
                departments.map((department) => (
                  <Picker.Item
                    key={department.id}
                    label={department.name}
                    value={department.id}
                  />
                ))
              )}
            </Picker>
          </View>

          <Text style={styles.label}>Designation</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={designationId}
              onValueChange={(value) => setDesignationId(value)}
              enabled={filteredDesignations.length > 0}
              style={styles.picker}
            >
              {filteredDesignations.length === 0 ? (
                <Picker.Item
                  label="Create a designation for this department first"
                  value={null}
                />
              ) : (
                filteredDesignations.map((designation) => (
                  <Picker.Item
                    key={designation.id}
                    label={designation.name}
                    value={designation.id}
                  />
                ))
              )}
            </Picker>
          </View>

          <Text style={styles.label}>💰 Monthly Basic Salary</Text>
          <CustomInput
            placeholder="Enter monthly basic salary"
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
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6FB",
  },
  scrollContent: {
    paddingBottom: 40,
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

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  pickerBox: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    justifyContent: "center",
    marginBottom: 15,
    overflow: "hidden",
  },

  picker: {
    color: "#111827",
  },
});
