import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppColors } from "../constants/theme";

type Props = {
  role?: "ADMIN" | "EMPLOYEE" | string | null;
};

export default function BottomNav({ role = "EMPLOYEE" }: Props) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";

  const adminTabs = [
    { label: "Dashboard", icon: "📊", route: "/dashboard" },
    { label: "Employees", icon: "👥", route: "/employee-list" },
    { label: "Attendance", icon: "🕒", route: "/attendance" },
    { label: "Leave", icon: "📋", route: "/leave-list" },
    { label: "Profile", icon: "👤", route: "/profile" },
  ];

  const employeeTabs = [
    { label: "Home", icon: "🏠", route: "/dashboard" },
    { label: "Attendance", icon: "🕒", route: "/attendance" },
    { label: "Leave", icon: "🏖️", route: "/leave-list" },
    { label: "Payslips", icon: "💵", route: "/payslips" },
    { label: "Profile", icon: "👤", route: "/profile" },
  ];

  const tabs = isAdmin ? adminTabs : employeeTabs;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.route ||
          (tab.route === "/dashboard" && (pathname === "/" || pathname === "/dashboard"));

        return (
          <TouchableOpacity
            key={tab.label}
            style={styles.tabButton}
            onPress={() => {
              if (pathname !== tab.route) {
                router.push(tab.route as any);
              }
            }}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <View style={[styles.iconBox, isActive && styles.activeIconBox]}>
              <Text style={styles.icon}>{tab.icon}</Text>
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: AppColors.surface,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  activeIconBox: {
    backgroundColor: AppColors.primaryLight,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: AppColors.textMuted,
  },
  activeLabel: {
    color: AppColors.primary,
    fontWeight: "700",
  },
});
