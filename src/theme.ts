// Token desain — sama dengan tailwind.config.ts versi web (ink/panel/line/paper/hot/mint/gold).
export const C = { ink: "#15131f", panel: "#1f1c2e", line: "#363150", paper: "#ece6d8", hot: "#ff5c8a", mint: "#6ee7c8", gold: "#f5c451" } as const;
export const F = {
  sans: "SpaceGrotesk_400Regular", sansM: "SpaceGrotesk_500Medium", sansB: "SpaceGrotesk_700Bold",
  mono: "JetBrainsMono_400Regular", monoB: "JetBrainsMono_700Bold", display: "Fraunces_600SemiBold",
} as const;
const h2 = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, "0");
/** Hex + alpha (0..1) -> "#rrggbbaa". */
export const al = (hex: string, a: number) => (hex.length === 7 ? hex + h2(a) : hex);
export const R = { sm: 8, md: 12, lg: 16, xl: 22 } as const;
