import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../constants/theme";

interface PageLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function PageLoading({ message, fullScreen = true }: PageLoadingProps) {
  return (
    <View style={[styles.root, fullScreen && styles.fullScreen]}>
      <ActivityIndicator color={colors.primary} size="large" style={styles.spinner} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  fullScreen: {
    flex: 1,
    minHeight: "100%",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logo: {
    width: 48,
    height: 48,
  },
  brand: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  spinner: {
    marginVertical: 8,
  },
  message: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 12,
  },
});
