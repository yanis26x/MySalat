// src/monde/monde1/m1_lvl3.js
import React from "react";
import { View } from "react-native";
import { useTheme26x } from "../../themeContext";
import { Section, PrimaryButton, GhostButton, SkipWithCodeFab } from "./m1_shared";

export default function M1_Lvl3({ onWin, onGameOver }) {
  const { THEME } = useTheme26x();

  function tryLuck() {
    const win = Math.random() < 0.5;
    if (!win) {
      onGameOver?.("Meme dans les jeux dhasard tes null, tes bon a quoi ?!");
      return;
    }
    onWin?.();
  }

  return (
    <View style={{ gap: 12 }}>
      <Section THEME={THEME} title="Pile ou face" subtitle="heyyyyyy" />
      <PrimaryButton THEME={THEME} label="Tenter" onPress={tryLuck} />
      <GhostButton THEME={THEME} label="Abandonner comme un lache" onPress={() => onGameOver?.("Abandon = Game Over.")} />

      <SkipWithCodeFab THEME={THEME} code="77" onValid={() => onWin?.()} />
    </View>
  );
}
