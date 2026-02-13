import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Image,
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

/** Bàn phím ảo: 6 ký tự mỗi hàng (a-z, 0-9) + Space + Xóa */
const KEY_ROWS: string[][] = [
  ["a", "b", "c", "d", "e", "f"],
  ["g", "h", "i", "j", "k", "l"],
  ["m", "n", "o", "p", "q", "r"],
  ["s", "t", "u", "v", "w", "x"],
  ["y", "z", "0", "1", "2", "3"],
  ["4", "5", "6", "7", "8", "9"],
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
    if (char === KEY_SPECIAL.backspace) {
      setQuery((q) => q.slice(0, -1));
    } else {
      setQuery((q) => q + char);
    }
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
        {/* Ngăn trái: input + bàn phím ký tự */}
        <View style={styles.leftPanel}>
          <View style={styles.searchBox}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              placeholder="Tìm kiếm..."
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
                    key={char}
                    style={styles.keyButton}
                    onPress={() => handleKeyPress(char)}
                  >
                    <Text style={styles.keyLabel}>{char}</Text>
                  </FocusablePressable>
                ))}
              </View>
            ))}
            <View style={styles.keyRowWide}>
              <View style={styles.keyButtonWideWrap}>
                <FocusablePressable
                  style={[styles.keyButton, styles.keyButtonWideFill]}
                  onPress={() => handleKeyPress(KEY_SPECIAL.space)}
                >
                  <Text style={styles.keyLabelWide}>Space</Text>
                </FocusablePressable>
              </View>
              <View style={styles.keyButtonWideWrap}>
                <FocusablePressable
                  style={[styles.keyButton, styles.keyButtonWideFill]}
                  onPress={() => handleKeyPress(KEY_SPECIAL.backspace)}
                >
                  <Text style={styles.keyLabelWide}>Xóa</Text>
                </FocusablePressable>
              </View>
            </View>
          </View>
        </View>

        {/* Ngăn phải: danh sách kết quả (ảnh + title) */}
        <View style={styles.rightPanel}>
          {loading ? (
            <View style={styles.centerContent}>
              <Text style={styles.placeholderText}>Đang tìm...</Text>
            </View>
          ) : debouncedQuery.length < 2 ? (
            <View style={styles.centerContent}>
              <Text style={styles.placeholderText}>
                Gõ ít nhất 2 ký tự để tìm kiếm
              </Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.placeholderText}>Không tìm thấy</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.resultList}
              contentContainerStyle={styles.resultListContent}
              keyboardShouldPersistTaps="handled"
            >
              <MovieRow
                title="Kết quả tìm kiếm"
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

const KEY_SIZE = 36;
const KEY_SIZE_WIDE = 52;
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
    borderRightColor: colors.border,
    padding: 16,
    paddingTop: 24,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
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
  keyButton: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  keyRowWide: {
    flexDirection: "row",
    gap: KEY_GAP,
  },
  keyButtonWideWrap: {
  },
  keyButtonWideFill: {
    width: 100,
  },
  keyLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  keyLabelWide: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 22,
  },
  rightPanel: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
  },
  rightHeader: {
    marginBottom: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backLabel: {
    color: colors.text,
    fontSize: 15,
  },
  resultList: {
    flex: 1,
  },
  resultListContent: {
    paddingBottom: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
