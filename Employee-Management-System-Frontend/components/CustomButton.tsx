import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { AppColors } from "../constants/theme";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
};

export default function CustomButton({ title, onPress, disabled = false, variant = "primary", style }: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.buttonText, variant === "secondary" && styles.secondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: AppColors.primary,
    minHeight: 46,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  secondary: { backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.borderStrong },
  danger: { backgroundColor: AppColors.danger },
  secondaryText: { color: AppColors.text },
  disabled: { backgroundColor: AppColors.borderStrong, opacity: 0.7 },
});
