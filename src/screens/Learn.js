// src/screens/HowTo.js
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
  Share,
  Modal,
  SafeAreaView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme26x } from "../themeContext";

/* ---------------- Asma ul Husna (extrait – colle la liste complète si tu veux les 99) ---------------- */
const ASMA_UL_HUSNA = [
  { id: 1,  ar: "ٱللَّٰه", translit: "Allah", meaning: "The Proper Name of God" },
  { id: 2,  ar: "الرَّحْمَٰن", translit: "Ar-Raḥmān", meaning: "The Entirely Merciful" },
  { id: 3,  ar: "الرَّحِيم", translit: "Ar-Raḥīm", meaning: "The Especially Merciful" },
  { id: 4,  ar: "الْمَلِك", translit: "Al-Malik", meaning: "The Sovereign" },
  { id: 5,  ar: "الْقُدُّوس", translit: "Al-Quddūs", meaning: "The Most Sacred" },
  { id: 6,  ar: "السَّلَام", translit: "As-Salām", meaning: "The Source of Peace" },
  { id: 7,  ar: "الْمُؤْمِن", translit: "Al-Mu’min", meaning: "The Giver of Security" },
  { id: 8,  ar: "الْمُهَيْمِن", translit: "Al-Muhaymin", meaning: "The Protector" },
  { id: 9,  ar: "الْعَزِيز", translit: "Al-‘Azīz", meaning: "The Almighty" },
  { id: 10, ar: "الْجَبَّار", translit: "Al-Jabbār", meaning: "The Compeller" },
  { id: 11, ar: "الْمُتَكَبِّر", translit: "Al-Mutakabbir", meaning: "The Supreme in Greatness" },
  { id: 12, ar: "الْخَالِق", translit: "Al-Khāliq", meaning: "The Creator" },
  { id: 13, ar: "الْبَارِئ", translit: "Al-Bāri’", meaning: "The Evolver" },
  { id: 14, ar: "الْمُصَوِّر", translit: "Al-Muṣawwir", meaning: "The Fashioner" },
  { id: 15, ar: "الْغَفَّار", translit: "Al-Ghaffār", meaning: "The Ever-Forgiving" },
  { id: 16, ar: "الْقَهَّار", translit: "Al-Qahhār", meaning: "The Subduer" },
  { id: 17, ar: "الْوَهَّاب", translit: "Al-Wahhāb", meaning: "The Bestower" },
  { id: 18, ar: "الرَّزَّاق", translit: "Ar-Razzāq", meaning: "The Provider" },
  { id: 19, ar: "الْفَتَّاح", translit: "Al-Fattāḥ", meaning: "The Opener" },
  { id: 20, ar: "اَلْعَلِيم", translit: "Al-‘Alīm", meaning: "The All-Knowing" },
  { id: 21, ar: "الْقَابِض", translit: "Al-Qābiḍ", meaning: "The Withholder" },
  { id: 22, ar: "الْبَاسِط", translit: "Al-Bāsiṭ", meaning: "The Expander" },
  { id: 23, ar: "الْخَافِض", translit: "Al-Khāfiḍ", meaning: "The Abaser" },
  { id: 24, ar: "الرَّافِع", translit: "Ar-Rāfi‘", meaning: "The Exalter" },
  { id: 25, ar: "الْمُعِزّ", translit: "Al-Mu‘izz", meaning: "The Honorer" },
  { id: 26, ar: "الْمُذِلّ", translit: "Al-Mudhill", meaning: "The Dishonorer" },
  { id: 27, ar: "السَّمِيع", translit: "As-Samī‘", meaning: "The All-Hearing" },
  { id: 28, ar: "الْبَصِير", translit: "Al-Baṣīr", meaning: "The All-Seeing" },
  { id: 29, ar: "الْحَكَم", translit: "Al-Ḥakam", meaning: "The Judge" },
  { id: 30, ar: "الْعَدْل", translit: "Al-‘Adl", meaning: "The Just" },
  { id: 31, ar: "اللَّطِيف", translit: "Al-Laṭīf", meaning: "The Subtle One" },
  { id: 32, ar: "الْخَبِير", translit: "Al-Khabīr", meaning: "The All-Aware" },
  { id: 33, ar: "الْحَلِيم", translit: "Al-Ḥalīm", meaning: "The Forbearing" },
  { id: 34, ar: "الْعَظِيم", translit: "Al-‘Aẓīm", meaning: "The Magnificent" },
  { id: 35, ar: "الْغَفُور", translit: "Al-Ghafūr", meaning: "The Forgiving" },
  { id: 36, ar: "الشَّكُور", translit: "Ash-Shakūr", meaning: "The Appreciative" },
  { id: 37, ar: "الْعَلِيّ", translit: "Al-‘Aliyy", meaning: "The Most High" },
  { id: 38, ar: "الْكَبِير", translit: "Al-Kabīr", meaning: "The Most Great" },
  { id: 39, ar: "الْحَفِيظ", translit: "Al-Ḥafīẓ", meaning: "The Preserver" },
  { id: 40, ar: "المُقيِت", translit: "Al-Muqīt", meaning: "The Sustainer" },
  { id: 41, ar: "الْحسِيب", translit: "Al-Ḥasīb", meaning: "The Reckoner" },
  { id: 42, ar: "الْجَلِيل", translit: "Al-Jalīl", meaning: "The Majestic" },
  { id: 43, ar: "الْكَرِيم", translit: "Al-Karīm", meaning: "The Generous" },
  { id: 44, ar: "الرَّقِيب", translit: "Ar-Raqīb", meaning: "The Watchful" },
  { id: 45, ar: "الْمُجِيب", translit: "Al-Mujīb", meaning: "The Responsive" },
  { id: 46, ar: "الْوَاسِع", translit: "Al-Wāsi‘", meaning: "The All-Encompassing" },
  { id: 47, ar: "الْحَكِيم", translit: "Al-Ḥakīm", meaning: "The Wise" },
  { id: 48, ar: "الْوَدُود", translit: "Al-Wadūd", meaning: "The Loving" },
  { id: 49, ar: "الْمَجِيد", translit: "Al-Majīd", meaning: "The Glorious" },
  { id: 50, ar: "الْبَاعِث", translit: "Al-Bā‘ith", meaning: "The Resurrector" },
  { id: 51, ar: "الشَّهِيد", translit: "Ash-Shahīd", meaning: "The Witness" },
  { id: 52, ar: "الْحَقّ", translit: "Al-Ḥaqq", meaning: "The Truth" },
  { id: 53, ar: "الْوَكِيل", translit: "Al-Wakīl", meaning: "The Trustee" },
  { id: 54, ar: "الْقَوِيّ", translit: "Al-Qawiyy", meaning: "The Most Strong" },
  { id: 55, ar: "الْمَتِين", translit: "Al-Matīn", meaning: "The Firm" },
  { id: 56, ar: "الْوَلِيّ", translit: "Al-Waliyy", meaning: "The Protector" },
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
  { id: 67, ar: "الْوَاحِد", translit: "Al-Wāḥid", meaning: "The One" },
  { id: 68, ar: "اَلاَحَد", translit: "Al-Aḥad", meaning: "The Unique" },
  { id: 69, ar: "الصَّمَد", translit: "As-Ṣamad", meaning: "The Eternal" },
  { id: 70, ar: "الْقَادِر", translit: "Al-Qādir", meaning: "The Able" },
  { id: 71, ar: "الْمُقْتَدِر", translit: "Al-Muqtadir", meaning: "The Powerful" },
  { id: 72, ar: "الْمُقَدِّم", translit: "Al-Muqaddim", meaning: "The Expediter" },
  { id: 73, ar: "الْمُؤَخِّر", translit: "Al-Mu’akhkhir", meaning: "The Delayer" },
  { id: 74, ar: "الأوَّل", translit: "Al-Awwal", meaning: "The First" },
  { id: 75, ar: "الآخِر", translit: "Al-Ākhir", meaning: "The Last" },
  { id: 76, ar: "الظَّاهِر", translit: "Az-Ẓāhir", meaning: "The Manifest" },
  { id: 77, ar: "الْبَاطِن", translit: "Al-Bāṭin", meaning: "The Hidden" },
  { id: 78, ar: "الْوَالِي", translit: "Al-Wālī", meaning: "The Governor" },
  { id: 79, ar: "الْمُتَعَالِي", translit: "Al-Muta‘ālī", meaning: "The Exalted" },
  { id: 80, ar: "الْبَرّ", translit: "Al-Barr", meaning: "The Source of Goodness" },
  { id: 81, ar: "التَّوَّاب", translit: "At-Tawwāb", meaning: "The Accepter of Repentance" },
  { id: 82, ar: "الْمُنْتَقِم", translit: "Al-Muntaqim", meaning: "The Avenger" },
  { id: 83, ar: "العَفُوّ", translit: "Al-‘Afuww", meaning: "The Pardoner" },
  { id: 84, ar: "الرَّؤُوف", translit: "Ar-Ra’ūf", meaning: "The Compassionate" },
  { id: 85, ar: "مَالِكُ الْمُلْك", translit: "Mālik-ul-Mulk", meaning: "The Owner of Dominion" },
  { id: 86, ar: "ذُوالْجَلاَلِ وَالإكْرَام", translit: "Dhū-l-Jalāl wa-l-Ikrām", meaning: "Lord of Majesty and Honor" },
  { id: 87, ar: "الْمُقْسِط", translit: "Al-Muqsiṭ", meaning: "The Equitable" },
  { id: 88, ar: "الْجَامِع", translit: "Al-Jāmi‘", meaning: "The Gatherer" },
  { id: 89, ar: "الْغَنِيّ", translit: "Al-Ghaniyy", meaning: "The Self-Sufficient" },
  { id: 90, ar: "الْمُغْنِي", translit: "Al-Mughnī", meaning: "The Enricher" },
  { id: 91, ar: "اَلْمَانِع", translit: "Al-Māni‘", meaning: "The Preventer" },
  { id: 92, ar: "الضَّار", translit: "Aḍ-Ḍārr", meaning: "The Distresser" },
  { id: 93, ar: "النَّافِع", translit: "An-Nāfi‘", meaning: "The Benefactor" },
  { id: 94, ar: "النُّور", translit: "An-Nūr", meaning: "The Light" },
  { id: 95, ar: "الْهَادِي", translit: "Al-Hādī", meaning: "The Guide" },
  { id: 96, ar: "الْبَدِيع", translit: "Al-Badī‘", meaning: "The Incomparable" },
  { id: 97, ar: "اَلْبَاقِي", translit: "Al-Bāqī", meaning: "The Everlasting" },
  { id: 98, ar: "الْوَارِث", translit: "Al-Wārith", meaning: "The Inheritor" },
  { id: 99, ar: "الرَّشِيد", translit: "Ar-Rashīd", meaning: "The Guide to the Right Path" },
];

/* ---------------- Wudu steps (grosses cartes) ---------------- */
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
  { id: "morning", ar: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", tr: "Allahumma bika aṣbaḥnā wa bika amsaynā wa bika naḥyā wa bika namūtu wa ilayka-n-nushūr.", fr: "Ô Allah, par Toi nous parvenons au matin et au soir, par Toi nous vivons et mourons, et vers Toi est la résurrection.", ctx: "Dhikr du matin/soir", src: "Tirmidhi" },
  { id: "sleep",   ar: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", tr: "Bismika Allahumma amūtu wa aḥyā.", fr: "En Ton nom, ô Allah, je meurs et je vis.", ctx: "Avant de dormir", src: "Bukhari" },
  { id: "travel",  ar: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ", tr: "Subḥāna-lladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn wa innā ilā rabbinā lamunqalibūn.", fr: "Gloire à Celui qui a soumis ceci à nous… et nous retournerons vers notre Seigneur.", ctx: "Dua du voyage", src: "Muslim" },
  { id: "knowledge", ar: "رَبِّ زِدْنِي عِلْمًا", tr: "Rabbi zidnī ‘ilmā.", fr: "Seigneur, augmente-moi en science.", ctx: "Avant l’étude", src: "Qur’ān 20:114" },
  { id: "forgiveness", ar: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا...", tr: "Rabbana ẓalamnā anfusanā…", fr: "Seigneur, nous nous sommes fait du tort…", ctx: "Repentir (Adam)", src: "Qur’ān 7:23" },
  { id: "parents", ar: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", tr: "Rabbi irḥamhumā kamā rabbayānī ṣaghīrā.", fr: "Seigneur, fais-leur miséricorde comme ils m’ont élevé petit.", ctx: "Dua pour les parents", src: "Qur’ān 17:24" },
  { id: "hearts", ar: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", tr: "Yā muqalliba-l-qulūb, thabbit qalbī ‘alā dīnik.", fr: "Ô Toi qui tournes les cœurs, affermis mon cœur sur Ta religion.", ctx: "Fermeté du cœur", src: "Tirmidhi" },
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

/* ---------------- Nouveau UI : SectionPicker (chips + modale grille) ---------------- */
function SectionPicker({ mode, setMode, THEME, options }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter((o) => o.label.toLowerCase().includes(s));
  }, [q, options]);

  const head = options.slice(0, 5);

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Chips défilantes */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
        style={{
          backgroundColor: THEME.card,
          borderWidth: 1,
          borderColor: THEME.border,
          borderRadius: 16,
          paddingVertical: 8,
          paddingHorizontal: 8,
        }}
      >

                {/* Bouton “Tout voir” */}
        <Chip
          label="Tout voir"
          icon="grid-outline"
          THEME={THEME}
          onPress={() => setOpen(true)}
        />
        
        {head.map((opt) => (
          <Chip
            key={opt.key}
            active={mode === opt.key}
            label={opt.label}
            icon={opt.icon}
            THEME={THEME}
            onPress={() => setMode(opt.key)}
          />
        ))}

        {/* Bouton “Tout voir” */}
        <Chip
          label="Tout voir"
          icon="grid-outline"
          THEME={THEME}
          onPress={() => setOpen(true)}
        />
      </ScrollView>

      {/* Hint du mode actif */}
      <Text style={{ marginTop: 10, color: THEME.sub, fontSize: 12 }}>
        Section actuelle :{" "}
        <Text style={{ color: THEME.text, fontWeight: "700" }}>
          {options.find((o) => o.key === mode)?.label ?? "—"}
        </Text>
      </Text>

      {/* Modale grille */}
      <Modal visible={open} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <SafeAreaView
            style={{
              backgroundColor: THEME.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              borderTopWidth: 1,
              borderColor: THEME.border,
              maxHeight: "80%",
              gap: 12,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "800" }}>
                Choisir une section
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                style={{
                  padding: 8,
                  borderRadius: 999,
                  backgroundColor: THEME.bg,
                  borderWidth: 1,
                  borderColor: THEME.border,
                }}
              >
                <Ionicons name="close" size={18} color={THEME.sub} />
              </Pressable>
            </View>

            {/* Recherche */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: THEME.bg,
                borderWidth: 1,
                borderColor: THEME.border,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Ionicons name="search" size={16} color={THEME.sub} />
              <TextInput
                placeholder="Rechercher une section…"
                placeholderTextColor={THEME.sub}
                value={q}
                onChangeText={setQ}
                style={{ color: THEME.text, flex: 1 }}
              />
              {q.length > 0 && (
                <Pressable onPress={() => setQ("")}>
                  <Ionicons name="close-circle" size={16} color={THEME.sub} />
                </Pressable>
              )}
            </View>

            {/* Grille (2 colonnes) */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.key}
              numColumns={2}
              columnWrapperStyle={{ gap: 12 }}
              contentContainerStyle={{ paddingBottom: 12, gap: 12 }}
              renderItem={({ item }) => (
                <Tile
                  label={item.label}
                  icon={item.icon}
                  active={mode === item.key}
                  THEME={THEME}
                  onPress={() => {
                    setMode(item.key);
                    setOpen(false);
                  }}
                />
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

function Chip({ label, icon, onPress, active, THEME }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "transparent" }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? THEME.accent : THEME.bg,
        borderWidth: 1,
        borderColor: active ? THEME.accent : THEME.border,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon ? <Ionicons name={icon} size={14} color={active ? "#fff" : THEME.sub} /> : null}
      <Text style={{ color: active ? "#fff" : THEME.sub, fontWeight: "700", fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Tile({ label, icon = "ellipse-outline", active, onPress, THEME }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "transparent" }}
      style={{
        flex: 1,
        minHeight: 90,
        backgroundColor: active ? THEME.accent : THEME.bg,
        borderWidth: 1,
        borderColor: active ? THEME.accent : THEME.border,
        borderRadius: 16,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={22} color={active ? "#fff" : THEME.sub} />
      <Text style={{ color: active ? "#fff" : THEME.text, textAlign: "center", fontWeight: "700", fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------------- Écran principal ---------------- */
export default function HowToScreen({ route }) {
  const { THEME } = useTheme26x();

  // mode initial
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

  /* --------- Header --------- */
  const Header = () => (
    <View style={{ alignItems: "center", marginBottom: 12 }}>
      <Text style={{ color: THEME.text, fontSize: 26, fontWeight: "800" }}>Learn</Text>
      <Text style={{ color: THEME.sub, marginTop: 4 }}>Fait glisser pour voir sections</Text>
    </View>
  );

  /* --------- Options de la SectionPicker --------- */
  const OPTIONS = [
    { key: "names",   label: "99 Noms d’Allah",  icon: "sparkles-outline" },
    { key: "wudu",    label: "Ablutions (Wudu)", icon: "water-outline" },
    { key: "dua",     label: "Dua du jour",      icon: "sunny-outline" },
    { key: "pillars", label: "5 Piliers",        icon: "albums-outline" },
    // ➕ tu peux en ajouter plein d’autres ici
  ];

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
              <SectionPicker mode={mode} setMode={setMode} THEME={THEME} options={OPTIONS} />
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
          ListEmptyComponent={<Text style={{ color: THEME.sub, padding: 16 }}>Aucun résultat.</Text>}
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
          <SectionPicker mode={mode} setMode={setMode} THEME={THEME} options={OPTIONS} />

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
                  <Text style={{ color: THEME.accent, fontWeight: "900", fontSize: 16 }}>{idx + 1}</Text>
                </View>

                {/* contenu */}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: THEME.text, fontWeight: "900", fontSize: 16 }}>{s.title}</Text>
                  <Text style={{ color: THEME.sub, marginTop: 6, lineHeight: 20, fontSize: 14 }}>{s.desc}</Text>
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
          <SectionPicker mode={mode} setMode={setMode} THEME={THEME} options={OPTIONS} />

          {/* Carte gradient Dua du jour */}
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
     MODE 4: PILIERS (ScrollView)
     ======================= */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.appBg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 44 }}>
        <Header />
        <SectionPicker mode={mode} setMode={setMode} THEME={THEME} options={OPTIONS} />

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
