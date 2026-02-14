import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
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
  onRefreshRequest?: () => void;
}

export function HomeHeader({ user, onSignIn, onRegister, onLogout, onRefreshRequest }: HomeHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Home">>();
  const route = useRoute();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const isHome = route.name === "Home";
  const categorySlug = route.name === "Category" ? (route.params as { slug?: string })?.slug ?? "" : "";

  const isNavItemActive = useCallback(
    (item: NavItem) => {
      if (item.children?.length) {
        return item.children.some((c) => getSlugFromUrl(c.url) === categorySlug);
      }
      if (isHome) return isHomeUrl(item.url);
      return getSlugFromUrl(item.url) === categorySlug;
    },
    [isHome, categorySlug],
  );
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuLayout, setUserMenuLayout] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const menuItemRefs = useRef<Record<string, View | null>>({});
  const userButtonRef = useRef<View | null>(null);

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
      if (isNavItemActive(item)) {
        onRefreshRequest?.();
        return;
      }
      if (isHomeUrl(item.url)) {
        navigation.navigate("Home");
        return;
      }
      const slug = getSlugFromUrl(item.url);
      if (slug) navigation.navigate("Category", { slug });
    },
    [navigation, isNavItemActive, onRefreshRequest],
  );

  const handleChildPress = useCallback(
    (child: NavItem) => {
      const slug = getSlugFromUrl(child.url);
      setOpenDropdownKey(null);
      setDropdownLayout(null);
      if (slug === categorySlug) {
        onRefreshRequest?.();
        return;
      }
      if (slug) navigation.navigate("Category", { slug });
    },
    [navigation, categorySlug, onRefreshRequest],
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
            <View
              ref={(r) => { userButtonRef.current = r; }}
              collapsable={false}
              style={styles.userWrap}
            >
              <FocusablePressable
                onPress={() => {
                  if (userMenuOpen) {
                    setUserMenuOpen(false);
                    setUserMenuLayout(null);
                    return;
                  }
                  const ref = userButtonRef.current;
                  const { width: winW, height: winH } = Dimensions.get("window");
                  const menuW = 160;
                  const menuH = 320;
                  if (ref && typeof ref.measureInWindow === "function") {
                    ref.measureInWindow((x, y, width, height) => {
                      let left = x;
                      let top = y + height;
                      if (left + menuW > winW) left = Math.max(0, winW - menuW);
                      if (left < 0) left = 0;
                      if (top + menuH > winH) top = Math.max(0, winH - menuH);
                      if (top < 0) top = 0;
                      setUserMenuLayout({ x: left, y: top, width: menuW });
                      setUserMenuOpen(true);
                    });
                  } else {
                    setUserMenuLayout({ x: 16, y: 70, width: menuW });
                    setUserMenuOpen(true);
                  }
                }}
                style={styles.avatarTouch }
              >
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarLetter}>
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </FocusablePressable>
              <Modal
                visible={userMenuOpen}
                transparent
                animationType="fade"
                onRequestClose={() => {
                  setUserMenuOpen(false);
                  setUserMenuLayout(null);
                }}
              >
                <Pressable
                  style={styles.dropdownBackdrop}
                  onPress={() => {
                    setUserMenuOpen(false);
                    setUserMenuLayout(null);
                  }}
                />
                {userMenuLayout && (
                  <View
                    style={[
                      styles.dropdownBox,
                      {
                        position: "absolute",
                        left: userMenuLayout.x,
                        top: userMenuLayout.y,
                        minWidth: userMenuLayout.width,
                      },
                    ]}
                  >
                    <ScrollView style={styles.dropdownList}>
                      <FocusablePressable
                        onPress={() => {
                          setUserMenuOpen(false);
                          setUserMenuLayout(null);
                          // TODO: navigate to Profile
                        }}
                        style={styles.dropdownItem}
                        hasTVPreferredFocus
                      >
                        <Text style={styles.dropdownItemText}>Hồ sơ</Text>
                      </FocusablePressable>
                      <FocusablePressable
                        onPress={() => {
                          setUserMenuOpen(false);
                          setUserMenuLayout(null);
                          setLogoutConfirmVisible(true);
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text style={styles.dropdownItemText}>Đăng xuất</Text>
                      </FocusablePressable>
                    </ScrollView>
                  </View>
                )}
              </Modal>
              <Modal
                visible={logoutConfirmVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setLogoutConfirmVisible(false)}
              >
                <Pressable
                  style={styles.confirmBackdrop}
                  onPress={() => setLogoutConfirmVisible(false)}
                />
                <View style={styles.confirmBox}>
                  <View style={styles.confirmCard}>
                    <Text style={styles.confirmTitle}>Bạn có chắc muốn đăng xuất?</Text>
                    <View style={styles.confirmActions}>
                      <FocusablePressable
                        onPress={() => setLogoutConfirmVisible(false)}
                        style={styles.confirmButtonSecondary}
                      >
                        <Text style={styles.confirmButtonSecondaryText}>Hủy</Text>
                      </FocusablePressable>
                      <FocusablePressable
                        onPress={() => {
                          setLogoutConfirmVisible(false);
                          onLogout();
                        }}
                        style={styles.confirmButtonPrimary}
                        hasTVPreferredFocus
                      >
                        <Text style={styles.confirmButtonPrimaryText}>Đăng xuất</Text>
                      </FocusablePressable>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          ) : (
            <FocusablePressable onPress={onSignIn} style={styles.focusableButton}>
              <Text style={styles.signInButton}>Đăng nhập</Text>
            </FocusablePressable>
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
            const active = isNavItemActive(item);
            return (
              <View
                key={item.title}
                ref={(r) => { menuItemRefs.current[item.title] = r; }}
                collapsable={false}
                style={styles.menuItem}
              >
                <FocusablePressable
                  onPress={openDropdown}
                  style={[styles.menuLink, active && styles.menuLinkActive]}
                >
                  <Text style={[styles.menuText, active && styles.menuTextActive]}>{item.title}</Text>
                  <Text style={[styles.menuCaret, active && styles.menuTextActive]}> ▼</Text>
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
          const active = isNavItemActive(item);
          return (
            <FocusablePressable
              key={item.title}
              onPress={() => handleNavPress(item)}
              style={[styles.menuLink, active && styles.menuLinkActive]}
            >
              <Text style={[styles.menuText, active && styles.menuTextActive]}>{item.title}</Text>
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
    color: colors.text,
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
  userWrap: {
    marginLeft: 8,
  },
  avatarTouch: {
    borderRadius: 20,
    overflow: "hidden",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
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
    fontSize: 16,
  },
  menuTextActive: {
    color: colors.text,
    fontWeight: "700",
  },
  menuLinkActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
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
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  confirmBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    minWidth: 280,
  },
  confirmTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
  },
  confirmButtonSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButtonSecondaryText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  confirmButtonPrimary: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  confirmButtonPrimaryText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  userText: {
    color: colors.textSubtle,
    fontSize: 12,
  },
});
