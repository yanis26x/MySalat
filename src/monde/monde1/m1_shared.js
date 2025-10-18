import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

/* -------------------- CARD -------------------- */
export function Card({ THEME, children, style }) {
  return (
    <View
      style={[
        {
          position: "relative", // nécessaire pour positionner la signature
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

/* -------------------- PRIMARY BUTTON -------------------- */
export function PrimaryButton({ THEME, label, onPress, disabled }) {
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

/* -------------------- GHOST BUTTON -------------------- */
export function GhostButton({ THEME, label, onPress }) {
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

/* -------------------- SECTION -------------------- */
export function Section({ THEME, title, subtitle }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: THEME.text, fontSize: 22, fontWeight: "900" }}>
        {title}
      </Text>
      {!!subtitle && (
        <Text style={{ color: THEME.sub, marginTop: 4 }}>{subtitle}</Text>
      )}
    </View>
  );
}

/* -------------------- SIGNATURE (petit logo en haut à droite) -------------------- */
function SignatureMark() {
  return (
    <Image
      source={require("../../../assets/26xLogo.png")}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        width: 28,
        height: 28,
        borderRadius: 6,
        opacity: 0.95,
      }}
      resizeMode="contain"
    />
  );
}

/* -------------------- GAME OVER MODAL -------------------- */
export function GameOverModal({ THEME, visible, onQuit, reason, mock = false }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Card THEME={THEME} style={{ padding: 20 }}>
          {/* Signature en haut à droite */}
          <SignatureMark />

          <View style={{ alignItems: "center", gap: 10 }}>
            <Text
              style={{
                color: THEME.text,
                fontSize: 17,
                fontWeight: "900",
                textAlign: "center",
              }}
            >
              Serieux ?!
            </Text>
            <Text
              style={{ color: THEME.sub, textAlign: "center", marginTop: 6 }}
            >
              {mock ? "tes une honte !" : reason || "Une erreur s’est glissée."}
            </Text>
            <PrimaryButton THEME={THEME} label="Quitter" onPress={onQuit} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

/* -------------------- VICTORY LOADING MODAL -------------------- */
export function VictoryLoading({
  THEME,
  visible,
  title = "Terminé",
  subtitle = "Passe au prochain niveau maintenant",
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Card THEME={THEME} style={{ alignItems: "center", gap: 10, padding: 20 }}>
          {/* Signature en haut à droite */}
          <SignatureMark />

          <Text
            style={{
              color: THEME.text,
              fontSize: 20,
              fontWeight: "900",
              marginTop: 4,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
          <Text style={{ color: THEME.sub, textAlign: "center", marginTop: 4 }}>
            {subtitle}
          </Text>

          {/* barre de “chargement” */}
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
            <View
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: THEME.accent,
              }}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

/* -------------------- SKIP WITH CODE (fab) -------------------- */
export function SkipWithCodeFab({ THEME, onValid, code = "77" }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");

  return (
    <>
      {/* pastille flottante */}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          position: "absolute",
          right: 16,
          bottom: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: THEME.accent,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: THEME.accent,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 5,
        }}
      >
        <Ionicons name="key-outline" size={24} color="#fff" />
      </Pressable>

      {/* modal code */}
      <Modal visible={open} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Card THEME={THEME} style={{ gap: 12 }}>
            <SignatureMark />
            <Text
              style={{ color: THEME.text, fontWeight: "900", fontSize: 16 }}
            >
              Entrer le code pour passer
            </Text>
            <TextInput
              value={val}
              onChangeText={setVal}
              placeholder="Code"
              placeholderTextColor={THEME.sub}
              keyboardType="number-pad"
              secureTextEntry
              style={{
                backgroundColor: THEME.surface,
                borderColor: THEME.border,
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: THEME.text,
              }}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <GhostButton
                THEME={THEME}
                label="Annuler"
                onPress={() => {
                  setVal("");
                  setOpen(false);
                }}
              />
              <PrimaryButton
                THEME={THEME}
                label="Valider"
                onPress={() => {
                  if (val.trim() === code) {
                    setOpen(false);
                    setVal("");
                    onValid?.();
                  }
                }}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </>
  );
}
