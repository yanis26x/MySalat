// src/monde/monde1/m1_lvl5.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme26x } from "../../themeContext";
import { Card, Section, SkipWithCodeFab } from "./m1_shared";

const PILLARS = ["Shahada", "Salât", "Zakât", "Sawm (Ramadan)", "Hajj"];

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function M1_Lvl5({ onWin, onGameOver }) {
  const { THEME } = useTheme26x();
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(12);
  const shuffled = useMemo(() => shuffle(PILLARS), []);
  const timerRef = useRef(null);
  const doneRef = useRef(false); // empêche les effets doublons

  // timer (stoppe quand onWin / gameOver)
  useEffect(() => {
    doneRef.current = false;
    setTime(12);
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (doneRef.current) return t; // déjà fini
        if (t <= 1) {
          clearInterval(timerRef.current);
          doneRef.current = true;
          onGameOver?.("Trop lent ! Le temps c'est de largent et toi ta aucun des deux.");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  function pick(p) {
    if (doneRef.current) return;
    const expected = PILLARS[progress];
    if (p !== expected) {
      doneRef.current = true;
      clearInterval(timerRef.current);
      onGameOver?.("Mauvais ordre des piliers.");
      return;
    }
    const next = progress + 1;
    if (next >= PILLARS.length) {
      doneRef.current = true;
      clearInterval(timerRef.current);
      onWin?.(); // succès -> faux écran charge côté parent
      return;
    }
    setProgress(next);
  }

  return (
    <View style={{ gap: 12 }}>
      <Section
        THEME={THEME}
        title="Les 5 piliers de l’Islam"
        subtitle={`Temps restant : ${time}s`}
      />
      {/* <Card THEME={THEME}>
        <Text style={{ color: THEME.sub }}>
          Pilier attendu :{" "}
          <Text style={{ color: THEME.text, fontWeight: "900" }}>
            {PILLARS[progress]}
          </Text>
        </Text>
      </Card> */}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {shuffled.map((p) => (
          <Pressable
            key={p}
            onPress={() => pick(p)}
            style={{
              width: "48%",
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: THEME.border,
              backgroundColor: THEME.card,
            }}
          >
            <Text style={{ color: THEME.text, fontWeight: "700" }}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <SkipWithCodeFab THEME={THEME} code="77" onValid={() => {
        // skip = réussite -> stopper proprement le timer
        if (!doneRef.current) {
          doneRef.current = true;
          clearInterval(timerRef.current);
        }
        onWin?.();
      }} />
    </View>
  );
}
