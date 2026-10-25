import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BurstConfetti } from "./Confetti";
import { useBurst } from "../lib/burst";
import { useFx } from "../lib/fx";

/** Lapisan konfeti global (di atas navigasi, tidak menangkap sentuhan). Dipicu lewat useBurst.getState().fire(...). */
export default function BurstHost() {
  const id = useBurst((s) => s.id), level = useBurst((s) => s.level), x = useBurst((s) => s.x), y = useBurst((s) => s.y), fx = useFx();
  const [live, setLive] = useState(0);
  useEffect(() => { if (!id) return; setLive(id); const h = setTimeout(() => setLive(0), 3400); return () => clearTimeout(h); }, [id]);
  if (!live || !level || fx === "off") return null;
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 999, elevation: 999 }]}><BurstConfetti key={live} level={level} x={x} y={y} fx={fx} /></View>;
}
