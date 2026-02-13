import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.root}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
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
          placeholder="Password"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
        />
        <FocusablePressable style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </FocusablePressable>
        <Text style={styles.footer}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
            Sign in
          </Text>
        </Text>
        <FocusablePressable onPress={() => navigation.navigate("Home")} style={styles.guestBtn}>
          <Text style={styles.guestBtnText}>Continue as guest</Text>
        </FocusablePressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#ef4444",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#2b2b2b",
    color: colors.text,
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    color: colors.textMuted,
    marginTop: 12,
    textAlign: "center",
  },
  link: {
    color: colors.text,
    fontWeight: "700",
  },
  guestBtn: {
    marginTop: 12,
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
