import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getWatchProgressListApi,
  getWatchProgressApi,
  saveWatchProgressApi,
} from "./api";

const STORAGE_KEY_PREFIX = "watchProgress_";
const LIST_STORAGE_KEY = "watchProgressList";
const MAX_LIST_SIZE = 30;

export type WatchProgress = {
  movieId: string;
  episode: number;
  currentTimeSeconds: number;
  updatedAt: number;
  title?: string;
  thumbnail?: string;
  /** Tổng thời gian tập (giây), dùng để vẽ progress bar */
  durationSeconds?: number;
};

export async function saveWatchProgress(
  movieId: string,
  episode: number,
  currentTimeSeconds: number,
  meta?: { title?: string; thumbnail?: string; durationSeconds?: number }
): Promise<void> {
  const token =
    (await AsyncStorage.getItem("token")) || (await AsyncStorage.getItem("sessionToken"));
  if (token) {
    try {
      await saveWatchProgressApi(movieId, episode, currentTimeSeconds, meta);
      return;
    } catch {
      // Fallback to local on API error
    }
  }
  const payload: WatchProgress = {
    movieId,
    episode,
    currentTimeSeconds: Math.max(0, Math.floor(currentTimeSeconds)),
    updatedAt: Date.now(),
    title: meta?.title,
    thumbnail: meta?.thumbnail,
    durationSeconds: meta?.durationSeconds != null ? Math.max(0, Math.floor(meta.durationSeconds)) : undefined,
  };
  await AsyncStorage.setItem(
    `${STORAGE_KEY_PREFIX}${movieId}`,
    JSON.stringify(payload)
  );

  // Cập nhật list "đang xem": thêm/cập nhật phim lên đầu, giữ tối đa MAX_LIST_SIZE
  const rawList = await AsyncStorage.getItem(LIST_STORAGE_KEY);
  let list: WatchProgress[] = [];
  if (rawList) {
    try {
      list = JSON.parse(rawList);
    } catch {
      list = [];
    }
  }
  list = list.filter((item) => item.movieId !== movieId);
  list.unshift(payload);
  list = list.slice(0, MAX_LIST_SIZE);
  await AsyncStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(list));
}

export async function getWatchProgress(
  movieId: string
): Promise<{ episode: number; currentTimeSeconds: number } | null> {
  const token =
    (await AsyncStorage.getItem("token")) || (await AsyncStorage.getItem("sessionToken"));
  if (token) {
    try {
      const data = await getWatchProgressApi(movieId);
      if (data) return data;
    } catch {
      // Fallback to local
    }
  }
  const raw = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${movieId}`);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as WatchProgress;
    if (data.episode == null || typeof data.currentTimeSeconds !== "number")
      return null;
    return {
      episode: data.episode,
      currentTimeSeconds: Math.max(0, data.currentTimeSeconds),
    };
  } catch {
    return null;
  }
}

/** Danh sách phim đã xem (dùng cho hàng "Tiếp tục xem" ở homepage), mới nhất trước. Khi đã đăng nhập thì lấy từ API. */
export async function getWatchProgressList(): Promise<WatchProgress[]> {
  const token =
    (await AsyncStorage.getItem("token")) || (await AsyncStorage.getItem("sessionToken"));
  if (token) {
    try {
      const list = await getWatchProgressListApi();
      return Array.isArray(list)
        ? list.filter(
            (item) =>
              item.movieId &&
              typeof item.episode === "number" &&
              Number.isFinite(item.currentTimeSeconds)
          )
        : [];
    } catch {
      // Fallback to local cache
    }
  }
  const raw = await AsyncStorage.getItem(LIST_STORAGE_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as WatchProgress[];
    return Array.isArray(list)
      ? list.filter(
          (item) =>
            item.movieId &&
            typeof item.episode === "number" &&
            Number.isFinite(item.currentTimeSeconds)
        )
      : [];
  } catch {
    return [];
  }
}
