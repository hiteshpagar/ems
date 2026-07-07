import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";

import { Image } from "react-native";

import { TouchableOpacity } from "react-native";

import { router } from "expo-router";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await API.get("/profile");

      setProfile(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.avatarContainer}>
            {profile?.photoUrl ? (
              <Image
                source={{
                  uri: `http://10.0.2.2:8080${profile.photoUrl}`,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profile?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{profile?.name}</Text>

          <Text style={styles.department}>{profile?.department}</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Personal Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👤 Full Name</Text>
            <Text style={styles.infoValue}>{profile?.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📧 Email</Text>
            <Text style={styles.infoValue}>{profile?.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏢 Department</Text>
            <Text style={styles.infoValue}>{profile?.department}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💰 Salary</Text>
            <Text style={styles.infoValue}>
              ₹ {Number(profile?.salary || 0).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔐 Account Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🆔 Employee ID</Text>
            <Text style={styles.infoValue}>EMP-{profile?.id}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👤 Role</Text>
            <Text style={styles.infoValue}>Employee</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🟢 Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Quick Actions</Text>

          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/edit-profile")}
          >
            <Text style={styles.actionText}>✏️ Edit Profile</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionText}>🔒 Change Password</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    borderRadius: 24,
    paddingTop: 40,
    paddingBottom: 35,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },

  avatarContainer: {
    marginBottom: 15,
  },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },

  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#ffffff30",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },

  avatarText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
  },

  name: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  department: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    marginTop: 6,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#EEF2F7",
    padding: 20,
  },

  space: {
    marginTop: 15,
  },

  role: {
    color: "#D1D5DB",
    fontSize: 14,
    marginTop: 4,
  },

  email: {
    color: "#E5E7EB",
    fontSize: 14,
    marginTop: 8,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    letterSpacing: 1,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },

  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  cardTitle: {
    fontSize: 18,
    alignItems: "center",
    fontWeight: "700",
    marginBottom: 18,
    color: "#111827",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
  },

  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  arrow: {
    fontSize: 24,
    color: "#94A3B8",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },
  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 30,
  },

  statusText: {
    color: "#16A34A",
    fontWeight: "700",
  },
});
