import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useEffect, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";

import API from "../services/api";

import ScreenWrapper from "../components/ScreenWrapper";

export default function AttendanceHistoryScreen() {
  const [attendance, setAttendance] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = async () => {
    try {
      const response = await API.get("/attendance");

      setAttendance(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
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
      <FlatList
        data={attendance}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAttendance();
            }}
          />
        }
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={["#0F2027", "#203A43", "#2C5364"]}
              style={styles.header}
            >
              <Text style={styles.headerTitle}>Attendance History</Text>

              <Text style={styles.headerSubtitle}>
                Track attendance records
              </Text>
            </LinearGradient>

            <Text style={styles.sectionLabel}>ALL ATTENDANCE RECORDS</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.attendanceCard}>
            <Text style={styles.employeeName}>👤 {item.employeeName}</Text>

            <Text style={styles.info}>📅 {item.date}</Text>

            <Text style={styles.info}>⏰ Check In : {item.checkInTime}</Text>

            <Text style={styles.info}>
              ⏰ Check Out : {item.checkOutTime || "Not Checked Out"}
            </Text>

            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>🟢 {item.status}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No attendance records found</Text>
          </View>
        }
      />
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
    padding: 20,
    backgroundColor: "#F4F6FB",
    flexGrow: 1,
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

  sectionLabel: {
    color: "rgba(0,0,0,0.4)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 14,
    letterSpacing: 1.2,
  },

  attendanceCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
  },

  employeeName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  info: {
    color: "#555",
    marginBottom: 6,
  },

  statusContainer: {
    marginTop: 10,
  },

  statusText: {
    fontWeight: "700",
    color: "#27AE60",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },

  emptyText: {
    color: "gray",
    fontSize: 16,
  },
});
