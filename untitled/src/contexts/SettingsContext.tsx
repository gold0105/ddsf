import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "orange" | "blue" | "green" | "rose" | "contrast";
export type FontScale = "normal" | "large" | "xlarge";

export const THEMES: { id: ThemeName; label: string; from: string; to: string }[] = [
  { id: "orange", label: "오렌지", from: "#fb923c", to: "#f97316" },
  { id: "blue", label: "블루", from: "#60a5fa", to: "#2563eb" },
  { id: "green", label: "그린", from: "#34d399", to: "#059669" },
  { id: "rose", label: "로즈", from: "#fb7185", to: "#e11d48" },
  { id: "contrast", label: "고대비", from: "#1d4ed8", to: "#1e3a8a" },
];

export const FONT_SCALES: { id: FontScale; label: string; percent: string; sample: string }[] = [
  { id: "normal", label: "보통", percent: "100%", sample: "가나다 ABC" },
  { id: "large", label: "크게", percent: "112.5%", sample: "가나다 ABC" },
  { id: "xlarge", label: "아주 크게", percent: "125%", sample: "가나다 ABC" },
];

const THEME_KEY = "spam-guardian:theme";
const FONT_KEY = "spam-guardian:fontScale";

const FONT_PERCENT: Record<FontScale, string> = {
  normal: "100%",
  large: "112.5%",
  xlarge: "125%",
};

interface SettingsContextValue {
  theme: ThemeName;
  fontScale: FontScale;
  setTheme: (t: ThemeName) => void;
  setFontScale: (f: FontScale) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    if (v && allowed.includes(v)) return v;
  } catch {
    // localStorage unavailable
  }
  return fallback;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() =>
    readStored(THEME_KEY, ["orange", "blue", "green", "rose", "contrast"] as const, "orange")
  );
  const [fontScale, setFontScaleState] = useState<FontScale>(() =>
    readStored(FONT_KEY, ["normal", "large", "xlarge"] as const, "normal")
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_PERCENT[fontScale];
    try {
      localStorage.setItem(FONT_KEY, fontScale);
    } catch {
      // ignore
    }
  }, [fontScale]);

  return (
    <SettingsContext.Provider
      value={{ theme, fontScale, setTheme: setThemeState, setFontScale: setFontScaleState }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
