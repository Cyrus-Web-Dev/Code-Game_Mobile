import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { enableFreeze } from "react-native-screens";
import { C, F, al } from "./theme";
import { useT } from "./lib/i18n";
import { useStore } from "./lib/store";
import Welcome from "./screens/Welcome";
import Home from "./screens/Home";
import Game from "./screens/Game";
import Profile from "./screens/Profile";
import Titles from "./screens/Titles";
import Review from "./screens/Review";
import Play from "./screens/Play";
import GodMode from "./screens/God";
import DevMode from "./screens/Dev";
import Info from "./screens/Info";
import Settings from "./screens/Settings";
import Contact from "./screens/Contact";

// Layar yang tertutup (tab di bawah layar Play, dsb.) dibekukan: tidak di-render ulang setiap state/store berubah → jawab soal tetap lancar.
enableFreeze(true);
const Stack = createNativeStackNavigator(), Tab = createBottomTabNavigator();
const ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Home: ["home", "home-outline"], Game: ["game-controller", "game-controller-outline"], Profile: ["person", "person-outline"], Titles: ["ribbon", "ribbon-outline"], Review: ["book", "book-outline"],
};
function Tabs() {
  const t = useT(), ins = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false, freezeOnBlur: true, lazy: true, tabBarActiveTintColor: C.mint, tabBarInactiveTintColor: al(C.paper, 0.5),
      tabBarStyle: { backgroundColor: "#110f1b", borderTopColor: C.line, height: 58 + ins.bottom, paddingBottom: ins.bottom + 4, paddingTop: 6 },
      tabBarLabelStyle: { fontFamily: F.sansM, fontSize: 10.5 },
      tabBarIcon: ({ focused, color, size }) => <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />,
    })}>
      <Tab.Screen name="Home" component={Home} options={{ title: t("tab_menu") }} />
      <Tab.Screen name="Game" component={Game} options={{ title: t("tab_game") }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: t("tab_profile") }} />
      <Tab.Screen name="Titles" component={Titles} options={{ title: t("tab_titles") }} />
      <Tab.Screen name="Review" component={Review} options={{ title: t("tab_review") }} />
    </Tab.Navigator>
  );
}

const theme = { ...DefaultTheme, dark: true, colors: { ...DefaultTheme.colors, background: C.ink, card: C.ink, text: C.paper, border: C.line, primary: C.mint } };
export default function Navigation() {
  const hasProfile = useStore((s) => !!s.save.profile);
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true, contentStyle: { backgroundColor: C.ink }, animation: "slide_from_right" }}>
        {!hasProfile ? <Stack.Screen name="Welcome" component={Welcome} options={{ animation: "fade" }} /> : (
          <>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Play" component={Play} options={{ gestureEnabled: false, animation: "fade_from_bottom" }} />
            <Stack.Screen name="God" component={GodMode} />
            <Stack.Screen name="Dev" component={DevMode} />
            <Stack.Screen name="Info" component={Info} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Contact" component={Contact} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
