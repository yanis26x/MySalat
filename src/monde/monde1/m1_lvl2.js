// src/monde/monde1/m1_lvl2.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme26x } from "../../themeContext";
import { Section, SkipWithCodeFab } from "./m1_shared";
import { Audio } from "expo-av";

const WUDU_STEPS = [
  { key: "niyya", label: "Intention (Niyya)" },
  { key: "hands", label: "Laver les mains" },
  { key: "mouth", label: "Rincer la bouche" },
  { key: "nose", label: "Rincer le nez" },
  { key: "face", label: "Laver le visage" },
  { key: "arms", label: "Avant-bras (jusqu’aux coudes)" },
  { key: "head", label: "Passer les mains sur la tête" },
  { key: "ears", label: "Oreilles" },
  { key: "feet", label: "Pieds (chevilles incluses)" },
];

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function M1_Lvl2({ onWin, onGameOver }) {
  const { THEME } = useTheme26x();

  // ordre attendu
  const [progress, setProgress] = useState(0);

  // options affichées (on va les retirer au fur et à mesure)
  const initial = useMemo(() => shuffle(WUDU_STEPS), []);
  const [choices, setChoices] = useState(initial);

  // son "bonne étape"
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
        console.warn("load success sound failed:", e);
      }
    })();
    return () => {
      successRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  async function pick(stepKey) {
    const expect = WUDU_STEPS[progress].key;

    if (stepKey !== expect) {
      onGameOver?.("Ordre du wudu incorrect.");
      return;
    }

    // ✅ bon choix : son + supprimer la pastille
    try {
      await successRef.current?.replayAsync();
    } catch {}

    setChoices((prev) => prev.filter((c) => c.key !== stepKey));

    const next = progress + 1;
    if (next >= WUDU_STEPS.length) {
      onWin?.();
      return;
    }
    setProgress(next);
  }

  return (
    <View style={{ gap: 12 }}>
      <Section
        THEME={THEME}
        title="Place les étapes du wudu dans l’ordre"
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {choices.map((s) => (
          <Pressable
            key={s.key}
            onPress={() => pick(s.key)}
            style={{
              width: "48%",
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: THEME.border,
              backgroundColor: THEME.card, // non transparent
            }}
          >
            <Text style={{ color: THEME.text, fontWeight: "700" }}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Pastille pour passer avec code */}
      <SkipWithCodeFab THEME={THEME} code="77" onValid={() => onWin?.()} />
    </View>
  );
}
