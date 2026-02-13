import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { User } from "../types/user";
import { colors } from "../constants/theme";
import { FocusablePressable } from "./FocusablePressable";
import { getNav } from "../lib/api";
import type { NavItem } from "../types/nav";
import type { RootStackParamList } from "../navigation/types";

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
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const menuItemRefs = useRef<Record<string, View | null>>({});

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
      setDropdownLayout(null);
      const slug = getSlugFromUrl(child.url);
      if (slug) navigation.navigate("Category", { slug });
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <View style={styles.rowTop}>
        <View style={styles.leftActions}/>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.rightActions}>
          <FocusablePressable
            style={styles.searchWrap}
            onPress={() => navigation.navigate("Search")}
          >
            <View style={styles.searchBox}>
              <Text style={styles.searchPlaceholder}>Tìm kiếm</Text>
            </View>
          </FocusablePressable>

          {user ? (
            <FocusablePressable onPress={onLogout} style={styles.focusableLink}>
              <Text style={styles.link}>Đăng xuất</Text>
            </FocusablePressable>
          ) : (
            <>
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
            const openDropdown = () => {
              if (isOpen) {
                setOpenDropdownKey(null);
                setDropdownLayout(null);
                return;
              }
              const ref = menuItemRefs.current[item.title];
              if (ref && typeof ref.measureInWindow === "function") {
                ref.measureInWindow((x, y, width, height) => {
                  setDropdownLayout({ x, y: y + height, width });
                  setOpenDropdownKey(item.title);
                });
              } else {
                setOpenDropdownKey(item.title);
                setDropdownLayout({ x: 16, y: 120, width: 200 });
              }
            };
            return (
              <View
                key={item.title}
                ref={(r) => { menuItemRefs.current[item.title] = r; }}
                collapsable={false}
                style={styles.menuItem}
              >
                <FocusablePressable
                  onPress={openDropdown}
                  style={styles.menuLink}
                >
                  <Text style={styles.menuText}>{item.title}</Text>
                  <Text style={styles.menuCaret}> ▼</Text>
                </FocusablePressable>
                <Modal
                  visible={isOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => {
                    setOpenDropdownKey(null);
                    setDropdownLayout(null);
                  }}
                >
                  <Pressable
                    style={styles.dropdownBackdrop}
                    onPress={() => {
                      setOpenDropdownKey(null);
                      setDropdownLayout(null);
                    }}
                  />
                  {dropdownLayout && (
                    <View
                      style={[
                        styles.dropdownBox,
                        {
                          position: "absolute",
                          left: dropdownLayout.x,
                          top: dropdownLayout.y,
                          minWidth: Math.max(dropdownLayout.width, 200),
                        },
                      ]}
                    >
                      <ScrollView style={styles.dropdownList}>
                        {item.children
                          .map((child) => ({ child, slug: getSlugFromUrl(child.url) }))
                          .filter(({ slug }) => !!slug)
                          .map(({ child }, index) => (
                            <FocusablePressable
                              key={child.url}
                              onPress={() => handleChildPress(child)}
                              style={styles.dropdownItem}
                              hasTVPreferredFocus={index === 0}
                            >
                              <Text style={styles.dropdownItemText}>{child.title}</Text>
                            </FocusablePressable>
                          ))}
                      </ScrollView>
                    </View>
                  )}
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
  leftActions: {
    width: 120,
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
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
  },
  searchBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    justifyContent: "center",
  },
  searchPlaceholder: {
    color: colors.textSubtle,
    fontSize: 13,
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
    maxHeight: 320,
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
