import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";

import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState("");

  const fetchProfile = async () => {
    try {
      const response = await API.get("/profile");

      setName(response.data.name);
      setEmail(response.data.email);
      setDepartment(response.data.department);
      setSalary(response.data.salary.toString());
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      setSaving(true);

      await API.put("/profile", {
        name,
      });

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Edit Profile</Text>

          <Text style={styles.headerSubtitle}>
            Update your personal information
          </Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 Editable Information</Text>

          <Text style={styles.label}>Full Name</Text>

          <CustomInput
            placeholder="Enter Full Name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔒 Read Only Information</Text>

          <Text style={styles.label}>Email</Text>

          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{email}</Text>
          </View>

          <Text style={styles.label}>Department</Text>

          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{department}</Text>
          </View>

          <Text style={styles.label}>Salary</Text>

          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>
              ₹ {Number(salary).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <CustomButton
          title={saving ? "Updating..." : "Update Profile"}
          onPress={handleUpdate}
        />
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
    backgroundColor: "#EEF2F7",
    padding: 10,
  },

  contentContainer: {
    paddingBottom: 40,
  },

  back: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },

  header: {
    borderRadius: 22,
    padding: 25,
    marginBottom: 20,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
    fontSize: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    marginTop: 12,
  },

  readOnlyBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 15,
  },

  readOnlyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
});
