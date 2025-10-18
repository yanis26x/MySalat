// src/monde/monde1/m1_final.js
import React, { useState } from "react";
import { View, Text } from "react-native";
import { useTheme26x } from "../../themeContext";
import { Card, Section, PrimaryButton, SkipWithCodeFab } from "./m1_shared";

const SECRET_CODE = "2626266";

export default function M1_Final({ onWin, onGameOver }) {
  const { THEME } = useTheme26x();
  const [won, setWon] = useState(false);

  function tryLuck() {
    const win = Math.random() < 1 / 5;
    if (!win) {
      onGameOver?.("ahhahahaahahahahhaa!");
      return;
    }
    setWon(true);
  }

  return (
    <View style={{ gap: 12 }}>
      <Section THEME={THEME} title="FINAL-ROUND26x" subtitle="1 chance sur 3 de gagner" />

      {!won ? (
        <>
          <PrimaryButton THEME={THEME} label="Je tente ma chance" onPress={tryLuck} />
          <SkipWithCodeFab THEME={THEME} code="77" onValid={() => setWon(true)} />
        </>
      ) : (
        <Card THEME={THEME} style={{ alignItems: "center", gap: 8 }}>
          <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "900" }}>
            Félicitations ! Tu as terminé le Monde 1.
          </Text>
          <Text style={{ color: THEME.sub, textAlign: "center" }}>
            Garde ce code précieusement :{" "}
            <Text style={{ color: THEME.text, fontWeight: "900" }}>
              {SECRET_CODE}
            </Text>
          </Text>
          <PrimaryButton THEME={THEME} label="Quitter" onPress={() => onWin?.()} />
        </Card>
      )}
    </View>
  );
}
