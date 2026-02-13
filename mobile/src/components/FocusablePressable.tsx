import React, { useState } from "react";
import { Pressable, type PressableProps, StyleSheet, StyleProp, View, ViewStyle } from "react-native";
import { focusOutline, type FocusOutlineConfig } from "../constants/theme";

type FocusablePressableProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
  /** Cấu hình outline khi focus. Mặc định theme focusOutline. */
  focusOutlineConfig?: FocusOutlineConfig;
};

/**
 * Pressable có outline khi focus (TV/D-pad). Outline vẽ ngoài, không chiếm layout.
 */
function FocusablePressableInner({
  style,
  focusOutlineConfig = focusOutline,
  onFocus,
  onBlur,
  children,
  ...props
}: FocusablePressableProps) {
  const [focused, setFocused] = useState(false);
  const w = focusOutlineConfig.width;
  const ringStyle: ViewStyle = {
    position: "absolute",
    top: -w,
    left: -w,
    right: -w,
    bottom: -w,
    borderWidth: w,
    borderColor: focusOutlineConfig.color,
    borderRadius: focusOutlineConfig.radius + w,
    pointerEvents: "none",
  };

  return (
    <View style={styles.wrapper}>
      {focused && <View style={ringStyle} />}
      <Pressable
        style={style}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        focusable
        {...props}
      >
        {children}
      </Pressable>
    </View>
  );
}

export const FocusablePressable = React.memo(FocusablePressableInner);

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "visible",
    margin: 4,
  },
});
