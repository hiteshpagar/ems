import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { AppColors, AppRadius } from "../constants/theme";

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
};

export default function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  style,
}: Props) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightAction ? (
        <View style={styles.rightContainer}>{rightAction}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: AppColors.background,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backIcon: {
    fontSize: 18,
    color: AppColors.text,
    fontWeight: "700",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  rightContainer: {
    marginLeft: 12,
  },
});
