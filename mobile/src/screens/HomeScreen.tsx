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

type ContinueMovie = HomepageMovie & { _episode: number };

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

  useFocusEffect(
    useCallback(() => {
      void loadContinueList();
    }, [loadContinueList])
  );

  useEffect(() => {
    async function loadHomepage() {
      try {
        setLoading(true);
        const data = await getBluphimHomepage();
        setHomepageData(data ?? []);
      } catch (err) {
        setError(getApiErrorMessage(err, "Cannot load homepage"));
      } finally {
        setLoading(false);
      }
    }
    void loadHomepage();
  }, []);

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

  return (
    <View style={styles.root}>
      <HomeHeader
        user={user}
        onSignIn={() => navigation.navigate("Login")}
        onRegister={() => navigation.navigate("Register")}
        onLogout={() => void logout()}
      />

      {loading ? (
        <PageLoading message="Đang tải trang chủ..." />
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={homepageData}
          keyExtractor={(item) => item.title}
          ListHeaderComponent={
            continueList.length > 0 ? (
              <MovieRow
                title="Tiếp tục xem"
                movies={continueList.map((item): ContinueMovie => ({
                  url: item.movieId,
                  title: item.title ?? "Phim",
                  thumbnail: item.thumbnail ?? "",
                  episode: `Tập ${item.episode}`,
                  _episode: item.episode,
                }))}
                onSelectMovie={handleContinueSelect as (m: HomepageMovie) => void}
                autoFocusFirstItem={true}
              />
            ) : null
          }
          renderItem={({ item, index }) => (
            <MovieRow
              title={item.title}
              movies={item.data}
              onSelectMovie={handleMovieSelect}
              autoFocusFirstItem={index === 0}
            />
          )}
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
