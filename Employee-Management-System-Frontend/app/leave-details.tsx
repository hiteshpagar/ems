import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useState } from "react";

import { router, useLocalSearchParams } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";

import API from "../services/api";

import ScreenWrapper from "../components/ScreenWrapper";
import { formatDate } from "../utils/date";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LeaveDetailsScreen() {
  const { id } = useLocalSearchParams();

  const [leave, setLeave] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const { userRole } = useContext(AuthContext);

  const fetchLeave = async () => {
    try {
      const response =
        userRole === "ADMIN"
          ? await API.get(`/leaves/${id}`)
          : await API.get(`/leaves/me/${id}`);

      setLeave(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await API.put(`/leaves/${id}/status`, {
        status,
      });

      Alert.alert("Success", `Leave ${status}`, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed To Update Status");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Leave",
      "Are you sure you want to delete this leave request?",
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
              await API.delete(`/leaves/${id}`);

              Alert.alert("Success", "Leave Deleted Successfully");

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
    fetchLeave();
  }, []);

  const getStatusColor = () => {
    switch (leave?.status) {
      case "Approved":
        return "#27AE60";

      case "Rejected":
        return "#EB5757";

      default:
        return "#F2994A";
    }
  };

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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.header}
        >
          <Text style={styles.employeeName}>{leave.employeeName}</Text>

          <Text style={styles.leaveType}>{leave.leaveType}</Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(),
              },
            ]}
          >
            <Text style={styles.statusText}>{leave.status}</Text>
          </View>
        </LinearGradient>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>LEAVE INFORMATION</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Employee</Text>

            <Text style={styles.infoValue}>{leave.employeeName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Leave Type</Text>

            <Text style={styles.infoValue}>{leave.leaveType}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Date</Text>

            <Text style={styles.infoValue}>{formatDate(leave.startDate)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End Date</Text>

            <Text style={styles.infoValue}>{formatDate(leave.endDate)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reason</Text>

            <Text style={styles.infoValue}>{leave.reason}</Text>
          </View>
        </View>

        {userRole === "ADMIN" && (
          <>
            {leave.status === "Pending" && (
              <>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => updateStatus("Approved")}
                >
                  <Text style={styles.buttonText}>✅ Approve Leave</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => updateStatus("Rejected")}
                >
                  <Text style={styles.buttonText}>❌ Reject Leave</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.buttonText}>🗑 Delete Leave</Text>
            </TouchableOpacity>
          </>
        )}
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

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6FB",
  },

  back: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },

  header: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    alignItems: "center",
  },

  employeeName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  leaveType: {
    color: "#fff",
    marginTop: 5,
  },

  statusBadge: {
    marginTop: 15,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 12,
    color: "gray",
    fontWeight: "700",
    marginBottom: 15,
  },

  infoRow: {
    paddingVertical: 12,
  },

  infoLabel: {
    color: "gray",
    fontSize: 13,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEE",
  },

  approveButton: {
    backgroundColor: "#27AE60",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  rejectButton: {
    backgroundColor: "#EB5757",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  deleteButton: {
    backgroundColor: "#2D3436",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
