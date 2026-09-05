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
import { useContext, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";

import API from "../services/api";
import ScreenWrapper from "../components/ScreenWrapper";
import AppHeader from "../components/AppHeader";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import CustomButton from "../components/CustomButton";
import { formatDate } from "../utils/date";
import { AuthContext } from "../context/AuthContext";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

interface Holiday {
  id: number;
  name: string;
  holidayDate: string;
  type: string;
  description?: string | null;
}

function getErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function HolidayListScreen() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === "ADMIN";

  const filteredHolidays = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return holidays;

    return holidays.filter((holiday) => {
      const name = holiday.name?.toLowerCase() ?? "";
      const type = holiday.type?.toLowerCase() ?? "";
      const description = holiday.description?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        type.includes(query) ||
        holiday.holidayDate.includes(query) ||
        description.includes(query)
      );
    });
  }, [holidays, search]);

  const fetchHolidays = async () => {
    try {
      const response = await API.get<Holiday[]>("/holidays");
      setHolidays(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Error loading holidays:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleDelete = (holiday: Holiday) => {
    Alert.alert(
      "Delete Holiday",
      `Are you sure you want to delete "${holiday.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/holidays/${holiday.id}`);
              setHolidays((current) =>
                current.filter((item) => item.id !== holiday.id)
              );
              Alert.alert("Success", "Holiday deleted successfully.");
            } catch (error) {
              console.log("Error deleting holiday:", error);
              Alert.alert("Error", getErrorMessage(error));
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHolidays();
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Holidays" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading holiday calendar...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const parseHolidayDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { day: "--", month: "--", weekday: "" };
      const day = date.getDate().toString();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
      return { day, month, weekday };
    } catch {
      return { day: "--", month: "--", weekday: "" };
    }
  };

  return (
    <ScreenWrapper>
      <AppHeader
        title="Holidays"
        subtitle={`${filteredHolidays.length} upcoming holidays`}
        showBack
      />

      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchSection}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search holidays, type, month..."
          />
        </View>

        {/* List */}
        <FlatList
          data={filteredHolidays}
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
              icon="🗓️"
              title="No Holidays Found"
              message={
                search
                  ? `No holidays match "${search}".`
                  : "No holidays have been scheduled yet."
              }
              actionTitle={isAdmin ? "+ Add Holiday" : undefined}
              onAction={isAdmin ? () => router.push("/add-holiday") : undefined}
            />
          }
          renderItem={({ item }) => {
            const { day, month, weekday } = parseHolidayDate(item.holidayDate);

            return (
              <View style={styles.card}>
                {/* Date Badge */}
                <View style={styles.dateBlock}>
                  <Text style={styles.dateMonth}>{month}</Text>
                  <Text style={styles.dateDay}>{day}</Text>
                  <Text style={styles.dateWeekday}>{weekday}</Text>
                </View>

                {/* Holiday Info */}
                <View style={styles.info}>
                  <Text style={styles.holidayName}>{item.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {item.type || "Public Holiday"}
                      </Text>
                    </View>
                    <Text style={styles.fullDateText}>
                      {formatDate(item.holidayDate)}
                    </Text>
                  </View>
                  {item.description ? (
                    <Text style={styles.desc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>

                {/* Actions for Admin */}
                {isAdmin ? (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => router.push(`/edit-holiday?id=${item.id}`)}
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
                ) : null}
              </View>
            );
          }}
        />

        {/* Admin Add Button */}
        {isAdmin ? (
          <View style={styles.bottomBar}>
            <CustomButton
              title="+ Add Holiday"
              onPress={() => router.push("/add-holiday")}
            />
          </View>
        ) : null}
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
  dateBlock: {
    width: 52,
    height: 60,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: "700",
    color: AppColors.primary,
    textTransform: "uppercase",
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.primaryDark,
    lineHeight: 22,
  },
  dateWeekday: {
    fontSize: 9,
    color: AppColors.textMuted,
    fontWeight: "600",
  },
  info: {
    flex: 1,
  },
  holidayName: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.text,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: AppColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: AppRadius.sm,
    marginRight: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  fullDateText: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  desc: {
    fontSize: 12,
    color: AppColors.textSecondary,
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
