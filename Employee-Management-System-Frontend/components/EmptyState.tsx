import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { AppColors } from "../constants/theme";
import CustomButton from "./CustomButton";

type Props = {
  title?: string;
  message?: string;
  icon?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export default function EmptyState({
  title = "No data found",
  message = "There are no records to display at this moment.",
  icon = "📋",
  actionTitle,
  onAction,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionTitle && onAction ? (
        <CustomButton
          title={actionTitle}
          onPress={onAction}
          style={styles.actionButton}
          size="sm"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: AppColors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 16,
    minWidth: 140,
  },
});
