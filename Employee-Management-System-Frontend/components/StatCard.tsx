import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { AppColors, AppRadius, AppShadows } from "../constants/theme";

type Props = {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function StatCard({
  label,
  value,
  subtext,
  icon,
  iconBgColor = AppColors.primaryLight,
  onPress,
  style,
}: Props) {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...AppShadows.subtle,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: AppRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.text,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
    marginTop: 4,
  },
  subtext: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.primary,
  },
});
