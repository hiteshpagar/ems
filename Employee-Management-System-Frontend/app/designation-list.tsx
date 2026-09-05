import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { Picker } from "@react-native-picker/picker";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import SearchBar from "../components/SearchBar";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import EmptyState from "../components/EmptyState";
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
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type DesignationPayload = {
  name: string;
  departmentId: number;
  description: string;
};

function getErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function DesignationListScreen() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [editingDesignation, setEditingDesignation] =
    useState<Designation | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredDesignations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return designations;

    return designations.filter((designation) => {
      const designationName = designation.name?.toLowerCase() ?? "";
      const departmentName = designation.departmentName?.toLowerCase() ?? "";
      const designationDescription =
        designation.description?.toLowerCase() ?? "";

      return (
        designationName.includes(query) ||
        departmentName.includes(query) ||
        designationDescription.includes(query)
      );
    });
  }, [designations, search]);

  const loadData = async () => {
    try {
      const [designationResponse, departmentResponse] = await Promise.all([
        API.get<Designation[]>("/designations"),
        API.get<Department[]>("/departments"),
      ]);

      const designationData = Array.isArray(designationResponse.data)
        ? designationResponse.data
        : [];
      const departmentData = Array.isArray(departmentResponse.data)
        ? departmentResponse.data
        : [];

      setDesignations(designationData);
      setDepartments(departmentData);
      setDepartmentId((prev) => prev ?? departmentData[0]?.id ?? null);
    } catch (error) {
      console.log("Error loading designations data:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingDesignation(null);
    setDepartmentId(departments[0]?.id ?? null);
    setShowForm(false);
  };

  const handleStartEdit = (item: Designation) => {
    setEditingDesignation(item);
    setName(item.name);
    setDepartmentId(item.departmentId);
    setDescription(item.description || "");
    setShowForm(true);
  };

  const buildPayload = (): DesignationPayload | null => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      Alert.alert("Validation", "Designation name is required.");
      return null;
    }

    if (!departmentId) {
      Alert.alert("Validation", "Please select a department.");
      return null;
    }

    return {
      name: trimmedName,
      departmentId,
      description: trimmedDescription,
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload) return;

    try {
      setSaving(true);

      if (editingDesignation) {
        const response = await API.put<Designation>(
          `/designations/${editingDesignation.id}`,
          payload
        );

        setDesignations((current) =>
          current.map((item) =>
            item.id === editingDesignation.id ? response.data : item
          )
        );

        Alert.alert("Success", "Designation updated successfully.");
      } else {
        const response = await API.post<Designation>("/designations", payload);
        setDesignations((current) => [response.data, ...current]);
        Alert.alert("Success", "Designation added successfully.");
      }

      resetForm();
    } catch (error) {
      console.log("Error saving designation:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Designation) => {
    Alert.alert(
      "Delete Designation",
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/designations/${item.id}`);
              setDesignations((current) =>
                current.filter((designation) => designation.id !== item.id)
              );
              Alert.alert("Success", "Designation deleted successfully.");
            } catch (error) {
              console.log("Error deleting designation:", error);
              Alert.alert("Error", getErrorMessage(error));
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Designations" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading designations...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Designations"
        subtitle={`${filteredDesignations.length} job titles configured`}
        showBack
      />

      <View style={styles.container}>
        {/* Search & Add Toggle */}
        <View style={styles.topSection}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search designations, departments..."
            style={styles.searchBar}
          />

          {!showForm ? (
            <CustomButton
              title="+ Add Designation"
              onPress={() => {
                resetForm();
                setShowForm(true);
              }}
              size="sm"
              style={styles.addToggleBtn}
            />
          ) : null}
        </View>

        {/* Add / Edit Form */}
        {showForm ? (
          <View style={styles.formCard}>
            <Text style={styles.formHeading}>
              {editingDesignation ? "Edit Designation" : "New Designation"}
            </Text>

            <CustomInput
              label="Designation Name"
              placeholder="e.g. Senior Software Engineer"
              value={name}
              onChangeText={setName}
              required
            />

            <View style={styles.pickerField}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Department</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={departmentId}
                  onValueChange={(value) => setDepartmentId(value)}
                  enabled={departments.length > 0}
                  style={styles.picker}
                >
                  {departments.length === 0 ? (
                    <Picker.Item
                      label="Create a department first"
                      value={null}
                    />
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
              </View>
            </View>

            <CustomInput
              label="Description"
              placeholder="Optional role description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            <View style={styles.formButtonsRow}>
              <CustomButton
                title={editingDesignation ? "Update" : "Save Designation"}
                onPress={handleSubmit}
                loading={saving}
                style={styles.saveBtn}
                size="sm"
              />
              <CustomButton
                title="Cancel"
                onPress={resetForm}
                variant="secondary"
                style={styles.cancelBtn}
                size="sm"
              />
            </View>
          </View>
        ) : null}

        {/* List */}
        <FlatList
          data={filteredDesignations}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={AppColors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="💼"
              title="No Designations Found"
              message={
                search
                  ? `No designations match "${search}".`
                  : "Add job titles for your company departments."
              }
              actionTitle={search ? "Clear Search" : "+ Add Designation"}
              onAction={() => {
                if (search) setSearch("");
                else setShowForm(true);
              }}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>💼</Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.title}>{item.name}</Text>
                <View style={styles.deptBadge}>
                  <Text style={styles.deptBadgeText}>
                    🏢 {item.departmentName}
                  </Text>
                </View>
                {item.description ? (
                  <Text style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleStartEdit(item)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.name}`}
                >
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleDelete(item)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.name}`}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
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
  topSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    marginBottom: 8,
  },
  addToggleBtn: {
    marginTop: 4,
  },
  formCard: {
    backgroundColor: AppColors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: AppRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.card,
  },
  formHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 12,
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
  formButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  saveBtn: {
    flex: 1,
  },
  cancelBtn: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.indigoLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
  },
  deptBadge: {
    backgroundColor: AppColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: AppRadius.sm,
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 4,
  },
  deptBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  desc: {
    fontSize: 12,
    color: AppColors.textMuted,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: AppRadius.sm,
    backgroundColor: AppColors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    fontSize: 14,
  },
  deleteIcon: {
    fontSize: 14,
  },
});
