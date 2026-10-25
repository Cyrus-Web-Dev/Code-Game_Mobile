import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import type { DevRole } from "../lib/config";
import { MasterAvatarFrame } from "./MasterFrame";
import { F } from "../theme";

const PALETTE = ["#6ee7c8", "#f5c451", "#ff5c8a", "#3da5ff", "#a855f7", "#ff8a3d", "#22e58a"];
const hue = (s: string) => PALETTE[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];

/** Foto profil bulat (tersimpan lokal sebagai data URI). Tanpa foto: huruf awal berwarna. `master` memasang bingkai Master. */
export default function Avatar({ uri, name, size = 44, master }: { uri?: string | null; name: string; size?: number; master?: DevRole | null }) {
  const [bad, setBad] = useState(false), c = hue(name || "?");
  const core = uri && !bad
    ? <Image source={{ uri }} onError={() => setBad(true)} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: c }} />
    : <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: c, backgroundColor: c + "22", alignItems: "center", justifyContent: "center" }}><Text style={{ color: c, fontFamily: F.sansB, fontSize: size * 0.42, textTransform: "uppercase" }}>{(name || "?")[0]}</Text></View>;
  return master ? <MasterAvatarFrame role={master} size={size}>{core}</MasterAvatarFrame> : core;
}
