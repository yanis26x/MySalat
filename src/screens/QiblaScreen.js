import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Modal, Pressable, ScrollView } from "react-native";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { qiblaBearing } from "../qibla";
import { useTheme26x } from "../themeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import Footer from "../components/Footer";

const ALIGN_TOLERANCE_DEG = 10;

export default function QiblaScreen() {
  const isFocused = useIsFocused();
  const { THEME } = useTheme26x();
  const { t } = useTranslation("qibla");

  const [loading, setLoading] = useState(true);
  const [qibla, setQibla] = useState(null);
  const [heading, setHeading] = useState(0);
  const [isFacingQibla, setIsFacingQibla] = useState(false);
  const [city, setCity] = useState("Unknown");
  const [whyOpen, setWhyOpen] = useState(false);

  const soundRef = useRef(null);
  const headingSubRef = useRef(null);
  const armedRef = useRef(false);
  const lastAlignedRef = useRef(false);

  // ----- Audio
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

  // ----- Capteurs + GPS
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
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(t("alertTitle"), t("alertMessage"));
          setLoading(false);
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
        Alert.alert("Erreur", t("errorInit"));
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

  // ----- Détection alignement
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

  // ----- Angle flèche
  const arrowAngle = useMemo(
    () => (qibla != null ? (qibla - heading + 360) % 360 : 0),
    [qibla, heading]
  );

  // ----- UI
  if (loading) {
    return (
      <LinearGradient colors={THEME.screenGradient} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={THEME.accent} />
        <Text style={{ color: THEME.sub, marginTop: 12 }}>{t("calibration")}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={THEME.screenGradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
       {/* === FAB WHY (nouvelle place / corrigée) === */}
<Pressable
  onPress={() => setWhyOpen(true)}
  accessibilityRole="button"
  accessibilityLabel={t("whyQibla")}
  style={{
    position: "absolute",
    top: 60, // ↓↓↓ abaissé (avant c'était 8)
    right: 16,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  }}
>
  <Ionicons name="help-circle" size={22} color={THEME.accent} />
</Pressable>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 14 }}>
            <Text style={{ color: THEME.text, fontSize: 26, fontWeight: "800" }}>{t("title")}</Text>

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

          {/* Boussole + statut */}
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 300,
                height: 300,
                borderRadius: 150,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: THEME.card,
                borderWidth: 1,
                borderColor: THEME.border,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              <View
                style={{
                  width: 256,
                  height: 256,
                  borderRadius: 128,
                  backgroundColor: THEME.surface,
                  borderWidth: 1,
                  borderColor: THEME.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {[...Array(12)].map((_, i) => (
                  <View
                    key={i}
                    style={{
                      position: "absolute",
                      top: 8,
                      width: 2,
                      height: i % 3 === 0 ? 18 : 10,
                      backgroundColor: i % 3 === 0 ? THEME.accent : THEME.border,
                      transform: [{ rotate: `${i * 30}deg` }],
                    }}
                  />
                ))}

                <View
                  style={{
                    position: "absolute",
                    width: 0,
                    height: 0,
                    borderLeftWidth: 14,
                    borderRightWidth: 14,
                    borderBottomWidth: 92,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderBottomColor: isFacingQibla ? THEME.success : THEME.accent,
                    transform: [{ rotate: `${arrowAngle}deg` }],
                  }}
                />
              </View>
            </View>

            <View style={{ alignItems: "center", marginTop: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: isFacingQibla ? THEME.success : THEME.border,
                  backgroundColor: isFacingQibla ? THEME.accentSoft : THEME.card,
                }}
              >
                <Ionicons
                  name={isFacingQibla ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={isFacingQibla ? THEME.success : THEME.sub}
                />
                <Text style={{ color: isFacingQibla ? THEME.success : THEME.text, fontWeight: "800" }}>
                  {isFacingQibla ? t("aligned") : t("notAligned")}
                </Text>
              </View>


            </View>

            {/* Metrics */}
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 16,
                width: "100%",
                justifyContent: "center",
              }}
            >
              <MetricPill THEME={THEME} icon="compass-outline" value={`${Math.round(heading)}°`} hint="Heading" />
              <MetricPill THEME={THEME} icon="locate-outline" value={qibla != null ? `${Math.round(qibla)}°` : "--"} hint="Qibla" />
              <MetricPill
                THEME={THEME}
                icon="swap-vertical-outline"
                value={
                  qibla != null
                    ? `${Math.abs(Math.round((((qibla - heading + 540) % 360) - 180)))}°`
                    : "--"
                }
                hint="Offset"
              />
            </View>
          </View>

          {/* Info card */}
          <View
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              marginTop: 22,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Ionicons name="information-circle-outline" size={18} color={THEME.accent} />
              <Text style={{ color: THEME.text, fontSize: 16, fontWeight: "800" }}>{t("prayerDirectionTitle")}</Text>
            </View>
            <Text style={{ color: THEME.sub }}>{t("prayerDirectionText")}</Text>
          </View>

          <Footer />
        </ScrollView>

        {/* Modal WHY */}
        <Modal visible={whyOpen} animationType="slide" transparent onRequestClose={() => setWhyOpen(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "flex-end" }}>
            <View
              style={{
                width: "100%",
                backgroundColor: THEME.card,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                borderColor: THEME.border,
                borderTopWidth: 1,
                paddingBottom: 20,
                maxHeight: "70%",
              }}
            >
              <View style={{ alignItems: "center", paddingTop: 8 }}>
                <View style={{ width: 44, height: 4, borderRadius: 999, backgroundColor: THEME.border }} />
              </View>

              <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Ionicons name="book-outline" size={20} color={THEME.accent} />
                  <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "800" }}>{t("modalTitle")}</Text>
                </View>

                <Text style={{ color: THEME.text, marginTop: 6 }}>{t("modalText")}</Text>

                <View style={{ alignItems: "flex-end", marginTop: 16 }}>
                  <Pressable
                    onPress={() => setWhyOpen(false)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor: THEME.accent,
                    }}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "800" }}>{t("ok")}</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MetricPill({ THEME, icon, value, hint }) {
  return (
    <View
      style={{
        minWidth: 92,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.card,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <Ionicons name={icon} size={16} color={THEME.sub} />
      <Text style={{ color: THEME.text, fontWeight: "800", fontSize: 16 }}>{value}</Text>
      <Text style={{ color: THEME.sub, fontSize: 11 }}>{hint}</Text>
    </View>
  );
}
