import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
}

export default function AddEmployeeScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [designationId, setDesignationId] = useState<number | null>(null);
  const [salary, setSalary] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [masterLoading, setMasterLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const filteredDesignations = useMemo(
    () =>
      designations.filter(
        (designation) => designation.departmentId === departmentId
      ),
    [departmentId, designations]
  );

  const selectedDepartment = departments.find(
    (department) => department.id === departmentId
  );

  const selectedDesignation = designations.find(
    (designation) => designation.id === designationId
  );

  const fetchMasterData = async () => {
    try {
      const [departmentResponse, designationResponse] = await Promise.all([
        API.get<Department[]>("/departments"),
        API.get<Designation[]>("/designations"),
      ]);

      const departmentData = Array.isArray(departmentResponse.data)
        ? departmentResponse.data
        : [];
      const designationData = Array.isArray(designationResponse.data)
        ? designationResponse.data
        : [];

      setDepartments(departmentData);
      setDesignations(designationData);
      setDepartmentId(departmentData[0]?.id ?? null);
    } catch (error) {
      console.log("Error loading master data:", error);
      Alert.alert("Error", "Failed to load departments and designations");
    } finally {
      setMasterLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    setDesignationId((currentDesignationId) => {
      const currentStillValid = filteredDesignations.some(
        (designation) => designation.id === currentDesignationId
      );

      if (currentStillValid) {
        return currentDesignationId;
      }

      return filteredDesignations[0]?.id ?? null;
    });
  }, [filteredDesignations]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!imageUri) return "";

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.photoUrl || "";
    } catch (error) {
      console.log("Image upload failed:", error);
      return "";
    }
  };

  const handleAddEmployee = async () => {
    if (!name.trim() || !email.trim() || !salary) {
      Alert.alert("Required Fields", "Please fill all required fields.");
      return;
    }

    if (!selectedDepartment || !selectedDesignation) {
      Alert.alert(
        "Validation",
        "Please select a department and a designation for this employee."
      );
      return;
    }

    try {
      setSaving(true);
      const uploadedPhotoUrl = await uploadImage();

      await API.post("/employees", {
        name: name.trim(),
        email: email.trim(),
        department: selectedDepartment.name,
        designation: selectedDesignation.name,
        salary: Number(salary),
        photoUrl: uploadedPhotoUrl,
      });

      Alert.alert("Success", "Employee added successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add employee.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title="Add Employee"
        subtitle="Register a new team member"
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Personal Information</Text>

          <CustomInput
            label="Full Name"
            placeholder="e.g. John Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            required
          />

          <CustomInput
            label="Email Address"
            placeholder="john.doe@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            required
          />
        </View>

        {/* Employment Information */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Employment Information</Text>

          <View style={styles.pickerField}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Department</Text>
              <Text style={styles.requiredStar}> *</Text>
            </View>
            <View style={styles.pickerContainer}>
              {masterLoading ? (
                <ActivityIndicator color={AppColors.primary} />
              ) : (
                <Picker
                  selectedValue={departmentId}
                  onValueChange={(value) => setDepartmentId(value)}
                  enabled={departments.length > 0}
                  style={styles.picker}
                >
                  {departments.length === 0 ? (
                    <Picker.Item label="No departments found" value={null} />
                  ) : (
                    departments.map((dept) => (
                      <Picker.Item
                        key={dept.id}
                        label={dept.name}
                        value={dept.id}
                      />
                    ))
                  )}
                </Picker>
              )}
            </View>
          </View>

          <View style={styles.pickerField}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Designation</Text>
              <Text style={styles.requiredStar}> *</Text>
            </View>
            <View style={styles.pickerContainer}>
              {masterLoading ? (
                <ActivityIndicator color={AppColors.primary} />
              ) : (
                <Picker
                  selectedValue={designationId}
                  onValueChange={(value) => setDesignationId(value)}
                  enabled={filteredDesignations.length > 0}
                  style={styles.picker}
                >
                  {filteredDesignations.length === 0 ? (
                    <Picker.Item
                      label="Select department to view designations"
                      value={null}
                    />
                  ) : (
                    filteredDesignations.map((desig) => (
                      <Picker.Item
                        key={desig.id}
                        label={desig.name}
                        value={desig.id}
                      />
                    ))
                  )}
                </Picker>
              )}
            </View>
          </View>

          <CustomInput
            label="Monthly Basic Salary (₹)"
            placeholder="50000"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            required
          />

          {/* Photo Picker */}
          <View style={styles.photoSection}>
            <Text style={styles.label}>Profile Photo</Text>
            <View style={styles.photoRow}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoIcon}>📷</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.pickButton}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                <Text style={styles.pickButtonText}>
                  {imageUri ? "Change Photo" : "Choose Image"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Submit */}
        <CustomButton
          title="Save Employee"
          onPress={handleAddEmployee}
          loading={saving}
          style={styles.submitButton}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    paddingBottom: 8,
  },
  pickerField: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  requiredStar: {
    color: AppColors.danger,
    fontSize: 13,
    fontWeight: "600",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: AppColors.borderStrong,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surface,
    overflow: "hidden",
  },
  picker: {
    height: 46,
  },
  photoSection: {
    marginTop: 4,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  previewImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: AppColors.surfaceMuted,
  },
  photoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  photoIcon: {
    fontSize: 22,
  },
  pickButton: {
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: AppRadius.md,
  },
  pickButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.text,
  },
  submitButton: {
    marginTop: 8,
  },
});
