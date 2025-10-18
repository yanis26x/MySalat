import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme26x } from "../../themeContext";
import { PrimaryButton, SkipWithCodeFab } from "./m1_shared";
import { Audio } from "expo-av";

/** ===== Questions pool ===== */
const QUESTIONS_POOL = [
  {
    q: "Combien de prières obligatoires (salât) par jour ?",
    choices: ["3", "5", "7", "2"],
    correct: 1,
    exp: "Il y a 5 prières : Fajr, Dhuhr, Asr, Maghrib, Isha.",
  },
  {
    q: "Quel mois est celui du jeûne obligatoire ?",
    choices: ["Muharram", "Ramadan", "Shawwâl", "Dhou al-hijja"],
    correct: 1,
    exp: "Le jeûne obligatoire a lieu pendant le mois de Ramadan.",
  },
  {
    q: "Vers quelle direction prie-t-on (Qibla) ?",
    choices: ["Jérusalem", "Médine", "La Kaaba (La Mecque)", "Elle part dans l'espace"],
    correct: 2,
    exp: "La Qibla est dirigée vers la Kaaba, à La Mecque.",
  },
  {
    q: "Combien de piliers de l’Islam ?",
    choices: ["3", "4", "5", "6"],
    correct: 2,
    exp: "Shahada, Salât, Zakât, Sawm, Hajj.",
  },
  {
    q: "Quel est le Livre sacré de l’Islam ?",
    choices: ["La Torah", "La Bible", "Le Coran", "Le OnePiece"],
    correct: 2,
    exp: "Le Coran est la révélation au Prophète ﷺ.",
  },
];

/** Utils */
function pickRandom(array, n) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

export default function M1_Lvl1({ onWin, onGameOver }) {
  const { THEME } = useTheme26x();

  // 10 si tu as plus de 10 dans le pool
  const questions = useMemo(
    () => pickRandom(QUESTIONS_POOL, Math.min(10, QUESTIONS_POOL.length)),
    []
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const q = questions[index];

  /** ---------- SONS ---------- */
  const successRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          require("../../../assets/ha-ha.mp3")
        );
        if (mounted) successRef.current = sound;
        else sound.unloadAsync().catch(() => {});
      } catch (e) {
        console.warn("Erreur chargement son succès :", e);
      }
    })();
    return () => successRef.current?.unloadAsync().catch(() => {});
  }, []);

  async function validate() {
    if (selected == null) return;
    if (selected !== q.correct) {
      onGameOver?.(q.exp || "Mauvaise réponse.");
      return;
    }

    // ✅ bonne réponse → joue le son
    try {
      await successRef.current?.replayAsync();
    } catch {}

    if (index + 1 >= questions.length) {
      onWin?.(); // niveau terminé
      return;
    }

    // petit délai avant question suivante (pour entendre le son)
    setTimeout(() => {
      setIndex((i) => i + 1);
      setSelected(null);
    }, 500);
  }

  const progressPct = Math.round((index / questions.length) * 100);

  return (
    <View style={{ gap: 16 }}>
      {/* En-tête discret + barre de progression */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: THEME.sub, fontWeight: "700", fontSize: 12 }}>
            Question {index + 1}/{questions.length}
          </Text>
          <Text style={{ color: THEME.sub, fontWeight: "700", fontSize: 12 }}>
            {progressPct}%
          </Text>
        </View>
        <View
          style={{
            height: 8,
            borderRadius: 999,
            backgroundColor: THEME.surface,
            borderWidth: 1,
            borderColor: THEME.border,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progressPct}%`,
              height: "100%",
              backgroundColor: THEME.accent,
            }}
          />
        </View>
      </View>

      {/* Question principale */}
      <Text
        style={{
          color: THEME.text,
          fontSize: 18,
          fontWeight: "800",
          lineHeight: 24,
          marginBottom: 6,
        }}
      >
        {q.q}
      </Text>

      {/* Choix de réponse (cards opaques) */}
      <View style={{ gap: 8 }}>
        {q.choices.map((c, i) => {
          const isSelected = selected === i;
          return (
            <Pressable
              key={i}
              onPress={() => setSelected(i)}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: isSelected ? THEME.accent : THEME.border,
                backgroundColor: isSelected ? THEME.accentSoft : THEME.card,
              }}
            >
              <Text
                style={{
                  color: THEME.text,
                  fontWeight: "700",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                {c}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bouton valider */}
      <View style={{ marginTop: 10 }}>
        <PrimaryButton
          THEME={THEME}
          label="Valider"
          onPress={validate}
          disabled={selected == null}
        />
      </View>

      {/* Pastille “Passer (code)” */}
      <SkipWithCodeFab THEME={THEME} code="77" onValid={() => onWin?.()} />
    </View>
  );
}
