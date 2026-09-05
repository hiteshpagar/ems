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
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type DepartmentPayload = {
  name: string;
  description: string;
};

function getErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function DepartmentListScreen() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return departments;

    return departments.filter((department) => {
      const deptName = department.name?.toLowerCase() ?? "";
      const deptDesc = department.description?.toLowerCase() ?? "";
      return deptName.includes(query) || deptDesc.includes(query);
    });
  }, [departments, search]);

  const fetchDepartments = async () => {
    try {
      const response = await API.get<Department[]>("/departments");
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Error fetching departments:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingDepartment(null);
    setShowForm(false);
  };

  const handleStartEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setName(dept.name);
    setDescription(dept.description || "");
    setShowForm(true);
  };

  const buildPayload = (): DepartmentPayload | null => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      Alert.alert("Validation", "Department name is required.");
      return null;
    }

    if (trimmedName.length > 100) {
      Alert.alert("Validation", "Department name cannot exceed 100 characters.");
      return null;
    }

    if (trimmedDescription.length > 255) {
      Alert.alert("Validation", "Description cannot exceed 255 characters.");
      return null;
    }

    return {
      name: trimmedName,
      description: trimmedDescription,
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload) return;

    try {
      setSaving(true);

      if (editingDepartment) {
        const response = await API.put<Department>(
          `/departments/${editingDepartment.id}`,
          payload
        );

        setDepartments((current) =>
          current.map((dept) =>
            dept.id === editingDepartment.id ? response.data : dept
          )
        );

        Alert.alert("Success", "Department updated successfully.");
      } else {
        const response = await API.post<Department>("/departments", payload);
        setDepartments((current) => [response.data, ...current]);
        Alert.alert("Success", "Department added successfully.");
      }

      resetForm();
    } catch (error) {
      console.log("Error saving department:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (department: Department) => {
    Alert.alert(
      "Delete Department",
      `Are you sure you want to delete ${department.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/departments/${department.id}`);
              setDepartments((current) =>
                current.filter((item) => item.id !== department.id)
              );
              Alert.alert("Success", "Department deleted successfully.");
            } catch (error) {
              console.log("Error deleting department:", error);
              Alert.alert("Error", getErrorMessage(error));
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDepartments();
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Departments" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading departments...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Departments"
        subtitle={`${filteredDepartments.length} registered departments`}
        showBack
      />

      <View style={styles.container}>
        {/* Search & Toggle Add Form */}
        <View style={styles.topSection}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search departments..."
            style={styles.searchBar}
          />

          {!showForm ? (
            <CustomButton
              title="+ Add Department"
              onPress={() => {
                resetForm();
                setShowForm(true);
              }}
              size="sm"
              style={styles.addToggleBtn}
            />
          ) : null}
        </View>

        {/* Add / Edit Form Card */}
        {showForm ? (
          <View style={styles.formCard}>
            <Text style={styles.formHeading}>
              {editingDepartment ? "Edit Department" : "New Department"}
            </Text>

            <CustomInput
              label="Department Name"
              placeholder="e.g. Engineering, Marketing"
              value={name}
              onChangeText={setName}
              required
            />

            <CustomInput
              label="Description"
              placeholder="Optional department description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            <View style={styles.formButtonsRow}>
              <CustomButton
                title={editingDepartment ? "Update" : "Save Department"}
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

        {/* List of Departments */}
        <FlatList
          data={filteredDepartments}
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
              icon="🏢"
              title="No Departments Found"
              message={
                search
                  ? `No departments match "${search}".`
                  : "Create your first company department."
              }
              actionTitle={search ? "Clear Search" : "+ Add Department"}
              onAction={() => {
                if (search) setSearch("");
                else setShowForm(true);
              }}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.deptCard}>
              <View style={styles.deptIcon}>
                <Text style={styles.deptIconText}>🏢</Text>
              </View>

              <View style={styles.deptInfo}>
                <Text style={styles.deptName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.deptDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : (
                  <Text style={styles.deptDescMuted}>No description provided</Text>
                )}
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
  deptCard: {
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
  deptIcon: {
    width: 42,
    height: 42,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deptIconText: {
    fontSize: 20,
  },
  deptInfo: {
    flex: 1,
  },
  deptName: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
  },
  deptDesc: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  deptDescMuted: {
    fontSize: 12,
    color: AppColors.textMuted,
    fontStyle: "italic",
    marginTop: 2,
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
