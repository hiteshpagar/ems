import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "../constants/theme";

type Props = {
  children: ReactNode;
  backgroundColor?: string;
  statusBarStyle?: "light-content" | "dark-content";
  statusBarColor?: string;
  edges?: ("top" | "right" | "bottom" | "left")[];
};

export default function ScreenWrapper({
  children,
  backgroundColor = AppColors.background,
  statusBarStyle = "dark-content",
  statusBarColor = AppColors.background,
  edges = ["top", "left", "right"],
}: Props) {
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={edges}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent={false}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardArea}
      >
        <View style={[styles.content, { backgroundColor }]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
