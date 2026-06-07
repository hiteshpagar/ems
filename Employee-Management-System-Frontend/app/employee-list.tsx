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
import { useEffect, useState } from "react";

import ScreenWrapper from "../components/ScreenWrapper";
import API from "../services/api";

// ─── Avatar initials helper ───────────────────────────────────────────────────
function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

// ─── Deterministic gradient per employee ─────────────────────────────────────
const AVATAR_GRADIENTS: [string, string][] = [
  ["#2F80ED", "#56CCF2"],
  ["#11998e", "#38ef7d"],
  ["#f7971e", "#ffd200"],
  ["#c94b4b", "#4b134f"],
  ["#4776E6", "#8E54E9"],
  ["#f953c6", "#b91d73"],
];
function getGradient(id: number): [string, string] {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];
}

// ─── Department tag colours ───────────────────────────────────────────────────
const DEPT_COLORS: Record<string, { bg: string; text: string }> = {
  Engineering: { bg: "rgba(47,128,237,0.12)", text: "#2F80ED" },
  Design: { bg: "rgba(249,83,198,0.12)", text: "#f953c6" },
  Marketing: { bg: "rgba(255,210,0,0.15)", text: "#c98a00" },
  HR: { bg: "rgba(17,153,142,0.12)", text: "#11998e" },
  Finance: { bg: "rgba(71,118,230,0.12)", text: "#4776E6" },
};
function getDeptStyle(dept: string) {
  return DEPT_COLORS[dept] ?? { bg: "rgba(120,120,120,0.12)", text: "#666" };
}

export default function EmployeeListScreen() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── All logic below is UNCHANGED ──────────────────────────────────────────
  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees");
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = employees.filter((employee: any) =>
      employee.name.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredEmployees(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  const handleDeleteEmployee = async (id: number) => {
    Alert.alert("Delete Employee", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await API.delete(`/employees/${id}`);
            Alert.alert("Success", "Employee Deleted");
            fetchEmployees();
          } catch (error) {
            console.log(error);
            Alert.alert("Error", "Delete Failed");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  // ── End of untouched logic ─────────────────────────────────────────────────

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ScreenWrapper>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.loaderGradient}
        >
          <View style={styles.loaderInner}>
            <View style={styles.loaderRing}>
              <ActivityIndicator size="large" color="#56CCF2" />
            </View>
            <Text style={styles.loaderTitle}>Loading Employees</Text>
            <Text style={styles.loaderSub}>Fetching your team data…</Text>
          </View>
        </LinearGradient>
      </ScreenWrapper>
    );
  }

  // ── Main screen ────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper>
      <View style={styles.root}>
        {/* ── Header ── */}
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* decorative circles */}
          <View style={styles.deco1} />
          <View style={styles.deco2} />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Team{"\n"}Directory</Text>

          {/* count pill */}
          <View style={styles.countPill}>
            <Text style={styles.countNum}>{filteredEmployees.length}</Text>
            <Text style={styles.countLabel}> members</Text>
          </View>
        </LinearGradient>

        {/* ── Search bar ── */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Search by name…"
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={search}
              onChangeText={handleSearch} // ← untouched
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Section label ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>ALL EMPLOYEES</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* ── List ── */}
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh} // ← untouched
              tintColor="#2F80ED"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔎</Text>
              <Text style={styles.emptyTitle}>No Employees Found</Text>
              <Text style={styles.emptySub}>Try a different search term</Text>
            </View>
          }
          renderItem={({ item, index }: any) => {
            const grad = getGradient(item.id);
            const dept = getDeptStyle(item.department);
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  console.log("Clicked Employee:", item.id);

                  router.push(`/employee-details?id=${item.id}`);
                }}
              >
                <View style={styles.card}>
                  {/* left accent bar */}
                  <LinearGradient
                    colors={grad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.cardAccent}
                  />

                  {/* avatar + info row */}
                  <View style={styles.cardTop}>
                    <LinearGradient colors={grad} style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getInitials(item.name)}
                      </Text>
                    </LinearGradient>

                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <Text style={styles.cardEmail}>{item.email}</Text>
                    </View>

                    {/* index badge */}
                    <View style={styles.indexBadge}>
                      <Text style={styles.indexText}>
                        {String(index + 1).padStart(2, "0")}
                      </Text>
                    </View>
                  </View>

                  {/* meta chips row */}
                  <View style={styles.metaRow}>
                    <View
                      style={[styles.deptChip, { backgroundColor: dept.bg }]}
                    >
                      <Text style={[styles.deptText, { color: dept.text }]}>
                        {item.department}
                      </Text>
                    </View>

                    <View style={styles.salaryChip}>
                      <Text style={styles.salaryText}>₹ {item.salary}</Text>
                    </View>
                  </View>

                  {/* divider */}
                  <View style={styles.cardDivider} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F6FB" },

  /* ─── Loader ─── */
  loaderGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderInner: { alignItems: "center" },
  loaderRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(86,204,242,0.1)",
    borderWidth: 1,
    borderColor: "rgba(86,204,242,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loaderTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  loaderSub: { color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 6 },

  /* ─── Header ─── */
  header: {
    paddingTop: 54,
    paddingBottom: 36,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  deco1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(86,204,242,0.07)",
    top: -60,
    right: -50,
  },
  deco2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(47,128,237,0.09)",
    bottom: -30,
    left: -20,
  },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 18,
  },
  backIcon: { color: "#fff", fontSize: 22, fontWeight: "300" },
  headerTitle: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 16,
  },
  countPill: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "rgba(86,204,242,0.15)",
    borderColor: "rgba(86,204,242,0.3)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignItems: "center",
  },
  countNum: { color: "#56CCF2", fontSize: 14, fontWeight: "800" },
  countLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13 },

  /* ─── Search ─── */
  searchWrapper: { paddingHorizontal: 18, marginTop: -18 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#1a1a2e", paddingVertical: 12 },
  clearIcon: { fontSize: 14, color: "rgba(0,0,0,0.3)", paddingLeft: 8 },

  /* ─── Section label ─── */
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 12,
    gap: 10,
  },
  sectionLabel: {
    color: "rgba(0,0,0,0.32)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: "rgba(0,0,0,0.07)" },

  /* ─── List ─── */
  listContent: { paddingHorizontal: 18, paddingBottom: 30 },

  /* ─── Card ─── */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    flexDirection: "column",
  },
  cardAccent: { height: 4, width: "100%" },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a2e",
    letterSpacing: -0.2,
  },
  cardEmail: { fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 2 },
  indexBadge: {
    backgroundColor: "#F4F6FB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  indexText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(0,0,0,0.3)",
    letterSpacing: 0.5,
  },

  /* meta chips */
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  deptChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deptText: { fontSize: 12, fontWeight: "700" },
  salaryChip: {
    backgroundColor: "rgba(17,153,142,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  salaryText: { fontSize: 12, fontWeight: "700", color: "#11998e" },

  /* divider */
  cardDivider: { height: 1, backgroundColor: "#F4F6FB", marginHorizontal: 16 },

  /* action buttons */
  actionRow: {
    flexDirection: "row",
    padding: 14,
    gap: 10,
  },
  editBtn: { flex: 1, borderRadius: 12, overflow: "hidden" },
  deleteBtn: { flex: 1, borderRadius: 12, overflow: "hidden" },
  editGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    gap: 6,
  },
  deleteGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    gap: 6,
  },
  editIcon: { fontSize: 14 },
  editText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  deleteIcon: { fontSize: 14 },
  deleteText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  /* ─── Empty ─── */
  emptyBox: {
    alignItems: "center",
    marginTop: 60,
    gap: 8,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#1a1a2e" },
  emptySub: { fontSize: 13, color: "rgba(0,0,0,0.35)" },
});
