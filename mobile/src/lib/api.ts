import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { HomepageData } from "../types/homepage";
import { MovieInfo } from "../types/video";
import { User } from "../types/user";
import type { NavItem } from "../types/nav";
import type { CategoryPageResult } from "../types/category";
import type { SearchResult } from "../types/search";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() || "https://backend-one-mu-83.vercel.app";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface AuthResponse {
  user: User;
  access_token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", { email, password });
  return response.data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return response.data;
}

export async function getProfile(token: string): Promise<User> {
  const response = await api.get<User>("/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getBluphimHomepage(): Promise<HomepageData> {
  const response = await api.get<HomepageData>("/movies/homepage");
  return response.data;
}

export async function getBluphimMovieInfo(url: string, episode?: number): Promise<MovieInfo> {
  const params = new URLSearchParams({ url });
  if (episode) {
    params.append("episode", `${episode}`);
  }
  const response = await api.get<MovieInfo>(`/movies/info?${params.toString()}`);
  return response.data;
}

export async function getNav(): Promise<NavItem[]> {
  const response = await api.get<NavItem[]>("/nav");
  return response.data ?? [];
}

export async function getCategory(slug: string, page: number = 1): Promise<CategoryPageResult> {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  const url = `/movies/category/${encodeURIComponent(slug)}${q ? `?${q}` : ""}`;
  const response = await api.get<CategoryPageResult>(url);
  return response.data;
}

export async function getSearch(query: string): Promise<SearchResult[]> {
  const q = (query || "").trim();
  if (q.length < 2) return [];
  const response = await api.get<SearchResult[]>(`/movies/search?q=${encodeURIComponent(q)}`);
  return response.data ?? [];
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const serverMessage = (error.response?.data as { message?: string } | undefined)?.message;
    const status = error.response?.status;

    if (status) {
      const details = serverMessage || error.response?.statusText || error.message;
      return `${fallback} (${status}): ${details}`;
    }

    if (error.request) {
      return `${fallback}: cannot reach ${API_URL}. Check internet, API URL, and backend status.`;
    }

    if (error.message) {
      return `${fallback}: ${error.message}`;
    }
  }
  return fallback;
}
