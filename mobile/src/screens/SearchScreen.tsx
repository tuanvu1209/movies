import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../constants/theme";
import { FocusablePressable } from "../components/FocusablePressable";
import { MovieRow } from "../components/MovieRow";
import { getSearch } from "../lib/api";
import { RootStackParamList } from "../navigation/types";
import type { SearchResult } from "../types/search";
import type { HomepageMovie } from "../types/homepage";

const SEARCH_DEBOUNCE_MS = 400;

/** Bàn phím ảo: chữ a-z, số 0-9, space, backspace */
const KEY_ROWS: string[][] = [
  ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  [" ", "⌫", 'Xoá'],
];

const KEY_SPECIAL = { space: " ", backspace: "⌫" } as const;

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery("");
      return;
    }
    const t = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getSearch(debouncedQuery)
      .then((data) => {
        if (!cancelled) setResults(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [goBack]);

  const handleKeyPress = useCallback((char: string) => {
    if (char === 'Xoá') {
      setQuery("");
      return;
    }
    if (char === KEY_SPECIAL.backspace) {
      setQuery((q) => (q.length > 0 ? q.slice(0, -1) : ""));
    } else {
      setQuery((q) => q + char);
    }
  }, []);

  const handleClearAll = useCallback(() => {
    setQuery("");
  }, []);

  const handleResultPress = useCallback(
    (movie: HomepageMovie) => {
      navigation.navigate("Watch", { id: movie.url });
    },
    [navigation],
  );

  return (
    <View style={styles.root}>
      <View style={styles.main}>
        {/* Left: header + search box + virtual keyboard */}
        <View style={styles.leftPanel}>
          <Text style={styles.screenTitle}>Tìm kiếm</Text>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              placeholder="Phim, thể loại..."
              placeholderTextColor={colors.textSubtle}
              autoFocus
              showSoftInputOnFocus={false}
            />
          </View>
          <View style={styles.keyboard}>
            {KEY_ROWS.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.keyRow}>
                {row.map((char) => (
                  <FocusablePressable
                    key={`${rowIndex}-${char}`}
                    style={[
                      styles.keyButton,
                      char === " " && styles.keyButtonSpace,
                      char === KEY_SPECIAL.backspace && styles.keyButtonBackspace,
                    ]}
                    onPress={() => handleKeyPress(char)}
                  >
                    <Text
                      style={[
                        styles.keyLabel,
                        char === KEY_SPECIAL.backspace && styles.keyLabelBackspace,
                      ]}
                    >
                      {char === " " ? "Space" : char}
                    </Text>
                  </FocusablePressable>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Right: search results */}
        <View style={styles.rightPanel}>
          <View style={styles.resultHeader}>
            <View style={styles.resultHeaderAccent} />
            <Text style={styles.resultHeaderTitle}>Kết quả</Text>
          </View>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.placeholderText}>Đang tìm kiếm...</Text>
            </View>
          ) : debouncedQuery.length < 2 ? (
            <View style={styles.centerContent}>
              <Text style={styles.placeholderIcon}>⌕</Text>
              <Text style={styles.placeholderText}>
                Gõ ít nhất 2 ký tự để tìm
              </Text>
              <Text style={styles.placeholderHint}>Ví dụ: hành động, kinh dị</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.placeholderIcon}>∅</Text>
              <Text style={styles.placeholderText}>Không có kết quả</Text>
              <Text style={styles.placeholderHint}>Thử từ khóa khác</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.resultList}
              contentContainerStyle={styles.resultListContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <MovieRow
                title=""
                movies={results as HomepageMovie[]}
                onSelectMovie={handleResultPress}
                isScroll={false}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const KEY_SIZE = 40;
const KEY_GAP = 6;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  main: {
    flex: 1,
    flexDirection: "row",
  },
  leftPanel: {
    width: 380,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    backgroundColor: "#0a0a0a",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchIcon: {
    fontSize: 20,
    color: colors.textSubtle,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    paddingVertical: 0,
  },
  keyboard: {
    gap: KEY_GAP,
  },
  keyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: KEY_GAP,
  },
  keyRowWide: {
    flexDirection: "row",
    marginTop: 4,
  },
  keyButton: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    backgroundColor: colors.surface,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  keyButtonSpace: {
    minWidth: 80,
    flex: 1,
  },
  keyButtonBackspace: {
    minWidth: 56,
  },
  keyLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  keyLabelBackspace: {
    fontSize: 22,
  },
  clearButton: {
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  clearButtonLabel: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  rightPanel: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  resultHeaderAccent: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  resultHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.3,
  },
  resultList: {
    flex: 1,
  },
  resultListContent: {
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  placeholderIcon: {
    fontSize: 48,
    color: colors.textSubtle,
    marginBottom: 12,
    opacity: 0.6,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  placeholderHint: {
    color: colors.textSubtle,
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
});
