import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HomeHeader } from "../components/HomeHeader";
import { MovieRow } from "../components/MovieRow";
import { PageLoading } from "../components/PageLoading";
import { colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage, getCategory } from "../lib/api";
import { RootStackParamList } from "../navigation/types";
import type { CategoryPageResult } from "../types/category";
import { HomepageMovie } from "../types/homepage";
import { FocusablePressable } from "../components/FocusablePressable";

type Props = NativeStackScreenProps<RootStackParamList, "Category">;

export function CategoryScreen({ navigation, route }: Props) {
  const { user, logout } = useAuth();
  const slug = route.params.slug;
  const page = route.params.page ?? 1;
  const [result, setResult] = useState<CategoryPageResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategory = useCallback(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    getCategory(slug, page)
      .then((data) => setResult(data))
      .catch((err) => setError(getApiErrorMessage(err, "Không tải được danh mục")))
      .finally(() => setLoading(false));
  }, [slug, page]);

  useEffect(() => {
    if (!slug) return;
    loadCategory();
  }, [slug, page, loadCategory]);

  const handleMovieSelect = useCallback(
    (movie: HomepageMovie) => {
      navigation.navigate("Watch", { id: movie.url, episode: 1 });
    },
    [navigation],
  );

  const pagination = result?.pagination;
  const buildPageParam = (p: number) => (p === 1 ? undefined : p);

  /** Returns list of page numbers and 'ellipsis' for pagination */
  const paginationItems = useMemo((): (number | "ellipsis")[] => {
    if (!pagination || pagination.totalPages <= 1) return [];
    const total = pagination.totalPages;
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    return [1, 2, 3, "ellipsis", total - 1, total];
  }, [pagination]);

  const headerProps = useMemo(
    () => ({
      user,
      onSignIn: () => navigation.navigate("Login"),
      onRegister: () => navigation.navigate("Register"),
      onLogout: () => void logout(),
      onRefreshRequest: loadCategory,
    }),
    [user, navigation, logout, loadCategory],
  );

  if (!slug) {
    return (
      <View style={styles.root}>
        <HomeHeader {...headerProps} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Invalid category</Text>
        </View>
      </View>
    );
  }

  const categoryData = result?.data ?? [];

  return (
    <View style={styles.root}>
      <HomeHeader {...headerProps} />
      {loading ? (
        <PageLoading message="Đang tải danh mục..." fullScreen={false} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {categoryData.length > 0 ? (
          categoryData.map((category, index) => (
            <MovieRow
              key={category.title}
              title={category.title}
              movies={category.data}
              onSelectMovie={handleMovieSelect}
              autoFocusFirstItem={index === 0}
              isScroll={false}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Chưa có nội dung cho danh mục này.</Text>
          </View>
        )}
        {pagination && pagination.totalPages > 1 && (
          <View style={styles.pagination}>
            {pagination.prevPage != null ? (
              <FocusablePressable
                onPress={() =>
                  navigation.push("Category", {
                    slug,
                    page: buildPageParam(pagination.prevPage!),
                  })
                }
                style={styles.pageBtn}
              >
                <Text style={styles.pageBtnText}>Trước</Text>
              </FocusablePressable>
            ) : null}
            <View style={styles.paginationNumbers}>
              {paginationItems.map((item, idx) =>
                item === "ellipsis" ? (
                  <Text key={`ellipsis-${idx}`} style={styles.pageEllipsis}>
                    ...
                  </Text>
                ) : (
                  <FocusablePressable
                    key={item}
                    onPress={() =>
                      navigation.push("Category", {
                        slug,
                        page: buildPageParam(item),
                      })
                    }
                    style={[
                      styles.pageNumBtn,
                      pagination.currentPage === item && styles.pageNumBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pageNumText,
                        pagination.currentPage === item && styles.pageNumTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </FocusablePressable>
                )
              )}
            </View>
            {pagination.nextPage != null ? (
              <FocusablePressable
                onPress={() =>
                  navigation.push("Category", {
                    slug,
                    page: buildPageParam(pagination.nextPage!),
                  })
                }
                style={styles.pageBtn}
              >
                <Text style={styles.pageBtnText}>Sau</Text>
              </FocusablePressable>
            ) : null}
          </View>
        )}
      </ScrollView>
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  errorText: {
    color: "#f87171",
    fontSize: 15,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 24,
  },
  paginationNumbers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageNumBtn: {
    minWidth: 36,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  pageNumBtnActive: {
    backgroundColor: colors.primary,
  },
  pageNumText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  pageNumTextActive: {
    color: colors.text,
  },
  pageEllipsis: {
    color: colors.textMuted,
    fontSize: 14,
    paddingHorizontal: 4,
  },
  pageBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  pageBtnText: {
    color: colors.text,
    fontWeight: "600",
  },
});
