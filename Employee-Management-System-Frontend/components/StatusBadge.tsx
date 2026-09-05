import { StyleSheet, Text, View, ViewStyle, TextStyle } from "react-native";
import { AppColors, AppRadius } from "../constants/theme";

export type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "present"
  | "absent"
  | "half_day"
  | "paid"
  | "unpaid"
  | "info"
  | "neutral"
  | string;

type Props = {
  status?: StatusType | null;
  label?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: "sm" | "md";
  showDot?: boolean;
};

export default function StatusBadge({
  status = "neutral",
  label,
  style,
  textStyle,
  size = "md",
  showDot = false,
}: Props) {
  const normalized = (status || "").toLowerCase().trim();
  const displayLabel = label ?? (status || "Unknown");

  const getColors = () => {
    switch (normalized) {
      case "active":
      case "approved":
      case "approve":
      case "create":
      case "present":
      case "paid":
      case "completed":
      case "success":
        return {
          bg: AppColors.successLight,
          text: AppColors.success,
          dot: AppColors.success,
        };

      case "update":
      case "profile":
      case "payroll":
        return {
          bg: AppColors.infoLight,
          text: AppColors.info,
          dot: AppColors.info,
        };

      case "login":
      case "employee":
      case "auth":
        return {
          bg: AppColors.indigoLight,
          text: AppColors.indigo,
          dot: AppColors.indigo,
        };

      case "department":
      case "designation":
        return {
          bg: AppColors.purpleLight,
          text: AppColors.purple,
          dot: AppColors.purple,
        };

      case "pending":
      case "warning":
      case "in progress":
      case "half day":
      case "half_day":
      case "password_reset":
        return {
          bg: AppColors.warningLight,
          text: AppColors.warning,
          dot: AppColors.warning,
        };

      case "inactive":
      case "rejected":
      case "reject":
      case "delete":
      case "absent":
      case "unpaid":
      case "danger":
      case "error":
      case "failed":
        return {
          bg: AppColors.dangerLight,
          text: AppColors.danger,
          dot: AppColors.danger,
        };

      case "info":
      case "holiday":
      case "public":
      case "optional":
      case "leave":
      case "attendance":
        return {
          bg: AppColors.infoLight,
          text: AppColors.info,
          dot: AppColors.info,
        };

      case "logout":
      default:
        return {
          bg: AppColors.surfaceMuted,
          text: AppColors.textSecondary,
          dot: AppColors.textMuted,
        };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg },
        size === "sm" && styles.badgeSm,
        style,
      ]}
    >
      {showDot ? (
        <View style={[styles.dot, { backgroundColor: colors.dot }]} />
      ) : null}
      <Text
        style={[
          styles.text,
          { color: colors.text },
          size === "sm" && styles.textSm,
          textStyle,
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppRadius.pill,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  textSm: {
    fontSize: 11,
  },
});
