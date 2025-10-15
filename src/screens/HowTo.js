// src/screens/HowTo.js
import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, FlatList, ScrollView, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme26x } from "../themeContext";

/* ---------------- Asma ul Husna (extrait – tu peux coller ta liste complète) ---------------- */
const ASMA_UL_HUSNA = [
  { id: 1,  ar: "ٱللَّٰه", translit: "Allah",        meaning: "The Proper Name of God" },
  { id: 2,  ar: "الرَّحْمَٰن", translit: "Ar-Raḥmān",  meaning: "The Entirely Merciful" },
  { id: 3,  ar: "الرَّحِيم", translit: "Ar-Raḥīm",    meaning: "The Especially Merciful" },
  { id: 4,  ar: "الْمَلِك", translit: "Al-Malik",     meaning: "The Sovereign" },
  { id: 5,  ar: "الْقُدُّوس", translit: "Al-Quddūs",  meaning: "The Most Sacred" },
  { id: 6,  ar: "السَّلَام", translit: "As-Salām",    meaning: "The Source of Peace" },
  { id: 7,  ar: "الْمُؤْمِن", translit: "Al-Mu’min",  meaning: "The Giver of Security" },
  { id: 8,  ar: "الْمُهَيْمِن", translit: "Al-Muhaymin", meaning: "The Guardian" },
  { id: 9,  ar: "الْعَزِيز", translit: "Al-‘Azīz",    meaning: "The All-Mighty" },
  { id: 10, ar: "الْجَبَّار", translit: "Al-Jabbār",  meaning: "The Compeller" },
  { id: 11, ar: "الْمُتَكَبِّر", translit: "Al-Mutakabbir", meaning: "The Supreme in Greatness" },
  // 👉 colle ici ta liste complète si tu veux les 99
];

/* ---------------- Wudu steps ---------------- */
const WUDU_STEPS = [
  { k: "niyyah",    title: "Intention (Niyyah)", desc: "Avoir l’intention de faire wudu pour prier." },
  { k: "bismillah", title: "Bismillah",          desc: "Dire « Bismillah » avant de commencer." },
  { k: "hands",     title: "Mains x3",           desc: "Laver les deux mains jusqu’aux poignets, trois fois." },
  { k: "mouth",     title: "Bouche x3",          desc: "Rincer la bouche, trois fois." },
  { k: "nose",      title: "Nez x3",             desc: "Inhaler un peu d’eau et l’expulser, trois fois." },
  { k: "face",      title: "Visage x3",          desc: "Front→menton, oreille→oreille, trois fois." },
  { k: "arms",      title: "Avant-bras x3",      desc: "Droit puis gauche jusqu’aux coudes, trois fois." },
  { k: "head",      title: "Tête (Mas’h)",       desc: "Passer les mains humides sur la tête, une fois." },
  { k: "ears",      title: "Oreilles",           desc: "Essuyer intérieur/extérieur des oreilles." },
  { k: "feet",      title: "Pieds x3",           desc: "Droit puis gauche jusqu’aux chevilles, entre orteils." },
  { k: "tarteeb",   title: "Ordre & continuité", desc: "Respecter l’ordre et éviter les longues pauses." },
];

/* ---------------- DUA LIST (sélection) ---------------- */
const DUA_LIST = [
  {
    id: "morning",
    ar: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    tr: "Allahumma bika aṣbaḥnā wa bika amsaynā wa bika naḥyā wa bika namūtu wa ilayka-n-nushūr.",
    fr: "Ô Allah, par Toi nous parvenons au matin et au soir, par Toi nous vivons et mourons, et vers Toi est la résurrection.",
    ctx: "Dhikr du matin/soir",
    src: "Tirmidhi"
  },
  {
    id: "sleep",
    ar: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    tr: "Bismika Allahumma amūtu wa aḥyā.",
    fr: "En Ton nom, ô Allah, je meurs et je vis.",
    ctx: "Avant de dormir",
    src: "Bukhari"
  },
  {
    id: "travel",
    ar: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    tr: "Subḥāna-lladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn wa innā ilā rabbinā lamunqalibūn.",
    fr: "Gloire à Celui qui a soumis ceci à nous alors que nous n’en étions pas capables; et certes nous retournerons vers notre Seigneur.",
    ctx: "Dua du voyage",
    src: "Muslim"
  },
  {
    id: "knowledge",
    ar: "رَبِّ زِدْنِي عِلْمًا",
    tr: "Rabbi zidnī ‘ilmā.",
    fr: "Seigneur, augmente-moi en science.",
    ctx: "Avant l’étude",
    src: "Qur’ān 20:114"
  },
  {
    id: "forgiveness",
    ar: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    tr: "Rabbana ẓalamnā anfusanā wa in lam taghfir lanā wa tarḥamnā lanakūnanna mina-l-khāsirīn.",
    fr: "Seigneur, nous nous sommes fait du tort; si Tu ne nous pardonnes pas et ne nous fais pas miséricorde, nous serons certes parmi les perdants.",
    ctx: "Repentir (Adam)",
    src: "Qur’ān 7:23"
  },
  {
    id: "parents",
    ar: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    tr: "Rabbi irḥamhumā kamā rabbayānī ṣaghīrā.",
    fr: "Seigneur, fais-leur miséricorde comme ils m’ont élevé petit.",
    ctx: "Dua pour les parents",
    src: "Qur’ān 17:24"
  },
  {
    id: "hearts",
    ar: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    tr: "Yā muqalliba-l-qulūb, thabbit qalbī ‘alā dīnik.",
    fr: "Ô Toi qui tournes les cœurs, affermis mon cœur sur Ta religion.",
    ctx: "Fermeté du cœur",
    src: "Tirmidhi"
  },
];

/* ---------------- Utils ---------------- */
function seededPick(arr, seedNumber) {
  if (!arr?.length) return null;
  const idx = Math.abs(seedNumber) % arr.length;
  return arr[idx];
}
function todaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export default function HowToScreen({ route }) {
  const { THEME } = useTheme26x();

  // lecture du mode initial (pour ouvrir directement “dua” depuis la Home)
  const initial = route?.params?.initialMode ?? "names"; // "names" | "wudu" | "dua"
  const [mode, setMode] = useState(initial);
  useEffect(() => {
    if (route?.params?.initialMode && route.params.initialMode !== mode) {
      setMode(route.params.initialMode);
    }
  }, [route?.params?.initialMode]);

  const [query, setQuery] = useState("");

  /* --------- Asma: filtre --------- */
  const filteredNames = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ASMA_UL_HUSNA;
    return ASMA_UL_HUSNA.filter(
      (n) =>
        n.ar.includes(q) ||
        n.translit.toLowerCase().includes(q) ||
        n.meaning.toLowerCase().includes(q)
    );
  }, [query]);

  /* --------- Dua du jour --------- */
  const [dua, setDua] = useState(() => seededPick(DUA_LIST, todaySeed()));
  const pickRandomDua = () => {
    const r = Math.floor(Math.random() * DUA_LIST.length);
    setDua(DUA_LIST[r]);
  };
  const shareDua = async () => {
    if (!dua) return;
    const text = `Dua du jour — ${dua.ctx}\n\nArabe:\n${dua.ar}\n\nTranslittération:\n${dua.tr}\n\nFrançais:\n${dua.fr}\n\nSource: ${dua.src}\n— via MySalat`;
    try {
      await Share.share({ message: text });
    } catch {}
  };

  /* --------- UI components --------- */
  const Header = () => (
    <View style={{ alignItems: "center", marginBottom: 12 }}>
      <Text style={{ color: THEME.text, fontSize: 26, fontWeight: "800" }}>How To</Text>
      <Text style={{ color: THEME.sub, marginTop: 4 }}>Guides rapides pour apprendre et réviser</Text>
    </View>
  );

  const Segmented = () => (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border,
        borderRadius: 999,
        padding: 4,
        marginBottom: 16,
      }}
    >
      {[
        { key: "names", label: "99 Noms d’Allah" },
        { key: "wudu", label: "Ablutions (Wudu)" },
        { key: "dua", label: "Dua du jour" },
      ].map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => setMode(opt.key)}
          style={{
            flex: 1,
            backgroundColor: mode === opt.key ? THEME.accent : "transparent",
            paddingVertical: 10,
            borderRadius: 999,
            alignItems: "center",
          }}
        >
          <Text style={{ color: mode === opt.key ? "#fff" : THEME.sub, fontWeight: "700" }}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  /* =======================
     MODE 1: NOMS (FlatList)
     ======================= */
  if (mode === "names") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.appBg }}>
        <FlatList
          data={filteredNames}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          windowSize={10}
          removeClippedSubviews
          ListHeaderComponent={
            <View style={{ padding: 16, paddingBottom: 0 }}>
              <Header />
              <Segmented />
              {/* Barre de recherche */}
              <View
                style={{
                  backgroundColor: THEME.card,
                  borderColor: THEME.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="search" size={18} color={THEME.sub} />
                <TextInput
                  placeholder="Rechercher (arabe, translit, signification)…"
                  placeholderTextColor={THEME.sub}
                  value={query}
                  onChangeText={setQuery}
                  style={{ color: THEME.text, flex: 1, paddingVertical: 6 }}
                />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: THEME.card,
                borderTopWidth: 1,
                borderTopColor: THEME.border,
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: THEME.text, fontSize: 16, fontWeight: "800" }}>{item.translit}</Text>
                <Text style={{ color: THEME.accent, fontSize: 18 }}>{item.ar}</Text>
              </View>
              <Text style={{ color: THEME.sub, marginTop: 4 }}>{item.meaning}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: THEME.sub, padding: 16 }}>Aucun résultat.</Text>
          }
          ListFooterComponent={
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <Text style={{ color: THEME.accent, fontWeight: "700" }}>© 2025 @yanis26x</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  /* =======================
     MODE 2: WUDU (ScrollView)
     ======================= */
  if (mode === "wudu") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.appBg }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Header />
          <Segmented />

          <View
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 14,
            }}
          >
            <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
              Guide des ablutions (Wudu)
            </Text>

            {WUDU_STEPS.map((s, idx) => (
              <View
                key={s.k}
                style={{
                  flexDirection: "row",
                  gap: 10,
                  paddingVertical: 10,
                  borderBottomWidth: idx === WUDU_STEPS.length - 1 ? 0 : 1,
                  borderBottomColor: THEME.border,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: THEME.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: THEME.accent, fontWeight: "800" }}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: THEME.text, fontWeight: "800" }}>{s.title}</Text>
                  <Text style={{ color: THEME.sub, marginTop: 2 }}>{s.desc}</Text>
                </View>
              </View>
            ))}

            <View style={{ marginTop: 12, gap: 8 }}>
              <Text style={{ color: THEME.sub, fontSize: 12 }}>
                ℹ️ Ce guide résume les bases pratiquées par la majorité des écoles.
              </Text>
            </View>
          </View>

          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: THEME.accent, fontWeight: "700" }}>© 2025 @yanis26x</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* =======================
     MODE 3: DUA (ScrollView)
     ======================= */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.appBg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Header />
        <Segmented />

        {/* Carte gradient Dua du jour */}
        <LinearGradient
          colors={THEME.screenGradient}
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: THEME.border,
            padding: 14,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: THEME.text, fontSize: 16, fontWeight: "800" }}>Dua du jour — {dua?.ctx}</Text>
          {/* Arabe */}
          <Text style={{ color: THEME.text, fontSize: 22, lineHeight: 32, marginTop: 8, textAlign: "right" }}>
            {dua?.ar}
          </Text>
          {/* Translittération */}
          <Text style={{ color: THEME.sub, marginTop: 10, fontStyle: "italic" }}>
            {dua?.tr}
          </Text>
          {/* Français */}
          <Text style={{ color: THEME.text, marginTop: 8 }}>
            {dua?.fr}
          </Text>
          {/* Source */}
          <Text style={{ color: THEME.sub, marginTop: 6, fontSize: 12 }}>Source : {dua?.src}</Text>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <Pressable
              onPress={pickRandomDua}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 10,
                backgroundColor: THEME.accent,
              }}
            >
              <Ionicons name="reload" size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800" }}>Nouvelle dua</Text>
            </Pressable>

            <Pressable
              onPress={shareDua}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: THEME.border,
                backgroundColor: THEME.card,
              }}
            >
              <Ionicons name="share-social-outline" size={16} color={THEME.text} />
              <Text style={{ color: THEME.text, fontWeight: "800" }}>Partager</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Text style={{ color: THEME.accent, fontWeight: "700" }}>© 2025 @yanis26x</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
