import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import SearchBar from "../components/SearchBar";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import CustomButton from "../components/CustomButton";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

export default function EmployeeListScreen() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees");
      const data = Array.isArray(response.data) ? response.data : [];
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.log("Error fetching employees:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredEmployees(employees);
      return;
    }
    const query = text.toLowerCase();
    const filtered = employees.filter((emp: any) =>
      emp.name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query) ||
      emp.designation?.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Employees" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader
        title="Employees"
        subtitle={`${filteredEmployees.length} total members`}
        showBack
      />

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={search}
            onChangeText={handleSearch}
            placeholder="Search by name, department, role..."
          />
        </View>

        {/* List */}
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item: any) => item.id.toString()}
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
              icon="👥"
              title="No Employees Found"
              message={
                search
                  ? `No employees match "${search}".`
                  : "No employees registered yet. Add your first employee."
              }
              actionTitle={search ? "Clear Search" : "Add Employee"}
              onAction={() => {
                if (search) handleSearch("");
                else router.push("/add-employee");
              }}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/employee-details?id=${item.id}`)}
              activeOpacity={0.75}
            >
              {item.photoUrl ? (
                <Image
                  source={{ uri: item.photoUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.name?.charAt(0)?.toUpperCase() || "E"}
                  </Text>
                </View>
              )}

              <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <StatusBadge
                    status={item.status || "Active"}
                    size="sm"
                  />
                </View>

                <Text style={styles.email} numberOfLines={1}>
                  {item.email}
                </Text>

                <View style={styles.tagsRow}>
                  {item.department ? (
                    <View style={styles.deptTag}>
                      <Text style={styles.deptTagText}>{item.department}</Text>
                    </View>
                  ) : null}

                  {item.designation ? (
                    <Text style={styles.designationText} numberOfLines={1}>
                      · {item.designation}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />

        {/* Bottom Add Employee Bar */}
        <View style={styles.bottomBar}>
          <CustomButton
            title="+ Add Employee"
            onPress={() => router.push("/add-employee")}
          />
        </View>
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
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
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
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: AppColors.surfaceMuted,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.primary,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
    flex: 1,
    marginRight: 8,
  },
  email: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deptTag: {
    backgroundColor: AppColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: AppRadius.sm,
    marginRight: 6,
  },
  deptTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  designationText: {
    fontSize: 11,
    color: AppColors.textMuted,
    flex: 1,
  },
  chevron: {
    fontSize: 22,
    color: AppColors.textMuted,
    marginLeft: 8,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.surface,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
