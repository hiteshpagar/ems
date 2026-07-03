import axios from "axios";
import { router } from "expo-router";
import { removeToken } from "../utils/storage";

import { getToken } from "../utils/storage";

const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Add JWT Token Automatically
API.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

API.interceptors.response.use(
  (response) => response,

  async (error) => {
   if (error.response?.status === 401) {
  await removeToken();

  router.replace("/login");
}

    return Promise.reject(error);
  },
);

export default API;
