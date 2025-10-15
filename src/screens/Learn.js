// src/screens/HowTo.js
import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, FlatList, ScrollView, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme26x } from "../themeContext";

/* ---------------- Asma ul Husna (extrait – colle ta liste complète si tu veux les 99) ---------------- */
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
];

/* ---------------- Wudu steps (on va les afficher en grosses cartes larges) ---------------- */
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
    fr: "Gloire à Celui qui a soumis ceci à nous… et nous retournerons vers notre Seigneur.",
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
    tr: "Rabbana ẓalamnā anfusanā…",
    fr: "Seigneur, nous nous sommes fait du tort…",
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

/* ---------------- 5 piliers de l’Islam ---------------- */
const PILLARS = [
  { k: "shahada", title: "Chahada (Profession de foi)", ar: "أشهد أن لا إله إلا الله وأشهد أن محمدًا رسول الله", fr: "Attester qu’il n’y a de divinité qu’Allah et que Muhammad est Son Messager.", desc: "Fondement de l’Islam.", icon: "ribbon-outline" },
  { k: "salat",   title: "Salât (Prière)",               ar: "الصلاة", fr: "Cinq prières quotidiennes à leurs temps, vers la Qibla.", desc: "Discipline du cœur et du temps.", icon: "notifications-outline" },
  { k: "zakat",   title: "Zakât (Aumône légale)",        ar: "الزكاة", fr: "Aumône purificatrice quand les conditions sont remplies.", desc: "Solidarité et purification.", icon: "cash-outline" },
  { k: "sawm",    title: "Sawm (Jeûne du Ramadan)",      ar: "الصيام", fr: "Jeûner le mois de Ramadan de l’aube au coucher du soleil.", desc: "Éducation de l’âme et gratitude.", icon: "flame-outline" },
  { k: "hajj",    title: "Hajj (Pèlerinage)",            ar: "الحج",   fr: "Pèlerinage à La Mecque une fois dans la vie si possible.", desc: "Unité de la Oumma.", icon: "airplane-outline" },
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

  // mode initial (permet d’ouvrir directement un onglet depuis ailleurs)
  const initial = route?.params?.initialMode ?? "names"; // "names" | "wudu" | "dua" | "pillars"
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
      <Text style={{ color: THEME.text, fontSize: 26, fontWeight: "800" }}>Learn</Text>
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
        { key: "pillars", label: "5 Piliers" },
      ].map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => setMode(opt.key)}
          android_ripple={{ color: "transparent" }}
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
              {/* Barre de recherche large */}
              <View
                style={{
                  backgroundColor: THEME.card,
                  borderColor: THEME.border,
                  borderWidth: 1,
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginBottom: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Ionicons name="search" size={18} color={THEME.sub} />
                <TextInput
                  placeholder="Rechercher (arabe, translit, signification)…"
                  placeholderTextColor={THEME.sub}
                  value={query}
                  onChangeText={setQuery}
                  style={{ color: THEME.text, flex: 1, paddingVertical: 6, fontSize: 16 }}
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
                paddingVertical: 14,
                paddingHorizontal: 18,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: THEME.text, fontSize: 16, fontWeight: "800" }}>{item.translit}</Text>
                <Text style={{ color: THEME.accent, fontSize: 20 }}>{item.ar}</Text>
              </View>
              <Text style={{ color: THEME.sub, marginTop: 6, fontSize: 14 }}>{item.meaning}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: THEME.sub, padding: 16 }}>Aucun résultat.</Text>
          }
          ListFooterComponent={
            <View style={{ alignItems: "center", paddingVertical: 18 }}>
              <Text style={{ color: THEME.accent, fontWeight: "700" }}>© 2025 @yanis26x</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  /* =======================
     MODE 2: WUDU (ScrollView) — cartes larges et aérées
     ======================= */
  if (mode === "wudu") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.appBg }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 44 }}>
          <Header />
          <Segmented />

          <View style={{ gap: 12 }}>
            {WUDU_STEPS.map((s, idx) => (
              <View
                key={s.k}
                style={{
                  backgroundColor: THEME.card,
                  borderColor: THEME.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  gap: 14,
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 1,
                }}
              >
                {/* pastille numéro plus grande */}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    borderWidth: 2,
                    borderColor: THEME.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: THEME.accentSoft,
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: THEME.accent, fontWeight: "900", fontSize: 16 }}>
                    {idx + 1}
                  </Text>
                </View>

                {/* contenu */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: THEME.text, fontWeight: "900", fontSize: 16 }}>
                    {s.title}
                  </Text>
                  <Text style={{ color: THEME.sub, marginTop: 6, lineHeight: 20, fontSize: 14 }}>
                    {s.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.border,
              borderWidth: 1,
              borderRadius: 14,
              padding: 14,
              marginTop: 14,
            }}
          >
            <Text style={{ color: THEME.sub, fontSize: 12 }}>
              ℹ️ Résumé des bases pratiquées par la majorité des écoles. Pour les cas particuliers, réfère-toi à une source fiable.
            </Text>
          </View>

          <View style={{ alignItems: "center", marginTop: 14 }}>
            <Text style={{ color: THEME.accent, fontWeight: "700" }}>© 2025 @yanis26x</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* =======================
     MODE 3: DUA (ScrollView)
     ======================= */
  if (mode === "dua") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.appBg }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 44 }}>
          <Header />
          <Segmented />

          {/* Carte gradient Dua du jour plus large */}
          <LinearGradient
            colors={THEME.screenGradient}
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: THEME.border,
              padding: 16,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "900" }}>
              Dua du jour — {dua?.ctx}
            </Text>

            <Text style={{ color: THEME.text, fontSize: 24, lineHeight: 34, marginTop: 10, textAlign: "right" }}>
              {dua?.ar}
            </Text>

            <Text style={{ color: THEME.sub, marginTop: 12, fontStyle: "italic", fontSize: 14 }}>
              {dua?.tr}
            </Text>

            <Text style={{ color: THEME.text, marginTop: 8, fontSize: 15 }}>
              {dua?.fr}
            </Text>

            <Text style={{ color: THEME.sub, marginTop: 6, fontSize: 12 }}>Source : {dua?.src}</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable
                onPress={pickRandomDua}
                android_ripple={{ color: "transparent" }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: THEME.accent,
                }}
              >
                <Ionicons name="reload" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "800" }}>Nouvelle dua</Text>
              </Pressable>

              <Pressable
                onPress={shareDua}
                android_ripple={{ color: "transparent" }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: THEME.border,
                  backgroundColor: THEME.card,
                }}
              >
                <Ionicons name="share-social-outline" size={18} color={THEME.text} />
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

  /* =======================
     MODE 4: PILIERS (ScrollView) — section demandée
     ======================= */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.appBg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 44 }}>
        <Header />
        <Segmented />

        <View style={{ gap: 12 }}>
          {PILLARS.map((p, idx) => (
            <View
              key={p.k}
              style={{
                backgroundColor: THEME.card,
                borderColor: THEME.border,
                borderWidth: 1,
                borderRadius: 16,
                padding: 16,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name={p.icon} size={20} color={THEME.accent} />
                <Text style={{ color: THEME.text, fontSize: 16, fontWeight: "900" }}>
                  {idx + 1}. {p.title}
                </Text>
              </View>

              {p.ar ? (
                <Text style={{ color: THEME.text, textAlign: "right", fontSize: 18 }}>
                  {p.ar}
                </Text>
              ) : null}

              <Text style={{ color: THEME.sub, fontSize: 15 }}>{p.fr}</Text>
              <Text style={{ color: THEME.sub, fontSize: 12 }}>{p.desc}</Text>
            </View>
          ))}
        </View>

        <View style={{ alignItems: "center", marginTop: 16 }}>
          <Text style={{ color: THEME.accent, fontWeight: "700" }}>© 2025 @yanis26x</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
