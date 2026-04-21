import axios from "axios";
import { getPlayerToken } from "@/lib/game-api";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getPlayerToken();

  if (token) {
    config.headers["X-Player-Token"] = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      (error.response?.data as { error?: string })?.error ??
      error.message ??
      "Request failed";
    return Promise.reject(new Error(message));
  },
);

export { api };
