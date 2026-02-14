import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { HomeHeader } from "../components/HomeHeader";
import { MovieRow } from "../components/MovieRow";
import { PageLoading } from "../components/PageLoading";
import { colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage, getBluphimHomepage } from "../lib/api";
import { getWatchProgressList } from "../lib/watchProgress";
import type { WatchProgress } from "../lib/watchProgress";
import { RootStackParamList } from "../navigation/types";
import { HomepageData, HomepageMovie } from "../types/homepage";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type ContinueMovie = HomepageMovie & {
  _episode: number;
  _progress?: { currentTimeSeconds: number; durationSeconds?: number };
};

type Section =
  | { type: "continue"; key: string }
  | { type: "category"; key: string; title: string; data: HomepageMovie[] };

export function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [homepageData, setHomepageData] = useState<HomepageData>([]);
  const [continueList, setContinueList] = useState<WatchProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadContinueList = useCallback(async () => {
    const list = await getWatchProgressList();
    setContinueList(list);
  }, []);

  const loadHomepage = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [data, list] = await Promise.all([
        getBluphimHomepage(),
        getWatchProgressList(),
      ]);
      setHomepageData(data ?? []);
      setContinueList(list ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Cannot load homepage"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh "Tiếp tục xem" khi quay lại màn (vd từ Watch)
  useFocusEffect(
    useCallback(() => {
      void loadContinueList();
    }, [loadContinueList])
  );

  useEffect(() => {
    void loadHomepage();
  }, [loadHomepage]);

  const handleMovieSelect = useCallback(
    (movie: HomepageMovie) => {
      navigation.navigate("Watch", {
        id: movie.url,
        episode: 1,
      });
    },
    [navigation],
  );

  const handleContinueSelect = useCallback(
    (movie: ContinueMovie) => {
      navigation.navigate("Watch", {
        id: movie.url,
        episode: movie._episode,
      });
    },
    [navigation],
  );

  // Gộp "Tiếp tục xem" vào đầu data thay vì ListHeaderComponent
  // để FlatList focus đúng vào hàng đầu (item index 0)
  const sections: Section[] =
    continueList.length > 0
      ? [
          { type: "continue", key: "__continue__" },
          ...homepageData.map((c) => ({
            type: "category" as const,
            key: c.title,
            title: c.title,
            data: c.data,
          })),
        ]
      : homepageData.map((c) => ({
          type: "category" as const,
          key: c.title,
          title: c.title,
          data: c.data,
        }));

  return (
    <View style={styles.root}>
      <HomeHeader
        user={user}
        onSignIn={() => navigation.navigate("Login")}
        onRegister={() => navigation.navigate("Register")}
        onLogout={async () => {
          await logout();
          loadHomepage();
        }}
        onRefreshRequest={loadHomepage}
      />

      {loading ? (
        <PageLoading message="Đang tải trang chủ..." />
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.key}
          renderItem={({ item, index }) =>
            item.type === "continue" ? (
              <MovieRow
                title="Tiếp tục xem"
                movies={continueList.map((i): ContinueMovie => ({
                  url: i.movieId,
                  title: i.title ?? "Phim",
                  thumbnail: i.thumbnail ?? "",
                  episode: `Tập ${i.episode}`,
                  _episode: i.episode,
                  _progress:
                    i.currentTimeSeconds > 0
                      ? {
                          currentTimeSeconds: i.currentTimeSeconds,
                          durationSeconds: i.durationSeconds,
                        }
                      : undefined,
                }))}
                onSelectMovie={handleContinueSelect as (m: HomepageMovie) => void}
                autoFocusFirstItem={index === 0}
              />
            ) : (
              <MovieRow
                title={item.title}
                movies={item.data}
                onSelectMovie={handleMovieSelect}
                autoFocusFirstItem={index === 0}
              />
            )
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={4}
          windowSize={5}
          initialNumToRender={3}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingVertical: 12,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#f87171",
    fontSize: 15,
  },
});
