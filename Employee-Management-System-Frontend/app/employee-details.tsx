import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
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

              Alert.alert("Success", "Employee Deleted Successfully");

              router.back();
            } catch (error) {
              console.log(error);

              Alert.alert("Error", "Delete Failed");
            }
          },
        },
      ],
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        {/* Profile Card */}
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.profileCard}
        >
          <Image
            source={{
              uri: employee?.photoUrl
                ? `http://10.195.172.204:8080${employee.photoUrl}`
                : "https://i.pravatar.cc/300",
            }}
            style={styles.avatar}
          />

          <Text style={styles.name}>{employee?.name}</Text>

          <Text style={styles.email}>{employee?.email}</Text>

          <View style={styles.departmentBadge}>
            <Text style={styles.departmentBadgeText}>
              {employee?.designation || employee?.department}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏢</Text>
            <Text style={styles.statValue}>{employee?.department}</Text>
            <Text style={styles.statLabel}>Department</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statValue}>₹ {employee?.salary}</Text>
            <Text style={styles.statLabel}>Basic Salary</Text>
          </View>
        </View>

        {employee?.designation ? (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>ROLE INFORMATION</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>💼</Text>
              <View>
                <Text style={styles.infoLabel}>Designation</Text>
                <Text style={styles.infoValue}>{employee?.designation}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Details */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>EMPLOYEE INFORMATION</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📧</Text>
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{employee?.email}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏢</Text>
            <View>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{employee?.department}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💰</Text>
            <View>
              <Text style={styles.infoLabel}>Monthly Basic Salary</Text>
              <Text style={styles.infoValue}>₹ {employee?.salary}</Text>
            </View>
          </View>

          {employee?.designation ? (
            <>
              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>💼</Text>
                <View>
                  <Text style={styles.infoLabel}>Designation</Text>
                  <Text style={styles.infoValue}>{employee?.designation}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/edit-employee?id=${employee.id}`)}
        >
          <Text style={styles.buttonText}>✏️ Edit Employee</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>🗑️ Delete Employee</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingBottom: 40,
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
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 15,
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
  departmentBadge: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  departmentBadgeText: {
    color: "#fff",
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 3,
  },

  statEmoji: {
    fontSize: 24,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },

  statLabel: {
    color: "gray",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "gray",
    letterSpacing: 1,
    marginBottom: 15,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  infoIcon: {
    fontSize: 22,
    marginRight: 15,
  },

  infoLabel: {
    color: "gray",
    fontSize: 12,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },

  infoDivider: {
    height: 1,
    backgroundColor: "#EEE",
  },
});
