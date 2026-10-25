import React, { memo, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { F } from "../theme";

// Penyorot sintaks ringan (offline, tanpa shiki) bergaya tokyo-night. Cukup untuk potongan kode pendek di soal.
const KW = new Set(("abstract as async await begin bool boolean break case catch char class const constructor continue def default defer del do double elif else elseif end enum except export extends extern fi final finally float fn for foreach from func function go if impl implements import in include int interface is lambda let long loop match module mut namespace new nil none null of or override package pass private protected pub public raise ref require return select self sizeof static string struct super switch template then this throw throws trait true false try type typedef typeof union unless unsafe until use using val var virtual void when where while with yield and not print echo println").split(" "));
const HASH = new Set(["python", "bash", "shell", "sh", "ruby", "perl", "r", "yaml", "elixir", "makefile", "powershell", "toml", "dockerfile", "nim", "crystal", "julia", "coffeescript", "text"]);
const DASH = new Set(["sql", "lua", "haskell", "ada", "elm", "vhdl", "plsql"]);
const COL = { kw: "#bb9af7", str: "#9ece6a", num: "#ff9e64", com: "#565f89", fn: "#7aa2f7", type: "#2ac3de", pun: "#89ddff", def: "#a9b1d6" };

type Tok = { t: string; c: string };
function tokenize(code: string, lang: string): Tok[] {
  const L = (lang || "").toLowerCase(), kwc = (w: string) => KW.has(L === "sql" || L === "plsql" ? w.toLowerCase() : w), hash = HASH.has(L), dash = DASH.has(L);
  const re = new RegExp([
    "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/" + (hash ? "|#[^\\n]*" : "") + (dash ? "|--[^\\n]*" : "") + (L === "lisp" || L === "assembly" || L === "asm" ? "|;[^\\n]*" : "") + (L === "html" || L === "xml" ? "|<!--[\\s\\S]*?-->" : "") + ")",
    "(\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'|`(?:\\\\.|[^`\\\\])*`)",
    "(\\b0[xX][\\da-fA-F]+\\b|\\b\\d+(?:\\.\\d+)?\\b)", "([A-Za-z_$][\\w$]*)(?=\\s*\\()", "(\\b[A-Za-z_$][\\w$]*\\b)", "(\\s+)", "([^\\sA-Za-z0-9_$\"'`])",
  ].join("|"), "g");
  const out: Tok[] = []; let m: RegExpExecArray | null, last = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push({ t: code.slice(last, m.index), c: COL.def });
    const s = m[0];
    out.push(m[1] ? { t: s, c: COL.com } : m[2] ? { t: s, c: COL.str } : m[3] ? { t: s, c: COL.num } : m[4] ? { t: s, c: kwc(s) ? COL.kw : COL.fn } : m[5] ? { t: s, c: kwc(s) ? COL.kw : /^[A-Z]/.test(s) ? COL.type : COL.def } : m[6] ? { t: s, c: COL.def } : { t: s, c: COL.pun });
    last = m.index + s.length; if (s.length === 0) re.lastIndex++;
  }
  if (last < code.length) out.push({ t: code.slice(last), c: COL.def });
  return out;
}
function CodeBlock({ code, lang, size = 13, selectable = false }: { code: string; lang?: string; size?: number; selectable?: boolean }) {
  const toks = useMemo(() => tokenize(code ?? "", lang ?? ""), [code, lang]);
  return (
    <View style={{ backgroundColor: "#1a1b26", borderRadius: 12, borderWidth: 1, borderColor: "#2a2c3d", overflow: "hidden" }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 14 }}>
        <Text selectable={selectable} style={{ fontFamily: F.mono, fontSize: size, lineHeight: size * 1.55, color: COL.def }}>{toks.map((k, i) => <Text key={i} style={{ color: k.c }}>{k.t}</Text>)}</Text>
      </ScrollView>
    </View>
  );
}
export default memo(CodeBlock);
