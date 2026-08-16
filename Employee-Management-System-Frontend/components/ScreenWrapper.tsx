import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "../constants/theme";

type Props = {
  children: ReactNode;
};

export default function ScreenWrapper({ children }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardArea}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  keyboardArea: {
    flex: 1,
  },
});
