import React, { useCallback, useEffect } from "react";
import { AppState, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import Navigation from "./src/navigation";
import { flushSave, useStore } from "./src/lib/store";
import { C } from "./src/theme";
import BurstHost from "./src/components/BurstHost";
import { initFx } from "./src/lib/fx";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontErr] = useFonts({ SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold, JetBrainsMono_400Regular, JetBrainsMono_700Bold, Fraunces_600SemiBold });
  const fontsOk = fontsLoaded || !!fontErr; // jika font gagal dimuat, tetap lanjut (font sistem) alih-alih layar kosong selamanya
  const ready = useStore((s) => s.ready);
  useEffect(() => { initFx(); useStore.getState().init(); }, []);
  // simpan segera saat aplikasi ke latar belakang (data hanya ada di perangkat)
  useEffect(() => { const sub = AppState.addEventListener("change", (s) => { if (s !== "active") flushSave(); }); return () => sub.remove(); }, []);
  const onLayout = useCallback(() => { if (fontsOk && ready) SplashScreen.hideAsync().catch(() => {}); }, [fontsOk, ready]);
  if (!fontsOk || !ready) return null;
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: C.ink }} onLayout={onLayout}>
        <StatusBar style="light" />
        <Navigation />
        <BurstHost />
      </View>
    </SafeAreaProvider>
  );
}
