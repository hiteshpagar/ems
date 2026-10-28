import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Building2,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  User,
  Users,
} from "lucide-react-native";
import { AppColors } from "../constants/theme";

type Props = {
  role?: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE" | string | null;
};

export default function BottomNav({ role = "EMPLOYEE" }: Props) {
  const pathname = usePathname();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN";

  const superAdminTabs = [
    {
      label: "Console",
      icon: Home,
      route: "/super-admin-dashboard",
    },
    {
      label: "Companies",
      icon: Building2,
      route: "/manage-companies",
    },
    {
      label: "Admins",
      icon: Users,
      route: "/manage-admins",
    },
    {
      label: "Audit",
      icon: FileText,
      route: "/audit-logs",
    },
    {
      label: "Profile",
      icon: User,
      route: "/profile",
    },
  ];

  const adminTabs = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      route: "/dashboard",
    },
    {
      label: "Employees",
      icon: Users,
      route: "/employee-list",
    },
    {
      label: "Attendance",
      icon: Clock,
      route: "/attendance",
    },
    {
      label: "Leave",
      icon: Calendar,
      route: "/leave-list",
    },
    {
      label: "Profile",
      icon: User,
      route: "/profile",
    },
  ];

  const employeeTabs = [
    {
      label: "Home",
      icon: Home,
      route: "/dashboard",
    },
    {
      label: "Attendance",
      icon: Clock,
      route: "/attendance",
    },
    {
      label: "Leave",
      icon: Calendar,
      route: "/leave-list",
    },
    {
      label: "Payslips",
      icon: CreditCard,
      route: "/payslips",
    },
    {
      label: "Profile",
      icon: User,
      route: "/profile",
    },
  ];

  const tabs = isSuperAdmin ? superAdminTabs : isAdmin ? adminTabs : employeeTabs;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.route ||
          (tab.route === "/super-admin-dashboard" &&
            (pathname === "/" || pathname === "/super-admin-dashboard")) ||
          (tab.route === "/dashboard" &&
            !isSuperAdmin &&
            (pathname === "/" || pathname === "/dashboard"));

        const IconComponent = tab.icon;

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
            <IconComponent
              size={22}
              color={isActive ? AppColors.accent : AppColors.textMuted}
              strokeWidth={isActive ? 2.4 : 2}
            />
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
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 8,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 2,
    minHeight: 44,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: AppColors.textMuted,
    marginTop: 3,
  },
  activeLabel: {
    color: AppColors.accent,
    fontWeight: "700",
  },
});
