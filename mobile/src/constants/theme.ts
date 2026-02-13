export const colors = {
  background: "#000000",
  surface: "#141414",
  card: "#181818",
  text: "#ffffff",
  textMuted: "#b3b3b3",
  textSubtle: "#737373",
  primary: "#e50914",
  border: "rgba(255,255,255,0.16)",
  overlay: "rgba(0,0,0,0.55)",
};

/** Cấu hình outline khi focus (TV/D-pad). Vẽ ngoài element, không ảnh hưởng layout. */
export const focusOutline = {
  width: 2,
  color: "#ffffff",
  radius: 8,
} as const;

/** Cho card (borderRadius 12). */
export const focusOutlineCard = {
  ...focusOutline,
  radius: 12,
} as const;

/** Style for focus outline overlay (position absolute, no layout). */
export const focusOutlineCardStyle = {
  position: "absolute" as const,
  top: -focusOutlineCard.width,
  left: -focusOutlineCard.width,
  right: -focusOutlineCard.width,
  bottom: -focusOutlineCard.width,
  borderWidth: focusOutlineCard.width,
  borderColor: focusOutlineCard.color,
  borderRadius: focusOutlineCard.radius + focusOutlineCard.width,
};

export type FocusOutlineConfig = typeof focusOutline;
