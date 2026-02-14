import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HomepageMovie } from "../types/homepage";
import { colors, focusOutlineCardStyle } from "../constants/theme";
import { normalizeImageUrl, parseViewCount } from "../utils/movie";

const CARD_WIDTH = 168;

interface MovieCardProps {
  movie: HomepageMovie;
  cardKey: string;
  index: number;
  focused: boolean;
  onPress: (movie: HomepageMovie) => void;
  onFocus: (key: string, index: number) => void;
  onBlur: (key: string) => void;
  hasTVPreferredFocus: boolean;
}

const MovieCard = React.memo(function MovieCard({
  movie,
  cardKey,
  index,
  focused,
  onPress,
  onFocus,
  onBlur,
  hasTVPreferredFocus,
}: MovieCardProps) {
  const views = parseViewCount(movie.viewCount);
  const progress = (movie as { _progress?: { currentTimeSeconds: number; durationSeconds?: number } })._progress;
  const progressPercent =
    progress && progress.currentTimeSeconds > 0 && progress.durationSeconds != null && progress.durationSeconds > 0
      ? Math.min(100, (progress.currentTimeSeconds / progress.durationSeconds) * 100)
      : progress && progress.currentTimeSeconds > 0
        ? 0
        : null;

  return (
    <View style={styles.cardWrapper}>
      {focused && (
        <View style={[styles.cardOutline, focusOutlineCardStyle]} pointerEvents="none" />
      )}
      <Pressable
        style={[styles.card, focused && styles.cardFocused]}
        onPress={() => onPress(movie)}
        onFocus={() => onFocus(cardKey, index)}
        onBlur={() => onBlur(cardKey)}
        hasTVPreferredFocus={hasTVPreferredFocus}
        focusable
      >
        <Image
          source={{ uri: normalizeImageUrl(movie.thumbnail) }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <View style={styles.overlayTop}>
          {movie.quality ? (
            <Text style={styles.qualityBadge}>{movie.quality}</Text>
          ) : null}
        </View>
        <View style={styles.overlayBottom}>
          {views > 0 ? <Text style={styles.viewsBadge}>{views} views</Text> : null}
          {movie.episode ? <Text style={styles.episodeBadge}>{movie.episode}</Text> : null}
        </View>
        {progressPercent != null && (
          <View style={styles.progressTrack} pointerEvents="none">
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        )}
        <Text style={styles.movieTitle} numberOfLines={1}>
          {movie.title}
        </Text>
      </Pressable>
    </View>
  );
});

interface MovieRowProps {
  title: string;
  movies: HomepageMovie[];
  onSelectMovie: (movie: HomepageMovie) => void;
  autoFocusFirstItem?: boolean;
  isScroll?: boolean;
}

export const MovieRow = React.memo(function MovieRow({
  title,
  movies,
  onSelectMovie,
  autoFocusFirstItem = false,
  isScroll = true,
}: MovieRowProps) {
  const rowRef = useRef<ScrollView | null>(null);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  const handleCardFocus = useCallback(
    (key: string, index: number) => {
      setFocusedKey(key);
      if (isScroll) {
        const targetX = Math.max(0, index * CARD_WIDTH - CARD_WIDTH);
        rowRef.current?.scrollTo({ x: targetX, animated: true });
      }
    },
    [isScroll],
  );

  const handleCardBlur = useCallback((key: string) => {
    setFocusedKey((prev) => (prev === key ? null : prev));
  }, []);

  if (!movies.length) {
    return null;
  }

  const cardContent = movies.map((movie, index) => {
    const cardKey = `${movie.url}-${movie.title}`;
    return (
      <MovieCard
        key={cardKey}
        movie={movie}
        cardKey={cardKey}
        index={index}
        focused={focusedKey === cardKey}
        onPress={onSelectMovie}
        onFocus={handleCardFocus}
        onBlur={handleCardBlur}
        hasTVPreferredFocus={autoFocusFirstItem && index === 0}
      />
    );
  });

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {isScroll ? (
        <ScrollView
          ref={rowRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
        >
          {cardContent}
        </ScrollView>
      ) : (
        <View style={[styles.rowContent, styles.wrapRow]}>
          {cardContent}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    marginBottom: 18,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  rowContent: {
    paddingHorizontal: 12,
    gap: 8,
    marginVertical: 2,
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardWrapper: {
    position: "relative",
    width: 160,
    overflow: "visible",
  },
  cardOutline: {
    position: "absolute",
  },
  card: {
    width: 160,
    borderRadius: 12,
    padding: 2,
  },
  cardFocused: {
    transform: [{ scale: 1.03 }],
  },
  image: {
    marginTop: 4,
    margin: 2,
    width: "97%",
    height: 220,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  overlayTop: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  overlayBottom: {
    position: "absolute",
    bottom: 40,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qualityBadge: {
    backgroundColor: colors.primary,
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  viewsBadge: {
    backgroundColor: colors.overlay,
    color: colors.text,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  episodeBadge: {
    backgroundColor: "#16a34a",
    color: colors.text,
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressTrack: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 27,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  movieTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    margin: 6,
  },
});
