import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from "react-native";
import { AppColors } from "../constants/theme";

type Props = {
  message?: string;
  style?: ViewStyle;
};

export default function LoadingState({
  message = "Loading...",
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={AppColors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.textSecondary,
  },
});
