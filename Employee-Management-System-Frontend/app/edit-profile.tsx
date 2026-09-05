import { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

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
      setName(response.data.name || "");
      setEmail(response.data.email || "");
      setDepartment(response.data.department || "");
      setSalary(response.data.salary ? response.data.salary.toString() : "0");
    } catch (error) {
      console.log("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Required Field", "Name is required.");
      return;
    }

    try {
      setSaving(true);
      await API.put("/profile", {
        name: name.trim(),
      });

      Alert.alert("Success", "Profile updated successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Edit Profile" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading profile details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Edit Profile"
        subtitle="Update your personal details"
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Editable Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Editable Information</Text>

          <CustomInput
            label="Full Name"
            placeholder="Enter full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            required
          />
        </View>

        {/* Read-Only Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Organization Information</Text>

          <CustomInput
            label="Email Address"
            value={email}
            editable={false}
            helperText="Contact system administrator to change email."
          />

          <CustomInput
            label="Department"
            value={department || "Not Assigned"}
            editable={false}
          />

          <CustomInput
            label="Basic Salary (₹)"
            value={Number(salary || 0).toLocaleString("en-IN")}
            editable={false}
          />
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Save Changes"
          onPress={handleUpdate}
          loading={saving}
          style={styles.submitBtn}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    paddingBottom: 8,
  },
  submitBtn: {
    marginTop: 8,
  },
});
