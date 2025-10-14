// src/screens/QiblaScreen.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { qiblaBearing } from "../qibla";
import { useTheme26x } from "../themeContext";

const ALIGN_TOLERANCE_DEG = 10;

export default function QiblaScreen() {
  const isFocused = useIsFocused();
  const { THEME } = useTheme26x();

  const [loading, setLoading] = useState(true);
  const [qibla, setQibla] = useState(null);
  const [heading, setHeading] = useState(0);
  const [isFacingQibla, setIsFacingQibla] = useState(false);
  const [city, setCity] = useState("Unknown");

  const soundRef = useRef(null);
  const headingSubRef = useRef(null);
  const armedRef = useRef(false);
  const lastAlignedRef = useRef(false);

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
        const { sound } = await Audio.Sound.createAsync(require("../../assets/qibla-success.mp3"));
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

  // (Re)montage des capteurs uniquement quand l'écran est focus
  useEffect(() => {
    let cancelled = false;

    const setupAsync = async () => {
      if (!isFocused) {
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

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        const prettyCity =
          places.length > 0
            ? places[0].city || places[0].region || places[0].country || "Unknown"
            : "Unknown";
        setCity(prettyCity);

        const qb = qiblaBearing(lat, lon);
        setQibla(qb);

        armedRef.current = true;
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

    return () => {
      cancelled = true;
      armedRef.current = false;
      headingSubRef.current?.remove?.();
      headingSubRef.current = null;
      lastAlignedRef.current = false;
      setIsFacingQibla(false);
    };
  }, [isFocused]);

  // Détection alignement
  useEffect(() => {
    if (!isFocused || !armedRef.current || qibla == null) return;

    const diff = Math.abs(((qibla - heading + 540) % 360) - 180);
    const aligned = diff < ALIGN_TOLERANCE_DEG;

    if (aligned && !lastAlignedRef.current) {
      lastAlignedRef.current = true;
      setIsFacingQibla(true);
      soundRef.current?.replayAsync().catch(() => {});
    } else if (!aligned && lastAlignedRef.current) {
      lastAlignedRef.current = false;
      setIsFacingQibla(false);
    }
  }, [heading, qibla, isFocused]);

  const arrowAngle = useMemo(() => (qibla != null ? (qibla - heading + 360) % 360 : 0), [qibla, heading]);

  if (loading) {
    return (
      <LinearGradient colors={THEME.screenGradient} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={THEME.accent} />
        <Text style={{ color: THEME.sub, marginTop: 12 }}>Calibrating compass…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={THEME.screenGradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20, flex: 1, alignItems: "center" }}>
          {/* Ville */}
          <View
            style={{
              backgroundColor: THEME.accentSoft,
              borderColor: THEME.border,
              borderWidth: 1,
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 999,
              marginTop: 8,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: THEME.text, fontSize: 14, fontWeight: "700" }}>📍 {city}</Text>
          </View>

          <Text style={{ color: THEME.text, fontSize: 24, fontWeight: "800", marginBottom: 12 }}>Qibla direction</Text>

          {/* Boussole / Flèche */}
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: THEME.border,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
              backgroundColor: THEME.card,
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
                borderBottomColor: isFacingQibla ? THEME.success : THEME.accent,
                transform: [{ rotate: `${arrowAngle}deg` }, { translateY: -10 }],
              }}
            />
          </View>

          <Text style={{ color: THEME.text, marginTop: 14, fontSize: 16 }}>
            {isFacingQibla ? "✅ You're facing the Qibla!" : qibla != null ? `Face toward: ${Math.round(qibla)}°` : "—"}
          </Text>
          {!isFacingQibla && (
            <Text style={{ color: THEME.sub, marginTop: 6, fontSize: 13, textAlign: "center" }}>
              Turn your phone until the arrow points up to face the Qibla.
            </Text>
          )}
          <Text style={{ color: THEME.accent, fontSize: 14, fontWeight: "700", marginTop: 8, letterSpacing: 0.5 }}>
            © 2025 @yanis26x · Tous droits réservé
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
