import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { AppColors, AppRadius } from "../constants/theme";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "outline"
  | "ghost";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export default function CustomButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  style,
  textStyle,
  icon,
  rightIcon,
  size = "md",
}: Props) {
  const isInteractive = !disabled && !loading;

  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "secondary":
        return {
          button: styles.btnSecondary,
          text: styles.btnSecondaryText,
        };
      case "danger":
        return {
          button: styles.btnDanger,
          text: styles.btnDangerText,
        };
      case "success":
        return {
          button: styles.btnSuccess,
          text: styles.btnSuccessText,
        };
      case "outline":
        return {
          button: styles.btnOutline,
          text: styles.btnOutlineText,
        };
      case "ghost":
        return {
          button: styles.btnGhost,
          text: styles.btnGhostText,
        };
      case "primary":
      default:
        return {
          button: styles.btnPrimary,
          text: styles.btnPrimaryText,
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case "sm":
        return {
          button: { minHeight: 38, paddingHorizontal: 12 },
          text: { fontSize: 13 },
        };
      case "lg":
        return {
          button: { minHeight: 52, paddingHorizontal: 20 },
          text: { fontSize: 16 },
        };
      case "md":
      default:
        return {
          button: { minHeight: 46, paddingHorizontal: 16 },
          text: { fontSize: 15 },
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        variantStyle.button,
        sizeStyle.button,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !isInteractive }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "secondary" || variant === "outline" || variant === "ghost"
              ? AppColors.primary
              : "#FFFFFF"
          }
        />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconLeft}>{icon}</View> : null}
          <Text
            style={[
              styles.baseText,
              variantStyle.text,
              sizeStyle.text,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: AppRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  baseText: {
    fontWeight: "600",
    textAlign: "center",
  },
  btnPrimary: {
    backgroundColor: AppColors.primary,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
  },
  btnSecondary: {
    backgroundColor: AppColors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  btnSecondaryText: {
    color: AppColors.text,
  },
  btnDanger: {
    backgroundColor: AppColors.danger,
  },
  btnDangerText: {
    color: "#FFFFFF",
  },
  btnSuccess: {
    backgroundColor: AppColors.success,
  },
  btnSuccessText: {
    color: "#FFFFFF",
  },
  btnOutline: {
    backgroundColor: AppColors.surface,
    borderWidth: 1.5,
    borderColor: AppColors.primary,
  },
  btnOutlineText: {
    color: AppColors.primary,
  },
  btnGhost: {
    backgroundColor: "transparent",
  },
  btnGhostText: {
    color: AppColors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});
