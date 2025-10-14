// src/screens/HowTo.js
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

const CARD = {
  bg: "#0B0B0F",
  text: "#FFFFFF",
  sub: "#9CA3AF",
  accent: "#3B82F6",
  border: "#1a1a1a",
};

const ASMA_UL_HUSNA = [
  { id: 1,  ar: "ٱللَّٰه", translit: "Allah",        meaning: "The Proper Name of God" },
  { id: 2,  ar: "الرَّحْمٰن", translit: "Ar-Raḥmān",  meaning: "The Entirely Merciful" },
  { id: 3,  ar: "الرَّحِيم", translit: "Ar-Raḥīm",    meaning: "The Especially Merciful" },
  { id: 4,  ar: "الْمَلِك", translit: "Al-Malik",     meaning: "The Sovereign" },
  { id: 5,  ar: "الْقُدُّوس", translit: "Al-Quddūs",  meaning: "The Most Sacred" },
  { id: 6,  ar: "السَّلَام", translit: "As-Salām",    meaning: "The Source of Peace" },
  { id: 7,  ar: "الْمُؤْمِن", translit: "Al-Mu’min",  meaning: "The Giver of Security" },
  { id: 8,  ar: "الْمُهَيْمِن", translit: "Al-Muhaymin", meaning: "The Guardian" },
  { id: 9,  ar: "الْعَزِيز", translit: "Al-‘Azīz",    meaning: "The All-Mighty" },
  { id: 10, ar: "الْجَبَّار", translit: "Al-Jabbār",  meaning: "The Compeller" },
  { id: 11, ar: "الْمُتَكَبِّر", translit: "Al-Mutakabbir", meaning: "The Supreme" },
  // … complète jusqu’à 99 si tu veux
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

  // Header commun
  const Header = () => (
    <View style={{ alignItems: "center", marginBottom: 12 }}>
      <Text style={{ color: CARD.text, fontSize: 26, fontWeight: "800" }}>How To</Text>
      <Text style={{ color: CARD.sub, marginTop: 4 }}>Guides rapides pour apprendre et réviser</Text>
    </View>
  );

  // Segmented control commun
  const Segmented = () => (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: CARD.bg,
        borderWidth: 1,
        borderColor: CARD.border,
        borderRadius: 999,
        padding: 4,
        marginBottom: 16,
      }}
    >
      <Pressable
        onPress={() => setMode("names")}
        style={{
          flex: 1,
          backgroundColor: mode === "names" ? CARD.accent : "transparent",
          paddingVertical: 10,
          borderRadius: 999,
          alignItems: "center",
        }}
      >
        <Text style={{ color: mode === "names" ? "#fff" : CARD.sub, fontWeight: "700" }}>
          99 Noms d’Allah
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setMode("wudu")}
        style={{
          flex: 1,
          backgroundColor: mode === "wudu" ? CARD.accent : "transparent",
          paddingVertical: 10,
          borderRadius: 999,
          alignItems: "center",
        }}
      >
        <Text style={{ color: mode === "wudu" ? "#fff" : CARD.sub, fontWeight: "700" }}>
          Ablutions (Wudu)
        </Text>
      </Pressable>
    </View>
  );

  // 🔹 MODE 1: FlatList SEULE (pas de ScrollView autour)
  if (mode === "names") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
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
                  backgroundColor: CARD.bg,
                  borderColor: CARD.border,
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
                <Ionicons name="search" size={18} color={CARD.sub} />
                <TextInput
                  placeholder="Rechercher (arabe, translit, signification)…"
                  placeholderTextColor={CARD.sub}
                  value={query}
                  onChangeText={setQuery}
                  style={{ color: CARD.text, flex: 1, paddingVertical: 6 }}
                />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: CARD.bg,
                borderTopWidth: 1,
                borderTopColor: CARD.border,
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: CARD.text, fontSize: 16, fontWeight: "800" }}>{item.translit}</Text>
                <Text style={{ color: CARD.accent, fontSize: 18 }}>{item.ar}</Text>
              </View>
              <Text style={{ color: CARD.sub, marginTop: 4 }}>{item.meaning}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: CARD.sub, padding: 16 }}>Aucun résultat.</Text>
          }
          ListFooterComponent={
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <Text style={{ color: CARD.accent, fontWeight: "700" }}>© 2025 @yanis26x</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // 🔹 MODE 2: ScrollView SEUL (aucune VirtualizedList dedans)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Header />
        <Segmented />

        <View
          style={{
            backgroundColor: CARD.bg,
            borderColor: CARD.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
          }}
        >
          <Text style={{ color: CARD.text, fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
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
                borderBottomColor: CARD.border,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: CARD.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                <Text style={{ color: CARD.accent, fontWeight: "800" }}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: CARD.text, fontWeight: "800" }}>{s.title}</Text>
                <Text style={{ color: CARD.sub, marginTop: 2 }}>{s.desc}</Text>
              </View>
            </View>
          ))}

          <View style={{ marginTop: 12, gap: 8 }}>
            <Text style={{ color: CARD.sub, fontSize: 12 }}>
              ℹ️ Ce guide résume les bases pratiquées par la majorité des écoles. Pour les cas
              particuliers, réfère-toi à une source fiable.
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "center", marginTop: 16 }}>
          <Text style={{ color: CARD.accent, fontWeight: "700" }}>© 2025 @yanis26x</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
