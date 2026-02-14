import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FocusablePressable } from "../components/FocusablePressable";
import { PageLoading } from "../components/PageLoading";
import { colors, focusOutline } from "../constants/theme";
import { getApiErrorMessage, getBluphimMovieInfo } from "../lib/api";
import { getWatchProgress, saveWatchProgress } from "../lib/watchProgress";
import { RootStackParamList } from "../navigation/types";
import { MovieInfo } from "../types/video";

type Props = NativeStackScreenProps<RootStackParamList, "Watch">;

export function WatchScreen({ navigation, route }: Props) {
  const [movieInfo, setMovieInfo] = useState<MovieInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState(route.params.episode || 1);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [highlightedEpisode, setHighlightedEpisode] = useState(route.params.episode || 1);
  const episodeListRef = useRef<ScrollView | null>(null);
  const centerRef = useRef<View | null>(null);
  const leftRef = useRef<View | null>(null);
  const rightRef = useRef<View | null>(null);
  const upRef = useRef<View | null>(null);
  const downRef = useRef<View | null>(null);
  const [focusAnchor, setFocusAnchor] = useState(0);
  const [showTitle, setShowTitle] = useState(true);
  const hideTitleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedProgressRef = useRef<{ episode: number; currentTimeSeconds: number } | null>(null);
  const player = useVideoPlayer(null);
  const episodes = movieInfo?.episodes || [];

  const HIDE_TITLE_AFTER_MS = 3000;

  const showTitleAndScheduleHide = useCallback(() => {
    setShowTitle(true);
    if (hideTitleTimerRef.current) {
      clearTimeout(hideTitleTimerRef.current);
    }
    hideTitleTimerRef.current = setTimeout(() => {
      hideTitleTimerRef.current = null;
      setShowTitle(false);
    }, HIDE_TITLE_AFTER_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTitleTimerRef.current) {
        clearTimeout(hideTitleTimerRef.current);
      }
    };
  }, []);

  // Khôi phục tập + thời gian đã xem từ bộ nhớ (nếu có)
  useEffect(() => {
    const movieId = route.params.id;
    const episodeFromParams = route.params.episode;
    getWatchProgress(movieId).then((progress) => {
      if (!progress) return;
      savedProgressRef.current = progress;
      if (episodeFromParams == null) {
        setSelectedEpisode(progress.episode);
        setHighlightedEpisode(progress.episode);
      }
    });
  }, [route.params.id, route.params.episode]);

  useEffect(() => {
    async function loadMovie() {
      try {
        setLoading(true);
        setError("");
        const data = await getBluphimMovieInfo(route.params.id, selectedEpisode);
        setMovieInfo(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Cannot load movie info"));
      } finally {
        setLoading(false);
      }
    }
    void loadMovie();
  }, [route.params.id, selectedEpisode]);

  useEffect(() => {
    const sourceUrl = movieInfo?.m3u8Url;
    if (!sourceUrl) {
      return;
    }
    let cancelled = false;

    async function loadAndPlay() {
      try {
        await player.replaceAsync({
          uri: sourceUrl,
          contentType: "hls",
        });
        if (!cancelled) {
          const saved = savedProgressRef.current;
          if (saved && saved.episode === selectedEpisode && saved.currentTimeSeconds > 0) {
            try {
              player.currentTime = saved.currentTimeSeconds;
            } catch {
              // Ignore seek errors
            }
            savedProgressRef.current = null;
          }
          player.play();
        }
      } catch {
        // Keep UI simple; fetch-level errors are already surfaced above.
      }
    }

    void loadAndPlay();

    return () => {
      cancelled = true;
      // `useVideoPlayer` manages lifecycle and releases native resources itself.
      // Calling pause during cleanup can race with release in Expo Go (shared object error).
    };
  }, [movieInfo?.m3u8Url, player, selectedEpisode]);

  useEffect(() => {
    setHighlightedEpisode(selectedEpisode);
  }, [selectedEpisode]);

  // Lưu tiến độ xem: lần đầu vào page, mỗi 10 giây, và khi thoát (kèm list cho homepage)
  const movieId = route.params.id;
  useEffect(() => {
    if (!movieInfo?.m3u8Url || !movieId) return;
    const meta = {
      title: movieInfo.title,
      thumbnail: movieInfo.thumbnail,
      videoThumbnail: movieInfo.backdrop,
      durationSeconds: Number.isFinite(player.duration) ? player.duration : undefined,
    };
    // Lần đầu vào page: lưu ngay để phim xuất hiện ở "Tiếp tục xem"
    try {
      const time = player.currentTime;
      if (Number.isFinite(time)) {
        void saveWatchProgress(movieId, selectedEpisode, time, meta);
      }
    } catch {
      // Ignore
    }
    const SAVE_INTERVAL_MS = 10_000;
    const intervalId = setInterval(() => {
      try {
        const time = player.currentTime;
        const duration = Number.isFinite(player.duration) ? player.duration : undefined;
        if (Number.isFinite(time)) {
          void saveWatchProgress(movieId, selectedEpisode, time, { ...meta, durationSeconds: duration });
        }
      } catch {
        // Player có thể đã release
      }
    }, SAVE_INTERVAL_MS);
    return () => {
      clearInterval(intervalId);
      try {
        const time = player.currentTime;
        const duration = Number.isFinite(player.duration) ? player.duration : undefined;
        if (Number.isFinite(time)) {
          void saveWatchProgress(movieId, selectedEpisode, time, { ...meta, durationSeconds: duration });
        }
      } catch {
        // Ignore khi unmount
      }
    };
  }, [movieId, movieInfo?.m3u8Url, movieInfo?.title, movieInfo?.thumbnail, movieInfo?.backdrop, selectedEpisode, player]);

  useEffect(() => {
    if (!movieInfo?.m3u8Url) return;
    setShowTitle(true);
    const t = setTimeout(() => setShowTitle(false), HIDE_TITLE_AFTER_MS);
    return () => clearTimeout(t);
  }, [movieInfo?.m3u8Url]);

  const closeSelectorOrGoBack = useCallback(() => {
    if (showEpisodeSelector) {
      setShowEpisodeSelector(false);
      setFocusAnchor((v) => v + 1);
      return;
    }
    navigation.goBack();
  }, [navigation, showEpisodeSelector]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeSelectorOrGoBack();
      return true;
    });
    return () => sub.remove();
  }, [closeSelectorOrGoBack]);

  const handleEpisodeChange = useCallback((episode: number) => {
    setSelectedEpisode(episode);
    setShowEpisodeSelector(false);
    setFocusAnchor((v) => v + 1);
  }, []);

  const openEpisodeSelector = useCallback(() => {
    if (!episodes.length) {
      return;
    }
    setHighlightedEpisode(selectedEpisode);
    setShowEpisodeSelector(true);
  }, [episodes.length, selectedEpisode]);

  const seekBy = useCallback(
    (seconds: number) => {
      try {
        player.seekBy(seconds);
      } catch {
        // Ignore seek errors to keep remote control responsive.
      }
    },
    [player],
  );

  const togglePlayPause = useCallback(() => {
    try {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch {
      // Ignore player race errors.
    }
  }, [player]);

  const handleDirectionalAction = useCallback(
    (type: "left" | "right" | "up" | "down") => {
      if (showEpisodeSelector) {
        return;
      }
      // Nút lên: hiện control video + tiêu đề và tập góc trái
      showTitleAndScheduleHide();
      if (type === "left") {
        seekBy(-10);
      } else if (type === "right") {
        seekBy(10);
      } else if (type === "down") {
        openEpisodeSelector();
      }
      setFocusAnchor((v) => v + 1);
    },
    [openEpisodeSelector, seekBy, showEpisodeSelector, showTitleAndScheduleHide],
  );

  if (loading) {
    return <PageLoading message="Đang tải thông tin phim..." />;
  }

  if (error || !movieInfo) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Movie not found"}</Text>
        <FocusablePressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </FocusablePressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.playerBox}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={showTitle}
        />

        <View
          style={[styles.topControls, { opacity: showTitle ? 1 : 0 }]}
          pointerEvents={showTitle ? "box-none" : "none"}
        >
          <View style={styles.titleBox}>
            <Text style={styles.movieTitle} numberOfLines={1}>
              {movieInfo.title}
              <Text style={styles.movieTitleEpisode}> · Tập {selectedEpisode}</Text>
            </Text>
          </View>
        </View>

        {!showEpisodeSelector && (
          <View pointerEvents="box-none" style={styles.dpadLayer}>
            <Pressable
              key={`anchor-${focusAnchor}`}
              ref={centerRef}
              style={styles.dpadCenter}
              onPress={() => {
                togglePlayPause();
                showTitleAndScheduleHide();
              }}
              hasTVPreferredFocus
              focusable
            />
            <Pressable
              ref={leftRef}
              style={styles.dpadLeft}
              onFocus={() => handleDirectionalAction("left")}
              focusable
            />
            <Pressable
              ref={rightRef}
              style={styles.dpadRight}
              onFocus={() => handleDirectionalAction("right")}
              focusable
            />
            <Pressable
              ref={upRef}
              style={styles.dpadUp}
              onFocus={() => handleDirectionalAction("up")}
              focusable
            />
            <Pressable
              ref={downRef}
              style={styles.dpadDown}
              onFocus={() => handleDirectionalAction("down")}
              focusable
            />
          </View>
        )}
      </View>

      <Modal
        visible={showEpisodeSelector}
        transparent
        animationType="slide"
        onRequestClose={closeSelectorOrGoBack}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setShowEpisodeSelector(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Danh sách tập</Text>
              <FocusablePressable onPress={() => setShowEpisodeSelector(false)} style={styles.closeBtn}>
                <Text style={styles.closeText}>Đóng</Text>
              </FocusablePressable>
            </View>
            <ScrollView ref={episodeListRef} contentContainerStyle={styles.sheetContent}>
              {episodes.map((ep) => {
                const selected = ep.episode === selectedEpisode;
                const highlighted = ep.episode === highlightedEpisode;
                const w = focusOutline.width;
                return (
                  <View key={ep.episode} style={styles.episodeItemWrapper}>
                    {highlighted && (
                      <View
                        style={[
                          styles.episodeItemOutline,
                          {
                            top: -w,
                            left: -w,
                            right: -w,
                            bottom: -w,
                            borderWidth: w,
                            borderColor: focusOutline.color,
                            borderRadius: focusOutline.radius + w,
                          },
                        ]}
                        pointerEvents="none"
                      />
                    )}
                    <Pressable
                      style={[styles.episodeItem, selected && styles.episodeItemActive]}
                      onFocus={() => setHighlightedEpisode(ep.episode)}
                      onPress={() => handleEpisodeChange(ep.episode)}
                      hasTVPreferredFocus={ep.episode === highlightedEpisode}
                      focusable
                    >
                      <Text style={styles.episodeItemTitle}>Tập {ep.episode}</Text>
                      {!!ep.title && (
                        <Text style={styles.episodeItemSubtitle} numberOfLines={2}>
                          {ep.title.replace(/<[^>]*>/g, "")}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    color: "#f87171",
    fontSize: 15,
  },
  backBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backBtnText: {
    color: colors.text,
    fontWeight: "700",
  },
  playerBox: {
    flex: 1,
    backgroundColor: colors.background,
  },
  video: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topControls: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 48,
    alignItems: "flex-start",
  },
  titleBox: {
    flex: 1,
  },
  movieTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  movieTitleEpisode: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  dpadLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  dpadCenter: {
    position: "absolute",
    width: 44,
    height: 44,
    opacity: 0.02,
  },
  dpadLeft: {
    position: "absolute",
    left: "38%",
    width: 34,
    height: 34,
    opacity: 0.02,
  },
  dpadRight: {
    position: "absolute",
    right: "38%",
    width: 34,
    height: 34,
    opacity: 0.02,
  },
  dpadUp: {
    position: "absolute",
    top: "38%",
    width: 34,
    height: 34,
    opacity: 0.02,
  },
  dpadDown: {
    position: "absolute",
    bottom: "38%",
    width: 34,
    height: 34,
    opacity: 0.02,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    width: "80%",
    maxWidth: 340,
    backgroundColor: "#080808",
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingTop: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  sheetContent: {
    padding: 12,
    gap: 8,
  },
  episodeItemWrapper: {
    position: "relative",
    overflow: "visible",
  },
  episodeItemOutline: {
    position: "absolute",
  },
  episodeItem: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  episodeItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  episodeItemTitle: {
    color: colors.text,
    fontWeight: "700",
    marginBottom: 4,
  },
  episodeItemSubtitle: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    lineHeight: 16,
  },
});
