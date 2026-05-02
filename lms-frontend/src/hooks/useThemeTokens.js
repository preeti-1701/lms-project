import { useTheme } from "../context/ThemeContext";

const DARK = {
  bgRoot:       "#0c0c0e",
  bgCard:       "#111214",
  bgSidebar:    "#111214",
  bgInput:      "#17171a",
  bgHover:      "#1a1a1e",
  bgHover2:     "#141417",
  bgTopbar:     "#0c0c0e",
  border:       "#1c1c20",
  borderStrong: "#2a2a2e",
  borderFaint:  "#161618",
  textPrimary:  "#f1f0ee",
  textSecondary:"#e0dfe0",
  textBody:     "#bbb",
  textMuted:    "#888",
  textDim:      "#555",
  textFaint:    "#444",
  textGhost:    "#333",
  textLabel:    "#666",
};

const LIGHT = {
  bgRoot:       "#f0f0f5",
  bgCard:       "#ffffff",
  bgSidebar:    "#ffffff",
  bgInput:      "#f5f5f8",
  bgHover:      "#f0f0f5",
  bgHover2:     "#f8f8fb",
  bgTopbar:     "#ffffff",
  border:       "#e0e0e8",
  borderStrong: "#c8c8d4",
  borderFaint:  "#ebebf0",
  textPrimary:  "#111214",
  textSecondary:"#2a2a30",
  textBody:     "#444450",
  textMuted:    "#666670",
  textDim:      "#888890",
  textFaint:    "#999aa5",
  textGhost:    "#bbbbc5",
  textLabel:    "#77778a",
};

export function useThemeTokens() {
  const { theme } = useTheme();
  return theme === "dark" ? DARK : LIGHT;
}