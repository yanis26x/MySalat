import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme26x } from "../../themeContext";
import { PrimaryButton, SkipWithCodeFab } from "./m1_shared";
import { Audio } from "expo-av";

/** ===== Questions pool ===== */
const QUESTIONS_POOL = [
  {
    q: "Combien de prières obligatoires (salât) par jour ?",
    choices: ["3", "Ah c’est obligatoire ?!", "7", "5"],
    correct: 3,
    exp: "Il y a 5 prières : Fajr, Dhuhr, Asr, Maghrib et Isha.",
  },
  {
    q: "Quel mois est celui du jeûne obligatoire ?",
    choices: ["Muharram", "Ramadan", "Shawwâl", "Septembre"],
    correct: 1,
    exp: "Le jeûne obligatoire a lieu pendant le mois de Ramadan.",
  },
  {
    q: "Vers quelle direction prie-t-on (Qibla) ?",
    choices: ["Jérusalem", "Médine", "Elle part dans l’espace", "La Kaaba (La Mecque)"],
    correct: 3,
    exp: "La Qibla est dirigée vers la Kaaba, à La Mecque.",
  },
  {
    q: "Combien de piliers compte l’Islam ?",
    choices: ["3", "4", "5", "J’sais pas"],
    correct: 2,
    exp: "Les cinq piliers : Shahada, Salât, Zakât, Sawm et Hajj.",
  },
  {
    q: "Quel est le Livre sacré de l’Islam ?",
    choices: ["La Torah", "La Bible", "Le Coran", "Le One Piece"],
    correct: 2,
    exp: "Le Coran est la révélation divine transmise au Prophète ﷺ.",
  },
  {
    q: "Quel ange a transmis la révélation au Prophète Muhammad ﷺ ?",
    choices: ["Israfil", "Jibril", "Mikail", "Azraël"],
    correct: 1,
    exp: "L’ange Jibril (Gabriel) a transmis les révélations du Coran.",
  },
  {
    q: "Combien de rak‘as contient la prière du Fajr ?",
    choices: ["2", "Ça dépend de la météo", "4", "5"],
    correct: 0,
    exp: "La prière du Fajr contient 2 unités de prière (rak‘as).",
  },
  {
    q: "Quel est le premier pilier de l’Islam ?",
    choices: ["Le Hajj", "La Shahada", "La Zakât", "Au city, y’avait l’imam, il avait amené 4 mecs de la mosquée pour faire un five. Ca les appelait les 5 piliers de l’Islam."],
    correct: 1,
    exp: "La Shahada : attester qu’il n’y a de dieu qu’Allah et que Muhammad est Son messager.",
  },
  {
  q: "Quel prophète a survécu dans le ventre d’un poisson ?",
  choices: ["Younous (Jonas)", "Moussa (Moïse)", "Issa (Jésus)", "Pas de spoil stp"],
  correct: 0,
  exp: "Le prophète Younous (Jonas) a été avalé par un grand poisson avant d’être sauvé par Allah.",
},
{
  q: "Laquelle de ces salats n’existe pas ?",
  choices: ["Salat al-Fajr", "Salat al-Isha", "Salat al-Asr", "Salat el-Christmas"],
  correct: 3,
  exp: "Bassem !",
},
{
  q: "Que fait-on juste avant de commencer la prière ?",
  choices: ["On enlève ses chaussures", "On met son téléphone en mode avion", "On fait des pompes", "+++++++++++"],
  correct: 0,
  exp: "Avant la prière, on retire ses chaussures et on se purifie pour montrer du respect.",
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
          require("../../../assets/qibla-success.mp3")
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
