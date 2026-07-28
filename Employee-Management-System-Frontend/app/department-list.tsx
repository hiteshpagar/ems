import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import ScreenWrapper from "../components/ScreenWrapper";
import API from "../services/api";

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

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return departments;
    }

    return departments.filter((department) => {
      const departmentName = department.name?.toLowerCase() ?? "";
      const departmentDescription =
        department.description?.toLowerCase() ?? "";

      return (
        departmentName.includes(query) ||
        departmentDescription.includes(query)
      );
    });
  }, [departments, search]);

  const fetchDepartments = async () => {
    try {
      const response = await API.get<Department[]>("/departments");
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
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

    if (!payload) {
      return;
    }

    try {
      setSaving(true);

      if (editingDepartment) {
        const response = await API.put<Department>(
          `/departments/${editingDepartment.id}`,
          payload,
        );

        setDepartments((currentDepartments) =>
          currentDepartments.map((department) =>
            department.id === editingDepartment.id
              ? response.data
              : department,
          ),
        );

        Alert.alert("Success", "Department updated successfully.");
      } else {
        const response = await API.post<Department>("/departments", payload);
        setDepartments((currentDepartments) => [response.data, ...currentDepartments]);
        Alert.alert("Success", "Department created successfully.");
      }

      resetForm();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setName(department.name);
    setDescription(department.description ?? "");
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
              setDepartments((currentDepartments) =>
                currentDepartments.filter((item) => item.id !== department.id),
              );

              if (editingDepartment?.id === department.id) {
                resetForm();
              }

              Alert.alert("Success", "Department deleted successfully.");
            } catch (error) {
              console.log(error);
              Alert.alert("Error", getErrorMessage(error));
            }
          },
        },
      ],
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDepartments();
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.loader}
        >
          <ActivityIndicator size="large" color="#56CCF2" />
          <Text style={styles.loaderTitle}>Loading Departments</Text>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.root}>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Departments</Text>
            <Text style={styles.headerSub}>
              {departments.length} total department
              {departments.length === 1 ? "" : "s"}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editingDepartment ? "Edit Department" : "Add Department"}
          </Text>

          <TextInput
            placeholder="Department name"
            placeholderTextColor="rgba(0,0,0,0.35)"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            placeholder="Description"
            placeholderTextColor="rgba(0,0,0,0.35)"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={255}
            style={[styles.input, styles.textArea]}
          />

          <View style={styles.formActions}>
            {editingDepartment && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={resetForm}
                disabled={saving}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {editingDepartment ? "Update" : "Create"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search departments"
            placeholderTextColor="rgba(0,0,0,0.35)"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredDepartments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No Departments Found</Text>
              <Text style={styles.emptySub}>
                {search
                  ? "Try a different search term."
                  : "Create your first department above."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.departmentBadge}>
                  <Text style={styles.departmentInitial}>
                    {item.name.slice(0, 1).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.description}>
                    {item.description || "No description added."}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.smallButton, styles.editButton]}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButton, styles.deleteButton]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
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
  root: {
    flex: 1,
    backgroundColor: "#F4F6FB",
    margin: -20,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    margin: -20,
  },

  loaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  header: {
    minHeight: 150,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    justifyContent: "flex-end",
  },

  backBtn: {
    position: "absolute",
    top: 18,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: "#fff",
    fontSize: 34,
    lineHeight: 36,
  },

  headerTextGroup: {
    gap: 6,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },

  headerSub: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 15,
  },

  form: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -18,
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  formTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2933",
    marginBottom: 12,
  },

  input: {
    minHeight: 48,
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E4E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#1F2933",
    fontSize: 15,
    marginBottom: 10,
  },

  textArea: {
    minHeight: 82,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  button: {
    minWidth: 104,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  primaryButton: {
    backgroundColor: "#2F80ED",
  },

  secondaryButton: {
    backgroundColor: "#EEF2F7",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },

  secondaryButtonText: {
    color: "#334155",
    fontWeight: "800",
  },

  searchBox: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E4E8F0",
  },

  searchInput: {
    flex: 1,
    color: "#1F2933",
    fontSize: 15,
  },

  clearText: {
    color: "#2F80ED",
    fontWeight: "800",
    marginLeft: 10,
  },

  listContent: {
    padding: 16,
    paddingBottom: 28,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8ECF2",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  departmentBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(47,128,237,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  departmentInitial: {
    color: "#2F80ED",
    fontSize: 20,
    fontWeight: "900",
  },

  cardInfo: {
    flex: 1,
  },

  name: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },

  description: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },

  smallButton: {
    minWidth: 78,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  editButton: {
    backgroundColor: "rgba(47,128,237,0.12)",
  },

  deleteButton: {
    backgroundColor: "rgba(235,87,87,0.12)",
  },

  editButtonText: {
    color: "#2F80ED",
    fontWeight: "800",
  },

  deleteButtonText: {
    color: "#EB5757",
    fontWeight: "800",
  },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },

  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },

  emptySub: {
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
  },
});
