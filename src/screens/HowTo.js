// src/screens/HowTo.js
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme26x } from "../themeContext";

export const ASMA_UL_HUSNA = [
  { id: 1,  ar: "ٱللَّٰه", translit: "Allah",        meaning: "The Proper Name of God" },
  { id: 2,  ar: "الرَّحْمَٰن", translit: "Ar-Raḥmān",  meaning: "The Entirely Merciful" },
  { id: 3,  ar: "الرَّحِيم", translit: "Ar-Raḥīm",    meaning: "The Especially Merciful" },
  { id: 4,  ar: "الْمَلِك", translit: "Al-Malik",     meaning: "The Sovereign" },
  { id: 5,  ar: "الْقُدُّوس", translit: "Al-Quddūs",  meaning: "The Most Sacred" },
  { id: 6,  ar: "السَّلَام", translit: "As-Salām",    meaning: "The Source of Peace" },
  { id: 7,  ar: "الْمُؤْمِن", translit: "Al-Mu’min",  meaning: "The Giver of Security" },
  { id: 8,  ar: "الْمُهَيْمِن", translit: "Al-Muhaymin", meaning: "The Protector" },
  { id: 9,  ar: "الْعَزِيز", translit: "Al-‘Azīz",    meaning: "The All-Mighty" },
  { id: 10, ar: "الْجَبَّار", translit: "Al-Jabbār",  meaning: "The Compeller" },
  { id: 11, ar: "الْمُتَكَبِّر", translit: "Al-Mutakabbir", meaning: "The Supreme in Greatness" },
  { id: 12, ar: "الْخَالِق", translit: "Al-Khāliq", meaning: "The Creator" },
  { id: 13, ar: "الْبَارِئ", translit: "Al-Bāri’", meaning: "The Originator" },
  { id: 14, ar: "الْمُصَوِّر", translit: "Al-Muṣawwir", meaning: "The Fashioner" },
  { id: 15, ar: "الْغَفَّار", translit: "Al-Ghaffār", meaning: "The Ever-Forgiving" },
  { id: 16, ar: "الْقَهَّار", translit: "Al-Qahhār", meaning: "The All-Prevailing One" },
  { id: 17, ar: "الْوَهَّاب", translit: "Al-Wahhāb", meaning: "The Bestower" },
  { id: 18, ar: "الرَّزَّاق", translit: "Ar-Razzāq", meaning: "The Provider" },
  { id: 19, ar: "الْفَتَّاح", translit: "Al-Fattāḥ", meaning: "The Opener" },
  { id: 20, ar: "اَلْعَلِيم", translit: "Al-‘Alīm", meaning: "The All-Knowing" },
  { id: 21, ar: "الْقَابِض", translit: "Al-Qābiḍ", meaning: "The Withholder" },
  { id: 22, ar: "الْبَاسِط", translit: "Al-Bāsiṭ", meaning: "The Expander" },
  { id: 23, ar: "الْخَافِض", translit: "Al-Khāfiḍ", meaning: "The Abaser" },
  { id: 24, ar: "الرَّافِع", translit: "Ar-Rāfi‘", meaning: "The Exalter" },
  { id: 25, ar: "الْمُعِزّ", translit: "Al-Mu‘izz", meaning: "The Honorer" },
  { id: 26, ar: "المُذِلّ", translit: "Al-Mudhill", meaning: "The Dishonorer" },
  { id: 27, ar: "السَّمِيع", translit: "As-Samī‘", meaning: "The All-Hearing" },
  { id: 28, ar: "الْبَصِير", translit: "Al-Baṣīr", meaning: "The All-Seeing" },
  { id: 29, ar: "الْحَكَم", translit: "Al-Ḥakam", meaning: "The Judge" },
  { id: 30, ar: "الْعَدْل", translit: "Al-‘Adl", meaning: "The Just" },
  { id: 31, ar: "اللَّطِيف", translit: "Al-Laṭīf", meaning: "The Subtle, The Gentle" },
  { id: 32, ar: "الْخَبِير", translit: "Al-Khabīr", meaning: "The All-Aware" },
  { id: 33, ar: "الْحَلِيم", translit: "Al-Ḥalīm", meaning: "The Forbearing" },
  { id: 34, ar: "الْعَظِيم", translit: "Al-‘Aẓīm", meaning: "The Magnificent" },
  { id: 35, ar: "الْغَفُور", translit: "Al-Ghafūr", meaning: "The Forgiving" },
  { id: 36, ar: "الشَّكُور", translit: "Ash-Shakūr", meaning: "The Most Appreciative" },
  { id: 37, ar: "الْعَلِيّ", translit: "Al-‘Aliyy", meaning: "The Most High" },
  { id: 38, ar: "الْكَبِير", translit: "Al-Kabīr", meaning: "The Most Great" },
  { id: 39, ar: "الْحَفِيظ", translit: "Al-Ḥafīẓ", meaning: "The Preserver" },
  { id: 40, ar: "المُقِيت", translit: "Al-Muqīt", meaning: "The Sustainer" },
  { id: 41, ar: "الْحسِيب", translit: "Al-Ḥasīb", meaning: "The Reckoner" },
  { id: 42, ar: "الْجَلِيل", translit: "Al-Jalīl", meaning: "The Majestic" },
  { id: 43, ar: "الْكَرِيم", translit: "Al-Karīm", meaning: "The Generous" },
  { id: 44, ar: "الرَّقِيب", translit: "Ar-Raqīb", meaning: "The Watchful" },
  { id: 45, ar: "الْمُجِيب", translit: "Al-Mujīb", meaning: "The Responsive" },
  { id: 46, ar: "الْوَاسِع", translit: "Al-Wāsi‘", meaning: "The All-Encompassing" },
  { id: 47, ar: "الْحَكِيم", translit: "Al-Ḥakīm", meaning: "The All-Wise" },
  { id: 48, ar: "الْوَدُود", translit: "Al-Wadūd", meaning: "The Most Loving" },
  { id: 49, ar: "الْمَجِيد", translit: "Al-Majīd", meaning: "The Glorious" },
  { id: 50, ar: "الْبَاعِث", translit: "Al-Bā‘ith", meaning: "The Resurrector" },
  { id: 51, ar: "الشَّهِيد", translit: "Ash-Shahīd", meaning: "The Witness" },
  { id: 52, ar: "الْحَقّ", translit: "Al-Ḥaqq", meaning: "The Truth" },
  { id: 53, ar: "الْوَكِيل", translit: "Al-Wakīl", meaning: "The Trustee" },
  { id: 54, ar: "الْقَوِيّ", translit: "Al-Qawwiyy", meaning: "The Strong" },
  { id: 55, ar: "الْمَتِين", translit: "Al-Matīn", meaning: "The Firm" },
  { id: 56, ar: "الْوَلِيّ", translit: "Al-Waliyy", meaning: "The Protecting Friend" },
  { id: 57, ar: "الْحَمِيد", translit: "Al-Ḥamīd", meaning: "The Praiseworthy" },
  { id: 58, ar: "الْمُحْصِي", translit: "Al-Muḥṣī", meaning: "The Reckoner" },
  { id: 59, ar: "الْمُبْدِئ", translit: "Al-Mubdi’", meaning: "The Originator" },
  { id: 60, ar: "الْمُعِيد", translit: "Al-Mu‘īd", meaning: "The Restorer" },
  { id: 61, ar: "الْمُحْيِي", translit: "Al-Muḥyī", meaning: "The Giver of Life" },
  { id: 62, ar: "اَلْمُمِيت", translit: "Al-Mumīt", meaning: "The Taker of Life" },
  { id: 63, ar: "الْحَيّ", translit: "Al-Ḥayy", meaning: "The Ever-Living" },
  { id: 64, ar: "الْقَيُّوم", translit: "Al-Qayyūm", meaning: "The Sustainer" },
  { id: 65, ar: "الْوَاجِد", translit: "Al-Wājid", meaning: "The Finder" },
  { id: 66, ar: "الْمَاجِد", translit: "Al-Mājid", meaning: "The Noble" },
  { id: 67, ar: "الْواحِد", translit: "Al-Wāḥid", meaning: "The One" },
  { id: 68, ar: "اَلاَحَد", translit: "Al-Aḥad", meaning: "The Unique" },
  { id: 69, ar: "الصَّمَد", translit: "As-Ṣamad", meaning: "The Eternal Refuge" },
  { id: 70, ar: "الْقَادِر", translit: "Al-Qādir", meaning: "The Capable" },
  { id: 71, ar: "الْمُقْتَدِر", translit: "Al-Muqtadir", meaning: "The Powerful" },
  { id: 72, ar: "الْمُقَدِّم", translit: "Al-Muqaddim", meaning: "The Expediter" },
  { id: 73, ar: "الْمُؤَخِّر", translit: "Al-Mu’akhkhir", meaning: "The Delayer" },
  { id: 74, ar: "الأوَّل", translit: "Al-Awwal", meaning: "The First" },
  { id: 75, ar: "الآخِر", translit: "Al-Ākhir", meaning: "The Last" },
  { id: 76, ar: "الظَّاهِر", translit: "Aẓ-Ẓāhir", meaning: "The Manifest" },
  { id: 77, ar: "الْبَاطِن", translit: "Al-Bāṭin", meaning: "The Hidden" },
  { id: 78, ar: "الْوَالِي", translit: "Al-Wālī", meaning: "The Governor" },
  { id: 79, ar: "الْمُتَعَالِي", translit: "Al-Muta‘ālī", meaning: "The Most Exalted" },
  { id: 80, ar: "الْبَرّ", translit: "Al-Barr", meaning: "The Source of All Goodness" },
  { id: 81, ar: "التَّوَّاب", translit: "At-Tawwāb", meaning: "The Accepter of Repentance" },
  { id: 82, ar: "الْمُنْتَقِم", translit: "Al-Muntaqim", meaning: "The Avenger" },
  { id: 83, ar: "العَفُوّ", translit: "Al-‘Afuww", meaning: "The Pardoner" },
  { id: 84, ar: "الرَّؤُوف", translit: "Ar-Ra’ūf", meaning: "The Compassionate" },
  { id: 85, ar: "مَالِكُ الْمُلْك", translit: "Mālik-ul-Mulk", meaning: "The Owner of Dominion" },
  { id: 86, ar: "ذُوالْجَلاَلِ وَالإكْرَام", translit: "Dhūl-Jalāl wa-l-Ikrām", meaning: "The Lord of Majesty and Honor" },
  { id: 87, ar: "الْمُقْسِط", translit: "Al-Muqsiṭ", meaning: "The Equitable" },
  { id: 88, ar: "الْجَامِع", translit: "Al-Jāmi‘", meaning: "The Gatherer" },
  { id: 89, ar: "الْغَنِيّ", translit: "Al-Ghaniyy", meaning: "The Self-Sufficient" },
  { id: 90, ar: "الْمُغْنِي", translit: "Al-Mughnī", meaning: "The Enricher" },
  { id: 91, ar: "اَلْمَانِع", translit: "Al-Māni‘", meaning: "The Preventer" },
  { id: 92, ar: "الضَّارّ", translit: "Aḍ-Ḍārr", meaning: "The Distresser" },
  { id: 93, ar: "النَّافِع", translit: "An-Nāfi‘", meaning: "The Benefactor" },
  { id: 94, ar: "النُّور", translit: "An-Nūr", meaning: "The Light" },
  { id: 95, ar: "الْهَادِي", translit: "Al-Hādī", meaning: "The Guide" },
  { id: 96, ar: "الْبَدِيع", translit: "Al-Badī‘", meaning: "The Incomparable" },
  { id: 97, ar: "اَلْبَاقِي", translit: "Al-Bāqī", meaning: "The Everlasting" },
  { id: 98, ar: "الْوَارِث", translit: "Al-Wārith", meaning: "The Inheritor" },
  { id: 99, ar: "الرَّشِيد", translit: "Ar-Rashīd", meaning: "The Guide to the Right Path" },
];


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

export default function HowToScreen() {
  const { THEME } = useTheme26x();
  const [mode, setMode] = useState("names"); // "names" | "wudu"
  const [query, setQuery] = useState("");

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
      <Pressable
        onPress={() => setMode("names")}
        style={{
          flex: 1,
          backgroundColor: mode === "names" ? THEME.accent : "transparent",
          paddingVertical: 10,
          borderRadius: 999,
          alignItems: "center",
        }}
      >
        <Text style={{ color: mode === "names" ? "#fff" : THEME.sub, fontWeight: "700" }}>
          99 Noms d’Allah
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setMode("wudu")}
        style={{
          flex: 1,
          backgroundColor: mode === "wudu" ? THEME.accent : "transparent",
          paddingVertical: 10,
          borderRadius: 999,
          alignItems: "center",
        }}
      >
        <Text style={{ color: mode === "wudu" ? "#fff" : THEME.sub, fontWeight: "700" }}>
          Ablutions (Wudu)
        </Text>
      </Pressable>
    </View>
  );

  // MODE 1: FlatList seule
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
              {/* Search */}
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
          ListEmptyComponent={<Text style={{ color: THEME.sub, padding: 16 }}>Aucun résultat.</Text>}
          ListFooterComponent={
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <Text style={{ color: THEME.accent, fontWeight: "700" }}>© 2025 @yanis26x</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // MODE 2: ScrollView seule
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
              ℹ️ Ce guide résume les bases pratiquées par la majorité des écoles. Pour les cas particuliers, réfère-toi
              à une source fiable.
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "center", marginTop: 16 }}>
          <Text style={{ color: THEME.accent, fontWeight: "700" }}>© 2025 yanis26x · Tous droits réservé</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
