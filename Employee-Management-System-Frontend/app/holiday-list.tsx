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

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HolidayListScreen() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const filteredHolidays = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return holidays;
    }

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
      console.log(error);
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
      `Are you sure you want to delete ${holiday.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/holidays/${holiday.id}`);
              setHolidays((currentHolidays) =>
                currentHolidays.filter((item) => item.id !== holiday.id),
              );
              Alert.alert("Success", "Holiday deleted successfully.");
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
    fetchHolidays();
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.loader}
        >
          <ActivityIndicator size="large" color="#56CCF2" />
          <Text style={styles.loaderTitle}>Loading Holidays</Text>
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
            <Text style={styles.headerTitle}>Holidays</Text>
            <Text style={styles.headerSub}>
              {holidays.length} total holiday{holidays.length === 1 ? "" : "s"}
            </Text>
          </View>
        </LinearGradient>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.addButton}
          onPress={() => router.push("/add-holiday")}
        >
          <Text style={styles.addButtonText}>Add Holiday</Text>
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search holidays"
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
          data={filteredHolidays}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No Holidays Found</Text>
              <Text style={styles.emptySub}>
                {search
                  ? "Try a different search term."
                  : "Create your first holiday."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateDay}>
                    {item.holidayDate.slice(8, 10)}
                  </Text>
                  <Text style={styles.dateMonth}>
                    {formatDate(item.holidayDate).split(" ")[1] ?? ""}
                  </Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.dateText}>
                    {formatDate(item.holidayDate)}
                  </Text>
                  <Text style={styles.description}>
                    {item.description || "No description added."}
                  </Text>
                </View>

                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.smallButton, styles.editButton]}
                  onPress={() => router.push(`/edit-holiday?id=${item.id}`)}
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

  addButton: {
    height: 48,
    backgroundColor: "#2F80ED",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: -18,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
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

  dateBox: {
    width: 50,
    height: 54,
    borderRadius: 8,
    backgroundColor: "rgba(47,128,237,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  dateDay: {
    color: "#2F80ED",
    fontSize: 20,
    fontWeight: "900",
  },

  dateMonth: {
    color: "#2F80ED",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  cardInfo: {
    flex: 1,
  },

  name: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },

  dateText: {
    color: "#11998e",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 5,
  },

  description: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },

  typeBadge: {
    backgroundColor: "rgba(142,68,173,0.1)",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  typeText: {
    color: "#8E44AD",
    fontSize: 12,
    fontWeight: "800",
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
