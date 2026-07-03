import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { useEffect, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";

import { Picker } from "@react-native-picker/picker";

import API from "../services/api";

import ScreenWrapper from "../components/ScreenWrapper";
import CustomButton from "../components/CustomButton";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AttendanceScreen() {
  const [employees, setEmployees] = useState<any[]>([]);

  const [employeeId, setEmployeeId] = useState("");

  const [employeeName, setEmployeeName] = useState("");

  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  const { userRole, userName } = useContext(AuthContext);

  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees");

      setEmployees(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLoggedInEmployee = async () => {
    try {
      const response = await API.get("/employees/me");

      setEmployeeId(response.data.id.toString());

      setEmployeeName(response.data.name);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await API.get("/attendance/me/today");

      setTodayAttendance(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userRole === "ADMIN") {
      fetchEmployees();
    } else {
      fetchLoggedInEmployee();
      fetchTodayAttendance();
    }
  }, [userRole]);

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

      await fetchTodayAttendance();

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

      await fetchTodayAttendance();

      Alert.alert("Success", "Check Out Successful");
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Check Out Failed");
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "--";

    const [hour, minute] = time.split(":");

    let hours = parseInt(hour);

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${hours}:${minute} ${ampm}`;
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
          {userRole === "ADMIN" ? (
            <>
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
            </>
          ) : (
            <>
              <Text style={styles.label}>👤 Employee</Text>

              <View style={styles.readOnlyBox}>
                <Text style={styles.readOnlyText}>{userName}</Text>
              </View>
            </>
          )}
          {userRole === "EMPLOYEE" && (
            <View style={styles.todayCard}>
              <Text style={styles.todayTitle}>📅 Today's Attendance</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Status</Text>

                <Text style={styles.rowValue}>
                  {todayAttendance ? "🟢 Present" : "🔴 Not Checked In"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Check In</Text>

                <Text style={styles.rowValue}>
                  {formatTime(todayAttendance?.checkInTime)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Check Out</Text>

                <Text style={styles.rowValue}>
                  {formatTime(todayAttendance?.checkOutTime)}
                </Text>
              </View>
            </View>
          )}

          {userRole === "ADMIN" ? (
            <>
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
            </>
          ) : (
            <>
              {!todayAttendance && (
                <View
                  style={{
                    marginTop: 15,
                  }}
                >
                  <CustomButton title="✅ Check In" onPress={handleCheckIn} />
                </View>
              )}

              {todayAttendance && !todayAttendance.checkOutTime && (
                <View
                  style={{
                    marginTop: 15,
                  }}
                >
                  <CustomButton title="❌ Check Out" onPress={handleCheckOut} />
                </View>
              )}

              {todayAttendance && todayAttendance.checkOutTime && (
                <Text
                  style={{
                    textAlign: "center",
                    color: "green",
                    fontWeight: "bold",
                    marginTop: 20,
                    fontSize: 16,
                  }}
                >
                  ✅ Attendance Completed
                </Text>
              )}
            </>
          )}
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
  readOnlyBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },

  readOnlyText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  todayCard: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  todayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  rowLabel: {
    color: "#6B7280",
    fontWeight: "600",
  },

  rowValue: {
    color: "#111827",
    fontWeight: "bold",
  },
});
