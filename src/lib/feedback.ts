import * as Haptics from "expo-haptics";
import { useStore } from "./store";
/** Umpan balik getar (pengganti efek suara Web Audio di versi web). Mengikuti pengaturan "Getar". */
type K = "tap" | "ok" | "bad" | "tick" | "hint" | "win";
export function haptic(k: K) {
  if (!useStore.getState().save.settings.haptics) return;
  const run = (p: Promise<void>) => p.catch(() => {});
  switch (k) {
    case "tap": return run(Haptics.selectionAsync());
    case "tick": return run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    case "hint": return run(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    case "ok": return run(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    case "bad": return run(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
    case "win": return run(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  }
}
