// src/monde/monde1/m1_lvl4.js
import React, { useState } from "react";
import { View, Text } from "react-native";
import { useTheme26x } from "../../themeContext";
import { Card, Section, PrimaryButton, GhostButton, SkipWithCodeFab } from "./m1_shared";

const QUESTIONS = [
  { text: "Est-ce que tu aimes le jeu ?", expect: "oui" },
  { text: "Tu aimes vraiment ?!", expect: "oui" },
  { text: "C'est le meilleur jeu de ta vie ?", expect: "oui" },
  { text: "Tu veux être mon ami(e) ?", expect: "non", final: true }, // il FAUT dire NON ici
];

export default function M1_Lvl4({ onWin, onGameOver }) {
  const { THEME } = useTheme26x();
  const [idx, setIdx] = useState(0);

  function answer(ans) {
    const cur = QUESTIONS[idx];
    const ok = ans === cur.expect;
    if (!ok) {
      onGameOver?.("Mdr ta pas damis ou quoi ? garde la peche");
      return;
    }
    if (cur.final) {
      onWin?.();
      return;
    }
    setIdx((i) => i + 1);
  }

  return (
    <View style={{ gap: 16 }}>
      <Section THEME={THEME} title={`Question ${idx + 1} / ${QUESTIONS.length}`} />
      <Card THEME={THEME}>
        <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "800", textAlign: "center" }}>
          {QUESTIONS[idx].text}
        </Text>
      </Card>

      {/* ✅ Boutons bien répartis */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <PrimaryButton THEME={THEME} label="Oui" onPress={() => answer("oui")} />
        </View>
        <View style={{ flex: 1 }}>
          <GhostButton THEME={THEME} label="Non" onPress={() => answer("non")} />
        </View>
      </View>

      <SkipWithCodeFab THEME={THEME} code="77" onValid={() => onWin?.()} />
    </View>
  );
}
