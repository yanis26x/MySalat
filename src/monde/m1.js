import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTheme26x } from "../themeContext";
import { Audio } from "expo-av";

import { GameOverModal, VictoryLoading } from "./monde1/m1_shared";
import L1 from "./monde1/m1_lvl1";
import L2 from "./monde1/m1_lvl2";
import L3 from "./monde1/m1_lvl3";
import L4 from "./monde1/m1_lvl4";
import L5 from "./monde1/m1_lvl5";
import LFinal from "./monde1/m1_final";

export const LEVELS = { L1: 1, L2: 2, L3: 3, L4: 4, L5: 5, FINAL: 6 };
const VICTORY_DELAY_MS = 5000;
const SECRET_CODE = "2626266";

export default function M1() {
  const navigation = useNavigation();
  const { THEME } = useTheme26x();

  const [level, setLevel] = useState(LEVELS.L1);
  const [showOver, setShowOver] = useState(false);
  const [overReason, setOverReason] = useState("");
  const [overMock, setOverMock] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  // 🎵 Audio refs
  const gameOverSoundRef = useRef(null);
  const victorySoundRef = useRef(null);

  // 🔊 Chargement des sons
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
        const { sound: over } = await Audio.Sound.createAsync(
          require("../../assets/evil_laugh4.mp3")
        );
        const { sound: win } = await Audio.Sound.createAsync(
          require("../../assets/ha-ha.mp3")
        );
        if (mounted) {
          gameOverSoundRef.current = over;
          victorySoundRef.current = win;
        } else {
          over.unloadAsync().catch(() => {});
          win.unloadAsync().catch(() => {});
        }
      } catch (e) {
        console.warn("Audio load error:", e);
      }
    })();
    return () => {
      gameOverSoundRef.current?.unloadAsync().catch(() => {});
      victorySoundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // 💀 Joue le son Game Over quand affiché
  useEffect(() => {
    if (showOver) gameOverSoundRef.current?.replayAsync().catch(() => {});
  }, [showOver]);

  // 🔥 Helpers
  function triggerGameOver(reason, mock = false) {
    setOverReason(reason || "");
    setOverMock(mock);
    setShowOver(true);
  }
  function quitToWorlds() {
    setShowOver(false);
    navigation.goBack();
  }

  function nextLevel(nextLvl) {
    victorySoundRef.current?.replayAsync().catch(() => {});
    setLoadingNext(true);
    setTimeout(() => {
      setLoadingNext(false);
      setLevel(nextLvl);
    }, VICTORY_DELAY_MS);
  }

  // 🔖 Fonction pour le titre du niveau
  function getLevelTitle(level) {
    switch (level) {
      case LEVELS.L1:
        return "Niveau 1 : QCM";
      case LEVELS.L2:
        return "Niveau 2 : Wudu";
      case LEVELS.L3:
        return "Niveau 3 : 50/50";
      case LEVELS.L4:
        return "Niveau 4 : ?!?!";
      case LEVELS.L5:
        return "Niveau 5 : go!";
      case LEVELS.FINAL:
        return "FINAL-ROUND26x";
      default:
        return "";
    }
  }

  // 🧩 UI principale
  return (
    <LinearGradient colors={THEME.screenGradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* --- Header --- */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 4,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: THEME.card,
              borderWidth: 1,
              borderColor: THEME.border,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={THEME.text} />
          </Pressable>

          <Text style={{ color: THEME.text, fontWeight: "800", fontSize: 14 }}>
            @yanis26x
          </Text>

          <View style={{ width: 40 }} />
        </View>

        {/* --- Contenu principal --- */}
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ Titre du niveau sans card */}
          <View
            style={{
              paddingHorizontal: 2,
              marginBottom: 4,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="flag-outline" size={18} color={THEME.accent} />
            <Text
              style={{
                color: THEME.text,
                fontSize: 16,
                fontWeight: "900",
              }}
            >
              {getLevelTitle(level)}
            </Text>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: THEME.border,
              marginBottom: 8,
            }}
          />

          {/* --- Niveaux --- */}
          {level === LEVELS.L1 && (
            <L1
              THEME={THEME}
              onGameOver={triggerGameOver}
              onWin={() => nextLevel(LEVELS.L2)}
            />
          )}
          {level === LEVELS.L2 && (
            <L2
              THEME={THEME}
              onGameOver={triggerGameOver}
              onWin={() => nextLevel(LEVELS.L3)}
            />
          )}
          {level === LEVELS.L3 && (
            <L3
              THEME={THEME}
              onGameOver={triggerGameOver}
              onWin={() => nextLevel(LEVELS.L4)}
            />
          )}
          {level === LEVELS.L4 && (
            <L4
              THEME={THEME}
              onGameOver={triggerGameOver}
              onWin={() => nextLevel(LEVELS.L5)}
            />
          )}
          {level === LEVELS.L5 && (
            <L5
              THEME={THEME}
              onGameOver={triggerGameOver}
              onWin={() => nextLevel(LEVELS.FINAL)}
            />
          )}
          {level === LEVELS.FINAL && (
            <LFinal
              THEME={THEME}
              secretCode={SECRET_CODE}
              onQuit={() => navigation.goBack()}
              onGameOver={triggerGameOver}
            />
          )}
        </ScrollView>

        {/* --- Modaux --- */}
        <GameOverModal
          THEME={THEME}
          visible={showOver}
          onQuit={quitToWorlds}
          reason={overReason}
          mock={overMock}
        />
        <VictoryLoading THEME={THEME} visible={loadingNext} />
      </SafeAreaView>
    </LinearGradient>
  );
}
