import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FocusablePressable } from "../components/FocusablePressable";
import { colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage, register } from "../lib/api";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const BG_URL =
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1400&q=80";

export function RegisterScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const response = await register(name.trim(), email.trim(), password);
      await signIn({
        user: response.user,
        token: response.access_token,
        rememberMe: true,
      });
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Home");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Đăng ký thất bại"));
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
            <Text style={styles.title}>Đăng ký</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Họ tên"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
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

            <FocusablePressable style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
              )}
            </FocusablePressable>

            <View style={styles.containerFooterText}>
              <Text style={styles.footerText}>Đã có tài khoản?</Text>
              <FocusablePressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.footerLink}>Đăng nhập.</Text>
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
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
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
