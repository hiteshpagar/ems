import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";

function getInitials(name: string) {
  const parts = name.trim().split(" ");

  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default function EmployeeDetailsScreen() {
  const { id } = useLocalSearchParams();

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployee = async () => {
    try {
      const response = await API.get(`/employees/${id}`);

      setEmployee(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Employee",
      "Are you sure you want to delete this employee?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/employees/${id}`);

              Alert.alert(
                "Success",
                "Employee Deleted Successfully"
              );

              router.back();
            } catch (error) {
              console.log(error);

              Alert.alert(
                "Error",
                "Delete Failed"
              );
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

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
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        {/* Profile Card */}
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(employee?.name)}
            </Text>
          </View>

          <Text style={styles.name}>
            {employee?.name}
          </Text>

          <Text style={styles.email}>
            {employee?.email}
          </Text>
        </LinearGradient>

        {/* Details */}
        <View style={styles.infoCard}>
          <Text style={styles.label}>
            Department
          </Text>

          <Text style={styles.value}>
            {employee?.department}
          </Text>

          <Text style={styles.label}>
            Salary
          </Text>

          <Text style={styles.value}>
            ₹ {employee?.salary}
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push(
              `/edit-employee?id=${employee.id}`
            )
          }
        >
          <Text style={styles.buttonText}>
            Edit Employee
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>
            Delete Employee
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6FB",
  },

  back: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "600",
  },

  profileCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },

  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  email: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 5,
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },

  label: {
    color: "gray",
    fontSize: 14,
    marginTop: 10,
  },

  value: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },

  editButton: {
    backgroundColor: "#2F80ED",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  deleteButton: {
    backgroundColor: "#FF4B2B",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});