// src/screens/QiblaScreen.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { qiblaBearing } from "../qibla";

const CARD = {
  bg: "#0B0B0F",
  text: "#FFFFFF",
  sub: "#9CA3AF",
  accent: "#3B82F6",
  border: "#1a1a1a",
  success: "#22c55e",
};

const ALIGN_TOLERANCE_DEG = 10;

export default function QiblaScreen() {
  const isFocused = useIsFocused(); // ✅ actif seulement quand l'écran est affiché

  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [qibla, setQibla] = useState(null);
  const [heading, setHeading] = useState(0);
  const [isFacingQibla, setIsFacingQibla] = useState(false);
  const [city, setCity] = useState("Unknown");

  const soundRef = useRef(null);
  const headingSubRef = useRef(null);
  const armedRef = useRef(false); // évite de jouer du son quand non focus
  const lastAlignedRef = useRef(false); // pour ne pas spam le son

  // Charge le son une fois
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
          require("../../assets/qibla-success.mp3")
        );
        if (mounted) soundRef.current = sound;
      } catch (e) {
        console.warn("Failed to load sound:", e);
      }
    })();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // (Re)montage des capteurs UNIQUEMENT quand l'écran est focus
  useEffect(() => {
    let cancelled = false;

    const setupAsync = async () => {
      if (!isFocused) {
        // 🔇 On désarme, on coupe le son, on enlève les subs
        armedRef.current = false;
        lastAlignedRef.current = false;
        setIsFacingQibla(false);
        headingSubRef.current?.remove?.();
        headingSubRef.current = null;
        return;
      }

      setLoading(true);
      try {
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== "granted") {
          if (!cancelled) {
            Alert.alert("Localisation requise", "Active la localisation pour calculer la Qibla.");
            setLoading(false);
          }
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });

        const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        const prettyCity =
          places.length > 0
            ? places[0].city || places[0].region || places[0].country || "Unknown"
            : "Unknown";
        setCity(prettyCity);

        const qb = qiblaBearing(lat, lon);
        setQibla(qb);

        // ✅ On arme la détection uniquement maintenant
        armedRef.current = true;

        // ✅ On s'abonne à la boussole uniquement quand focus
        headingSubRef.current = await Location.watchHeadingAsync((h) => {
          const hdg =
            typeof h.trueHeading === "number" && !Number.isNaN(h.trueHeading)
              ? h.trueHeading
              : typeof h.magHeading === "number"
              ? h.magHeading
              : 0;
          const norm = ((hdg % 360) + 360) % 360;
          setHeading(norm);
        });
      } catch (e) {
        console.error("Qibla init error:", e);
        if (!cancelled) Alert.alert("Erreur", "Impossible d'initialiser la boussole Qibla.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setupAsync();

    // Cleanup quand on quitte l'écran
    return () => {
      cancelled = true;
      armedRef.current = false;
      headingSubRef.current?.remove?.();
      headingSubRef.current = null;
      lastAlignedRef.current = false;
      setIsFacingQibla(false);
    };
  }, [isFocused]);

  // Détection alignement (ne s'active que si l'écran est focus & armé)
  useEffect(() => {
    if (!isFocused || !armedRef.current || qibla == null) return;

    const diff = Math.abs(((qibla - heading + 540) % 360) - 180);
    const aligned = diff < ALIGN_TOLERANCE_DEG;

    if (aligned && !lastAlignedRef.current) {
      lastAlignedRef.current = true;
      setIsFacingQibla(true);
      // 🔊 Joue le son une seule fois à l'alignement
      soundRef.current?.replayAsync().catch(() => {});
    } else if (!aligned && lastAlignedRef.current) {
      lastAlignedRef.current = false;
      setIsFacingQibla(false);
    }
  }, [heading, qibla, isFocused]);

  const arrowAngle = useMemo(
    () => (qibla != null ? (qibla - heading + 360) % 360 : 0),
    [qibla, heading]
  );

  if (loading) {
    return (
      <LinearGradient
        colors={["#0a2472", "#000000"]}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: CARD.sub, marginTop: 12 }}>Calibrating compass…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0a2472", "#000000"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20, flex: 1, alignItems: "center" }}>
          {/* Ville */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              borderColor: CARD.border,
              borderWidth: 1,
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 999,
              marginTop: 8,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: CARD.text, fontSize: 14, fontWeight: "700" }}>
              📍 {city}
            </Text>
          </View>

          <Text style={{ color: CARD.text, fontSize: 24, fontWeight: "800", marginBottom: 12 }}>
            Qibla direction
          </Text>

          {/* Boussole / Flèche */}
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: CARD.border,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 12,
                borderRightWidth: 12,
                borderBottomWidth: 70,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderBottomColor: isFacingQibla ? CARD.success : CARD.accent,
                transform: [{ rotate: `${arrowAngle}deg` }, { translateY: -10 }],
              }}
            />
          </View>

          <Text style={{ color: CARD.text, marginTop: 14, fontSize: 16 }}>
            {isFacingQibla
              ? "✅ You're facing the Qibla!"
              : qibla != null
              ? `Face toward: ${Math.round(qibla)}°`
              : "—"}
          </Text>
          {!isFacingQibla && (
            <Text style={{ color: CARD.sub, marginTop: 6, fontSize: 13, textAlign: "center" }}>
              Turn your phone until the arrow points up to face the Qibla.
            </Text>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
