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

import { router } from "expo-router";

import { TouchableOpacity } from "react-native";

export default function LeaveListScreen() {
  const [leaves, setLeaves] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaves = async () => {
    try {
      const response = await API.get("/leaves");

      setLeaves(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
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
      <FlatList
        data={leaves}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchLeaves();
            }}
          />
        }
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={["#0F2027", "#203A43", "#2C5364"]}
              style={styles.header}
            >
              <Text style={styles.headerTitle}>Leave Management</Text>

              <Text style={styles.headerSubtitle}>
                Track all leave requests
              </Text>
            </LinearGradient>

            <Text style={styles.sectionLabel}>ALL LEAVE REQUESTS</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/leave-details?id=${item.id}`)}
          >
            <View style={styles.leaveCard}>
              <View style={styles.cardTop}>
                <Text style={styles.employeeName}>{item.employeeName}</Text>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(item.status),
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.leaveType}>🏖 {item.leaveType}</Text>

              <Text style={styles.dateText}>
                📅 {item.startDate} → {item.endDate}
              </Text>

              <Text style={styles.reason}>📝 {item.reason}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.viewDetails}>View Details →</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No leave requests found</Text>
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

  leaveCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  employeeName: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  leaveType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  dateText: {
    color: "#555",
    marginBottom: 8,
  },

  reason: {
    color: "#777",
    lineHeight: 22,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },

  emptyText: {
    color: "gray",
    fontSize: 16,
  },
  cardFooter: {
    marginTop: 12,
    alignItems: "flex-end",
  },

  viewDetails: {
    color: "#2F80ED",
    fontWeight: "600",
  },
});
