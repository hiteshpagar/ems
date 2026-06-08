import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { useEffect, useState } from "react";

import { router } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";

import { Picker } from "@react-native-picker/picker";

import API from "../services/api";

import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import ScreenWrapper from "../components/ScreenWrapper";

export default function ApplyLeaveScreen() {
  const [employees, setEmployees] = useState<any[]>([]);

  const [employeeId, setEmployeeId] = useState<number | null>(null);

  const [employeeName, setEmployeeName] = useState("");

  const [leaveType, setLeaveType] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [reason, setReason] = useState("");

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

  const handleApplyLeave = async () => {
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      Alert.alert("Error", "Please fill all fields");

      return;
    }

    try {
      await API.post("/leaves", {
        employeeId,
        employeeName,
        leaveType,
        startDate,
        endDate,
        reason,
      });

      Alert.alert("Success", "Leave Applied Successfully");

      router.back();
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed To Apply Leave");
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Apply Leave</Text>

          <Text style={styles.headerSubtitle}>
            Submit leave request and track status
          </Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.label}>👤 Employee</Text>

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
              <Picker.Item label="Select Employee" value={null} />

              {employees.map((employee) => (
                <Picker.Item
                  key={employee.id}
                  label={employee.name}
                  value={employee.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>🏖 Leave Type</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={leaveType}
              onValueChange={(value) => setLeaveType(value)}
            >
              <Picker.Item label="Select Leave Type" value="" />

              <Picker.Item label="Casual Leave" value="Casual Leave" />

              <Picker.Item label="Sick Leave" value="Sick Leave" />

              <Picker.Item label="Annual Leave" value="Annual Leave" />

              <Picker.Item label="Work From Home" value="Work From Home" />
            </Picker>
          </View>

          <Text style={styles.label}>📅 Start Date</Text>

          <CustomInput
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
          />

          <Text style={styles.label}>📅 End Date</Text>

          <CustomInput
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={setEndDate}
          />

          <Text style={styles.label}>📝 Reason</Text>

          <CustomInput
            placeholder="Enter Reason"
            value={reason}
            onChangeText={setReason}
          />

          <CustomButton title="Submit Leave" onPress={handleApplyLeave} />
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
    marginTop: 10,
    color: "#444",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
});
