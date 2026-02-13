import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { User } from "../types/user";
import { colors } from "../constants/theme";
import { FocusablePressable } from "./FocusablePressable";
import { getNav, getSearch } from "../lib/api";
import type { NavItem } from "../types/nav";
import type { SearchResult } from "../types/search";
import type { RootStackParamList } from "../navigation/types";

const SEARCH_DEBOUNCE_MS = 300;

function getSlugFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/^\/|\/$/g, "");
    return path || "";
  } catch {
    return "";
  }
}

function isHomeUrl(url: string): boolean {
  return !getSlugFromUrl(url);
}

interface HomeHeaderProps {
  user: User | null;
  onSignIn: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

export function HomeHeader({ user, onSignIn, onRegister, onLogout }: HomeHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Home">>();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getNav();
        if (!cancelled) setNavItems(data ?? []);
      } catch {
        if (!cancelled) setNavItems([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    getSearch(debouncedQuery)
      .then((data) => {
        if (!cancelled) setSuggestions(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const showSuggest = query.trim().length >= 2;

  const handleNavPress = useCallback(
    (item: NavItem) => {
      if (isHomeUrl(item.url)) {
        navigation.navigate("Home");
        return;
      }
      const slug = getSlugFromUrl(item.url);
      if (slug) navigation.navigate("Category", { slug });
    },
    [navigation],
  );

  const handleChildPress = useCallback(
    (child: NavItem) => {
      setOpenDropdownKey(null);
      const slug = getSlugFromUrl(child.url);
      if (slug) navigation.navigate("Category", { slug });
    },
    [navigation],
  );

  const handleSuggestionPress = useCallback(
    (item: SearchResult) => {
      setQuery("");
      navigation.navigate("Watch", { id: item.url });
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <View style={styles.rowTop}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              placeholder="Tìm kiếm"
              placeholderTextColor={colors.textSubtle}
              autoFocus
            />
          </View>
          {showSuggest && (
            <View style={styles.suggestBox}>
              {searchLoading ? (
                <Text style={styles.suggestPlaceholder}>Đang tìm...</Text>
              ) : suggestions.length > 0 ? (
                <ScrollView
                  style={styles.suggestList}
                  keyboardShouldPersistTaps="handled"
                >
                  {suggestions.map((item) => (
                    <Pressable
                      key={item.url}
                      style={styles.suggestItem}
                      onPress={() => handleSuggestionPress(item)}
                    >
                      <Text style={styles.suggestTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.suggestPlaceholder}>Không tìm thấy</Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.rightActions}>

          {user ? (
            <FocusablePressable onPress={onLogout} style={styles.focusableLink}>
              <Text style={styles.link}>Đăng xuất</Text>
            </FocusablePressable>
          ) : (
            <>
              <FocusablePressable onPress={onRegister} style={styles.focusableLink}>
                <Text style={styles.link}>Đăng ký</Text>
              </FocusablePressable>
              <FocusablePressable onPress={onSignIn} style={styles.focusableButton}>
                <Text style={styles.signInButton}>Đăng nhập</Text>
              </FocusablePressable>
            </>
          )}
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.menuRow}
      >
        {navItems.map((item) => {
          if (item.children?.length) {
            const isOpen = openDropdownKey === item.title;
            return (
              <View key={item.title} style={styles.menuItem}>
                <FocusablePressable
                  onPress={() => setOpenDropdownKey(isOpen ? null : item.title)}
                  style={styles.menuLink}
                >
                  <Text style={styles.menuText}>{item.title}</Text>
                  <Text style={styles.menuCaret}> ▼</Text>
                </FocusablePressable>
                <Modal
                  visible={isOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setOpenDropdownKey(null)}
                >
                  <Pressable
                    style={styles.dropdownBackdrop}
                    onPress={() => setOpenDropdownKey(null)}
                  />
                  <View style={styles.dropdownBox}>
                    <Text style={styles.dropdownTitle}>{item.title}</Text>
                    <ScrollView style={styles.dropdownList}>
                      {item.children.map((child) => {
                        const slug = getSlugFromUrl(child.url);
                        if (!slug) return null;
                        return (
                          <FocusablePressable
                            key={child.url}
                            onPress={() => handleChildPress(child)}
                            style={styles.dropdownItem}
                          >
                            <Text style={styles.dropdownItemText}>{child.title}</Text>
                          </FocusablePressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                </Modal>
              </View>
            );
          }
          return (
            <FocusablePressable
              key={item.title}
              onPress={() => handleNavPress(item)}
              style={styles.menuLink}
            >
              <Text style={styles.menuText}>{item.title}</Text>
            </FocusablePressable>
          );
        })}
      </ScrollView>
      {/* <Text style={styles.userText}>{user?.name || user?.email || "Khách"}</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 64,
    height: 64,
  },
  logoText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "700",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  focusableLink: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginHorizontal: -4,
    borderRadius: 8,
  },
  focusableButton: {
    borderRadius: 8,
  },
  searchWrap: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    minWidth: 340,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    paddingVertical: 0,
    minWidth: 120,
  },
  suggestBox: {
    position: "absolute",
    left: 0,
    top: 40,
    width: 220,
    maxHeight: 240,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    zIndex: 100,
  },
  suggestList: {
    maxHeight: 200,
  },
  suggestItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  suggestTitle: {
    color: colors.text,
    fontSize: 14,
  },
  suggestPlaceholder: {
    color: colors.textMuted,
    fontSize: 13,
    padding: 12,
  },
  link: {
    color: colors.text,
    fontWeight: "500",
  },
  signInButton: {
    color: colors.text,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    fontWeight: "700",
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 16,
    paddingVertical: 4,
  },
  menuItem: {
    marginRight: 4,
  },
  menuLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  menuCaret: {
    color: colors.textSubtle,
    fontSize: 10,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dropdownBox: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "30%",
    maxHeight: "50%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dropdownTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  dropdownList: {
    maxHeight: 280,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownItemText: {
    color: colors.text,
    fontSize: 15,
  },
  userText: {
    color: colors.textSubtle,
    fontSize: 12,
  },
});
