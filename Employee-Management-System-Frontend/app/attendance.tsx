import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { useEffect, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";

import { Picker } from "@react-native-picker/picker";

import API from "../services/api";

import ScreenWrapper from "../components/ScreenWrapper";
import CustomButton from "../components/CustomButton";

export default function AttendanceScreen() {
  const [employees, setEmployees] = useState<any[]>([]);

  const [employeeId, setEmployeeId] = useState("");

  const [employeeName, setEmployeeName] = useState("");

  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees");

      setEmployees(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCheckIn = async () => {
    if (!employeeId) {
      Alert.alert("Error", "Please select an employee");
      return;
    }

    try {
      await API.post("/attendance/check-in", {
        employeeId,
        employeeName,
      });

      Alert.alert("Success", "Check In Successful");
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Check In Failed");
    }
  };

  const handleCheckOut = async () => {
    if (!employeeId) {
      Alert.alert("Error", "Please select an employee");
      return;
    }

    try {
      await API.post("/attendance/check-out", {
        employeeId,
      });

      Alert.alert("Success", "Check Out Successful");
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Check Out Failed");
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Attendance Management</Text>

          <Text style={styles.headerSubtitle}>
            Check in and check out employees
          </Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.label}>👤 Select Employee</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={employeeId}
              onValueChange={(value) => {
                setEmployeeId(value);

                const employee = employees.find((emp) => emp.id === value);

                if (employee) {
                  setEmployeeName(employee.name);
                }
              }}
            >
              <Picker.Item label="Select Employee" value="" />

              {employees.map((employee) => (
                <Picker.Item
                  key={employee.id}
                  label={employee.name}
                  value={employee.id}
                />
              ))}
            </Picker>
          </View>

          <View
            style={{
              marginTop: 15,
            }}
          >
            <CustomButton title="✅ Check In" onPress={handleCheckIn} />
          </View>

          <View
            style={{
              marginTop: 10,
            }}
          >
            <CustomButton title="❌ Check Out" onPress={handleCheckOut} />
          </View>
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
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },

  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
});
