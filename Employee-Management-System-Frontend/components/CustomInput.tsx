import { StyleSheet, TextInput, TextInputProps } from "react-native";

export default function CustomInput(props: TextInputProps) {
  return (
    <TextInput {...props} style={styles.input} placeholderTextColor="#888" />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
});
