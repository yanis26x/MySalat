import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { qiblaBearing } from "../qibla";
import { useTheme26x } from "../themeContext";
import Ionicons from "@expo/vector-icons/Ionicons";

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

  // Charger le son une seule fois
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

  // Setup capteurs
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

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
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

  const arrowAngle = useMemo(
    () => (qibla != null ? (qibla - heading + 360) % 360 : 0),
    [qibla, heading]
  );

  if (loading) {
    return (
      <LinearGradient
        colors={THEME.screenGradient}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color={THEME.accent} />
        <Text style={{ color: THEME.sub, marginTop: 12 }}>Calibrating compass…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={THEME.screenGradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20, flex: 1 }}>
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: THEME.text, fontSize: 26, fontWeight: "800" }}>Qibla</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: THEME.border,
                backgroundColor: THEME.accentSoft,
              }}
            >
              <Ionicons name="location" size={14} color={THEME.accent} />
              <Text style={{ color: THEME.text, fontSize: 13, fontWeight: "700" }}>{city}</Text>
            </View>
          </View>

          {/* Boussole simple */}
          <View style={{ alignItems: "center", marginTop: 6 }}>
            <View
              style={{
                width: 260,
                height: 260,
                borderRadius: 130,
                backgroundColor: THEME.card,
                borderWidth: 1,
                borderColor: THEME.border,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  borderWidth: 1,
                  borderColor: THEME.border,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: THEME.surface,
                }}
              >
                {/* Petits repères */}
                {[...Array(12)].map((_, i) => (
                  <View
                    key={i}
                    style={{
                      position: "absolute",
                      top: 6,
                      width: 2,
                      height: i % 3 === 0 ? 16 : 10,
                      backgroundColor: i % 3 === 0 ? THEME.accent : THEME.border,
                      transform: [{ rotate: `${i * 30}deg` }],
                    }}
                  />
                ))}

                {/* Aiguille */}
                <View
                  style={{
                    position: "absolute",
                    width: 0,
                    height: 0,
                    borderLeftWidth: 12,
                    borderRightWidth: 12,
                    borderBottomWidth: 80,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderBottomColor: isFacingQibla ? THEME.success : THEME.accent,
                    transform: [{ rotate: `${arrowAngle}deg` }],
                  }}
                />
              </View>
            </View>

            {/* Statut */}
            <View style={{ alignItems: "center", marginTop: 14 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: isFacingQibla ? THEME.success : THEME.border,
                  backgroundColor: isFacingQibla ? THEME.accentSoft : THEME.card,
                }}
              >
                <Ionicons
                  name={isFacingQibla ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={isFacingQibla ? THEME.success : THEME.sub}
                />
                <Text
                  style={{
                    color: isFacingQibla ? THEME.success : THEME.text,
                    fontWeight: "800",
                  }}
                >
                  {isFacingQibla ? "Aligné avec la Qibla" : "Tourne-toi vers la Qibla"}
                </Text>
              </View>

              {qibla != null && (
                <Text style={{ color: THEME.sub, marginTop: 6 }}>
                  Cap Qibla: <Text style={{ color: THEME.text, fontWeight: "800" }}>{Math.round(qibla)}°</Text>
                </Text>
              )}
            </View>
          </View>

          {/* Texte simple */}
          <View
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.border,
              borderWidth: 1,
              borderRadius: 14,
              padding: 14,
              marginTop: 18,
            }}
          >
            <Text style={{ color: THEME.text, fontSize: 16, fontWeight: "800", marginBottom: 4 }}>
              Direction de la prière
            </Text>
            <Text style={{ color: THEME.sub }}>
              On prie en direction de la Kaaba, à La Mecque (Qibla).
            </Text>
          </View>

          {/* Footer */}
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Text
              style={{
                color: THEME.accent,
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 0.4,
              }}
            >
              © 2025 @yanis26x
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
