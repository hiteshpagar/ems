import { ReactNode } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

type Props = {
  children: ReactNode;
};

export default function ScreenWrapper({ children }: Props) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
});
