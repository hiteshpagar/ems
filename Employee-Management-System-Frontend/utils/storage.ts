import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEYS = ["token", "role", "fullName", "userEmail"];
let inMemoryToken: string | null = null;

// Save Token
export const saveToken = async (token: string) => {
  try {
    inMemoryToken = token;
    await AsyncStorage.setItem("token", token);
  } catch (error) {
    console.log(error);
  }
};

// Get Token
export const getToken = async () => {
  try {
    return inMemoryToken ?? (await AsyncStorage.getItem("token"));
  } catch (error) {
    console.log(error);

    return null;
  }
};

// Remove Token
export const removeToken = async () => {
  try {
    inMemoryToken = null;
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.log(error);
  }
};

// A non-persistent token supports a normal session when Remember Me is off.
export const setSessionToken = (token: string | null) => {
  inMemoryToken = token;
};

export const saveRememberedSession = async (
  token: string,
  role: string,
  fullName: string,
  email: string,
) => {
  inMemoryToken = token;
  await AsyncStorage.multiSet([
    ["token", token],
    ["role", role],
    ["fullName", fullName],
    ["userEmail", email],
  ]);
};

export const getRememberedSession = async () => {
  const entries = await AsyncStorage.multiGet(SESSION_KEYS);
  const values = Object.fromEntries(entries);

  return values.token
    ? { token: values.token, role: values.role, fullName: values.fullName, email: values.userEmail }
    : null;
};

export const clearRememberedSession = async () => {
  inMemoryToken = null;
  await AsyncStorage.multiRemove(SESSION_KEYS);
};
