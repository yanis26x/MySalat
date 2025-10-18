// src/monde/m1.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTheme26x } from "../themeContext";
// (Optionnel) import { Audio } from "expo-av"; // pour sons game over

/* ------------------------- Constantes & Data ------------------------- */
const VICTORY_DELAY_MS = 5000; // faux chargement (5s)
const LEVELS = {
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
  L5: 5,
  FINAL: 6,
};

// Pool de QCM (on en prendra 10 au hasard)
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
    exp: "Le jeûne obligatoire a lieu pendant Ramadan.",
  },
  {
    q: "Vers quelle direction prie-t-on (Qibla) ?",
    choices: ["Jérusalem", "Médine", "La Kaaba (La Mecque)", "Damas"],
    correct: 2,
    exp: "La Qibla est dirigée vers la Kaaba.",
  },
  {
    q: "Combien de piliers de l’Islam ?",
    choices: ["3", "4", "5", "6"],
    correct: 2,
    exp: "Les 5 piliers : Shahada, Salât, Zakât, Sawm, Hajj.",
  },
  {
    q: "Quel est le Livre sacré de l’Islam ?",
    choices: ["La Torah", "La Bible", "Le Coran", "Les Hadiths"],
    correct: 2,
    exp: "Le Coran est la révélation au Prophète ﷺ.",
  },
  // ajoute autant que tu veux ici…
];

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

const PILLARS = [
  "Shahada",
  "Salât",
  "Zakât",
  "Sawm (Ramadan)",
  "Hajj",
];

/* ------------------------- Helpers ------------------------- */
function pickRandom(array, n) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ------------------------- UI Petits composants ------------------------- */
function Section({ THEME, title, subtitle }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: THEME.text, fontSize: 22, fontWeight: "900" }}>
        {title}
      </Text>
      {!!subtitle && <Text style={{ color: THEME.sub, marginTop: 4 }}>{subtitle}</Text>}
    </View>
  );
}

function Card({ THEME, children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: THEME.card,
          borderColor: THEME.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function PrimaryButton({ THEME, label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: disabled ? THEME.surface : THEME.accent,
        borderWidth: 1,
        borderColor: disabled ? THEME.border : THEME.accent,
      }}
    >
      <Text style={{ color: disabled ? THEME.sub : "#fff", fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function GhostButton({ THEME, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: THEME.surface,
        borderWidth: 1,
        borderColor: THEME.border,
      }}
    >
      <Text style={{ color: THEME.text, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------- Écrans d’état (modaux) ------------------------- */
function GameOverModal({ THEME, visible, onQuit, reason, mock = false }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 }}>
        <Card THEME={THEME} style={{ padding: 20 }}>
          <View style={{ alignItems: "center", gap: 8 }}>
            <Ionicons name="skull-outline" size={28} color={THEME.accent} />
            <Text style={{ color: THEME.text, fontSize: 22, fontWeight: "900" }}>Game Over</Text>
            <Text style={{ color: THEME.sub, textAlign: "center", marginTop: 6 }}>
              {mock ? "😂 Dommage… on se revoit au début !" : reason || "Une erreur s’est glissée."}
            </Text>
            <PrimaryButton THEME={THEME} label="Quitter" onPress={onQuit} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

function VictoryLoading({ THEME, visible, title = "Bravo !", subtitle = "Préparation du prochain niveau…" }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 20 }}>
        <Card THEME={THEME} style={{ alignItems: "center", gap: 8 }}>
          <Ionicons name="sparkles-outline" size={28} color={THEME.accent} />
          <Text style={{ color: THEME.text, fontSize: 20, fontWeight: "900" }}>{title}</Text>
          <Text style={{ color: THEME.sub, textAlign: "center", marginTop: 6 }}>
            {subtitle}
          </Text>
          <View
            style={{
              marginTop: 10,
              height: 8,
              width: "100%",
              backgroundColor: THEME.surface,
              borderRadius: 999,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: THEME.border,
            }}
          >
            <View style={{ width: "100%", height: "100%", backgroundColor: THEME.accent }} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

/* ------------------------- Monde 1 (logique) ------------------------- */
export default function M1() {
  const navigation = useNavigation();
  const { THEME } = useTheme26x();

  const [level, setLevel] = useState(LEVELS.L1);
  const [showOver, setShowOver] = useState(false);
  const [overReason, setOverReason] = useState("");
  const [overMock, setOverMock] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  /* ---------- L1 : QCM 10 questions (1 erreur = game over) ---------- */
  const l1Questions = useMemo(() => {
    const chosen = pickRandom(QUESTIONS_POOL, Math.min(10, QUESTIONS_POOL.length));
    return chosen.map((q, idx) => ({ ...q, id: "q" + idx }));
  }, []);
  const [l1Index, setL1Index] = useState(0);
  const [l1Selected, setL1Selected] = useState(null);
  const q = l1Questions[l1Index];

  function l1Validate() {
    if (l1Selected == null) return;
    if (l1Selected !== q.correct) {
      return triggerGameOver(q.exp);
    }
    // bonne réponse :
    if (l1Index + 1 >= l1Questions.length) {
      return nextLevel(LEVELS.L2, "Niveau 2 : Wudu — place les étapes dans l’ordre !");
    }
    setL1Index((i) => i + 1);
    setL1Selected(null);
  }

  /* ---------- L2 : Wudu ordre (sélection étape par étape) ---------- */
  const [l2Order, setL2Order] = useState(shuffle(WUDU_STEPS));
  const [l2Progress, setL2Progress] = useState(0); // index attendu
  function l2Pick(stepKey) {
    const expected = WUDU_STEPS[l2Progress].key;
    if (stepKey !== expected) return triggerGameOver("Ordre du wudu incorrect.");
    const next = l2Progress + 1;
    if (next >= WUDU_STEPS.length) {
      return nextLevel(LEVELS.L3, "Niveau 3 : pile ou face… 1/2 de chance !");
    }
    setL2Progress(next);
  }

  /* ---------- L3 : 1/2 chance ---------- */
  function l3Try() {
    const win = Math.random() < 0.5;
    if (!win) return triggerGameOver("Pas de chance cette fois !");
    return nextLevel(LEVELS.L4, "Niveau 4 : Réponds honnêtement (ou pas)…");
  }

  /* ---------- L4 : Oui/Non piégé ---------- */
  const L4_QS = [
    { text: "Est-ce que tu aimes le jeu ?", expect: "oui" },         // oui sinon game over
    { text: "Tu aimes vraiment ?!", expect: "oui" },                 // oui sinon game over
    { text: "C'est le meilleur jeu de ta vie ?", expect: "oui" },    // oui sinon game over
    { text: "Tu veux être mon ami(e) ?", expect: "non", final: true } // ici il faut dire NON pour gagner
  ];
  const [l4Index, setL4Index] = useState(0);

  function l4Answer(ans) {
    const cur = L4_QS[l4Index];
    const ok = ans === cur.expect;
    if (!ok) return triggerGameOver("Mauvaise réponse 😅");
    if (cur.final) {
      return nextLevel(LEVELS.L5, "Niveau 5 : Place les 5 piliers… vite !");
    }
    setL4Index((i) => i + 1);
  }

  /* ---------- L5 : Piliers avec timer ---------- */
  const [l5Shuffled, setL5Shuffled] = useState(shuffle(PILLARS));
  const [l5Progress, setL5Progress] = useState(0); // index attendu
  const [l5Time, setL5Time] = useState(12); // timer court pour stress
  const timerRef = useRef(null);

  useEffect(() => {
    if (level !== LEVELS.L5) return;
    timerRef.current && clearInterval(timerRef.current);
    setL5Time(12);
    timerRef.current = setInterval(() => {
      setL5Time((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          triggerGameOver("Trop lent ! Le temps est écoulé.");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [level]);

  function l5Pick(p) {
    const expected = PILLARS[l5Progress];
    if (p !== expected) {
      clearInterval(timerRef.current);
      return triggerGameOver("Mauvais ordre des piliers.");
    }
    const next = l5Progress + 1;
    if (next >= PILLARS.length) {
      clearInterval(timerRef.current);
      return nextLevel(LEVELS.FINAL, "FINAL-ROUND26x : 1/3 de chance… bonne chance !");
    }
    setL5Progress(next);
  }

  /* ---------- FINAL : 1/3 chance + code ---------- */
  const SECRET_CODE = "2626266";
  const [finalWin, setFinalWin] = useState(false);
  function finalTry() {
    const win = Math.random() < 1 / 3;
    if (!win) return triggerGameOver("😂 Ooops… à toi de retenter ta chance !");
    setFinalWin(true);
  }

  /* ---------- Utilitaires : next / over ---------- */
  function nextLevel(nextLvl, loadingText) {
    setLoadingNext(true);
    // petit faux écran de chargement
    setTimeout(() => {
      setLoadingNext(false);
      setLevel(nextLvl);
      // reset des sous-états associés :
      if (nextLvl === LEVELS.L2) {
        setL2Order(shuffle(WUDU_STEPS));
        setL2Progress(0);
      }
      if (nextLvl === LEVELS.L4) setL4Index(0);
      if (nextLvl === LEVELS.L5) {
        setL5Shuffled(shuffle(PILLARS));
        setL5Progress(0);
      }
    }, VICTORY_DELAY_MS);
  }

  function triggerGameOver(reason, mock = false) {
    setOverReason(reason || "");
    setOverMock(mock);
    setShowOver(true);
  }

  function quitToWorlds() {
    setShowOver(false);
    navigation.goBack(); // retour au sélecteur de mondes
  }

  /* ------------------------- Rendu UI ------------------------- */
  return (
    <LinearGradient colors={THEME.screenGradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
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

          <Text style={{ color: THEME.text, fontWeight: "800", fontSize: 16 }}>
            Monde 1 — Initiation
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Bandeau niveau */}
          <Card THEME={THEME} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="flag-outline" size={20} color={THEME.accent} />
            <Text style={{ color: THEME.text, fontWeight: "900" }}>
              {level === LEVELS.L1 && "Niveau 1 : QCM (10 questions)"}
              {level === LEVELS.L2 && "Niveau 2 : Wudu (ordre exact)"}
              {level === LEVELS.L3 && "Niveau 3 : 50/50"}
              {level === LEVELS.L4 && "Niveau 4 : Oui / Non"}
              {level === LEVELS.L5 && "Niveau 5 : 5 Piliers (timer)"}
              {level === LEVELS.FINAL && "FINAL-ROUND26x"}
            </Text>
          </Card>

          {/* L1 */}
          {level === LEVELS.L1 && (
            <>
              <Section
                THEME={THEME}
                title={`Question ${l1Index + 1} / ${l1Questions.length}`}
                subtitle="1 erreur = game over"
              />
              <Card THEME={THEME}>
                <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "800" }}>
                  {q.q}
                </Text>
              </Card>
              <View style={{ gap: 10 }}>
                {q.choices.map((c, i) => {
                  const selected = l1Selected === i;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => setL1Selected(i)}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        backgroundColor: selected ? THEME.accentSoft : THEME.card,
                        borderColor: selected ? THEME.accent : THEME.border,
                      }}
                    >
                      <Text style={{ color: THEME.text, fontWeight: "700", fontSize: 16 }}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <PrimaryButton
                THEME={THEME}
                label="Valider"
                onPress={l1Validate}
                disabled={l1Selected == null}
              />
            </>
          )}

          {/* L2 */}
          {level === LEVELS.L2 && (
            <>
              <Section THEME={THEME} title="Place les étapes du wudu dans l’ordre" subtitle="Appuie dans l’ordre exact" />
              <Card THEME={THEME}>
                <Text style={{ color: THEME.sub }}>
                  Étape attendue : <Text style={{ color: THEME.text, fontWeight: "900" }}>{WUDU_STEPS[l2Progress].label}</Text>
                </Text>
              </Card>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {l2Order.map((s) => (
                  <Pressable
                    key={s.key}
                    onPress={() => l2Pick(s.key)}
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
                    <Text style={{ color: THEME.text, fontWeight: "700" }}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* L3 */}
          {level === LEVELS.L3 && (
            <>
              <Section THEME={THEME} title="Pile ou face" subtitle="1 chance sur 2 de réussir" />
              <PrimaryButton THEME={THEME} label="Tenter ma chance" onPress={l3Try} />
              <GhostButton THEME={THEME} label="Abandonner" onPress={() => triggerGameOver("Abandon = game over.")} />
            </>
          )}

          {/* L4 */}
          {level === LEVELS.L4 && (
            <>
              <Section THEME={THEME} title={`Question ${l4Index + 1} / ${L4_QS.length}`} />
              <Card THEME={THEME}>
                <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "800" }}>
                  {L4_QS[l4Index].text}
                </Text>
              </Card>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <PrimaryButton THEME={THEME} label="Oui" onPress={() => l4Answer("oui")} />
                <GhostButton THEME={THEME} label="Non" onPress={() => l4Answer("non")} />
              </View>
            </>
          )}

          {/* L5 */}
          {level === LEVELS.L5 && (
            <>
              <Section THEME={THEME} title="Les 5 piliers de l’Islam" subtitle={`Temps restant : ${l5Time}s`} />
              <Card THEME={THEME}>
                <Text style={{ color: THEME.sub }}>
                  Pilier attendu :{" "}
                  <Text style={{ color: THEME.text, fontWeight: "900" }}>{PILLARS[l5Progress]}</Text>
                </Text>
              </Card>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {l5Shuffled.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => l5Pick(p)}
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
            </>
          )}

          {/* FINAL */}
          {level === LEVELS.FINAL && (
            <>
              <Section THEME={THEME} title="FINAL-ROUND26x" subtitle="1 chance sur 3 de gagner" />
              {!finalWin ? (
                <PrimaryButton THEME={THEME} label="Je tente ma chance" onPress={finalTry} />
              ) : (
                <Card THEME={THEME} style={{ alignItems: "center", gap: 8 }}>
                  <Ionicons name="ribbon-outline" size={26} color={THEME.accent} />
                  <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "900" }}>
                    Félicitations ! Tu as terminé le Monde 1.
                  </Text>
                  <Text style={{ color: THEME.sub, textAlign: "center" }}>
                    Garde ce code précieusement :{" "}
                    <Text style={{ color: THEME.text, fontWeight: "900" }}>{SECRET_CODE}</Text>
                  </Text>
                  <PrimaryButton THEME={THEME} label="Quitter" onPress={() => navigation.goBack()} />
                </Card>
              )}
            </>
          )}
        </ScrollView>

        {/* Modaux état */}
        <GameOverModal
          THEME={THEME}
          visible={showOver}
          onQuit={quitToWorlds}
          reason={overReason}
          mock={overMock}
        />
        <VictoryLoading
          THEME={THEME}
          visible={loadingNext}
          title="Bravo !"
          subtitle="Chargement du prochain niveau…"
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
