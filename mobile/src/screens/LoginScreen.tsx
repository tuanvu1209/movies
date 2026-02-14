import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FocusablePressable } from "../components/FocusablePressable";
import { useAuth } from "../context/AuthContext";
import { colors } from "../constants/theme";
import { getApiErrorMessage, login } from "../lib/api";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const BG_URL =
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1400&q=80";

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const response = await login(email.trim(), password);
      await signIn({
        user: response.user,
        token: response.access_token,
        rememberMe,
      });
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Home");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Đăng nhập thất bại"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground source={{ uri: BG_URL }} resizeMode="cover" style={styles.background}>
      <LinearGradient
        colors={["rgba(0,0,0,0.82)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.92)"]}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.center}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Đăng nhập</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email (hoặc tên đăng nhập)"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Mật khẩu"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
            />

            <View style={styles.rememberRow}>
              <FocusablePressable onPress={() => setRememberMe((prev) => !prev)} style={styles.checkboxWrapper}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]} />
              </FocusablePressable>
              <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
            </View>

            <FocusablePressable style={[styles.button, (!email.trim() || !password.trim()) && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading || !email.trim() || !password.trim()}>
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={[styles.buttonText, (!email.trim() || !password.trim()) && styles.buttonTextDisabled]}>Đăng nhập</Text>
              )}
            </FocusablePressable>

            <View style={styles.containerFooterText}>
              <Text style={styles.footerText}>Chưa có tài khoản?</Text>
              <FocusablePressable onPress={() => navigation.navigate("Register")}>
                <Text style={styles.footerLink}>Đăng ký ngay.</Text>
              </FocusablePressable>
            </View>
            <FocusablePressable onPress={() => navigation.navigate("Home")} style={styles.guestBtn}>
              <Text style={styles.guestBtnText}>Tiếp tục với tư cách khách</Text>
            </FocusablePressable>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 26,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 18,
  },
  errorText: {
    color: "#f87171",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#333333",
    color: colors.text,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  checkboxWrapper: {
    padding: 2,
    borderRadius: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: colors.textSubtle,
    borderRadius: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberText: {
    marginLeft: 8,
    color: colors.textMuted,
    fontSize: 13,
  },
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.textSubtle,
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  containerFooterText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: colors.textMuted,
    textAlign: "center",
    padding: 4,
  },
  footerLink: {
    color: colors.text,
    fontWeight: "700",
    padding: 4,
  },
  guestBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  guestBtnText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
});
