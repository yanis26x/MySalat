// App.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Platform, Alert, ActivityIndicator, ScrollView } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPrayerTimesForDate } from "./src/prayerTimes";
import { scheduleNextDays } from "./src/scheduler";
import { qiblaBearing } from "./src/qibla";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldSetBadge: false,
    shouldPlaySound: true,
  }),
});

const CARD = {
  bg: "#0B0B0F",
  text: "#FFFFFF",
  sub: "#9CA3AF",
  accent: "#3B82F6",
  border: "#1a1a1a",
};

const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [todayTimes, setTodayTimes] = useState(null);
  const [permState, setPermState] = useState({ notif: "unknown", loc: "unknown" });
  const [scheduledCount, setScheduledCount] = useState(0);
  const [now, setNow] = useState(new Date());
  const [heading, setHeading] = useState(0);
  const [qibla, setQibla] = useState(null);

  // live timer
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let headingSub = null;

    (async () => {
      try {
        const notifPerm = await Notifications.requestPermissionsAsync();
        setPermState((s) => ({ ...s, notif: notifPerm.status }));

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.HIGH,
          });
        }

        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        setPermState((s) => ({ ...s, loc: locStatus }));
        if (locStatus !== "granted") {
          Alert.alert("Localisation requise", "Active la localisation pour calculer les horaires et la Qibla.");
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // ✅ Inverse géocodage
        const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });

        let city = "Unknown";
        let region = "";
        let country = "";
        if (places.length > 0) {
          city =
            places[0].city ||
            places[0].subregion ||
            places[0].region ||
            places[0].district ||
            places[0].country ||
            "Unknown";
          region = places[0].region || "";
          country = places[0].country || "";
        }

        const prettyCity = city;
        setCoords({ lat, lon, city, region, country, prettyCity });

        // ✅ Calcul Qibla
        const qb = qiblaBearing(lat, lon);
        setQibla(qb);

        // ✅ Boussole
        headingSub = await Location.watchHeadingAsync((h) => {
          const hdg =
            (typeof h.trueHeading === "number" && !Number.isNaN(h.trueHeading))
              ? h.trueHeading
              : (typeof h.magHeading === "number" ? h.magHeading : 0);
          setHeading(((hdg % 360) + 360) % 360);
        });

        // Horaires
        const times = getPrayerTimesForDate(lat, lon, new Date());
        setTodayTimes(times);

        // Notifications
        const count = await scheduleNextDays(lat, lon, 7);
        setScheduledCount(count);
      } catch (e) {
        console.error("Init error:", e);
        Alert.alert("Erreur", "Un problème est survenu lors de l'initialisation.");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (headingSub) headingSub.remove?.();
      headingSub = null;
    };
  }, []);

  const nextInfo = useMemo(() => {
    if (!todayTimes) return null;
    const order = PRAYERS.map((k) => [k, todayTimes[k]]);
    const upcoming = order
      .map(([k, d]) => [k, d])
      .filter(([, d]) => d && d.getTime() > now.getTime())
      .sort((a, b) => a[1] - b[1]);
    if (upcoming.length > 0) {
      const [k, d] = upcoming[0];
      return { key: k, at: d };
    }
    return null;
  }, [todayTimes, now]);

  function fmtCountdown(target) {
    if (!target) return "";
    const ms = target.getTime() - now.getTime();
    if (ms <= 0) return "Now";
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  }

  const arrowAngle = useMemo(() => {
    if (!qibla) return 0;
    const diff = (qibla - heading + 360) % 360;
    return diff;
  }, [qibla, heading]);

  if (loading) {
    return (
      <LinearGradient colors={["#0a2472", "#000000"]} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: CARD.sub, marginTop: 12 }}>Preparing your prayer times…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0a2472", "#000000"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 📍 Localisation (en haut) */}
          <View style={{ alignItems: "center", marginTop: 10, marginBottom: 12 }}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderColor: CARD.border,
                borderWidth: 1,
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: CARD.text, fontSize: 14, fontWeight: "700" }}>
                <Text style={{ opacity: 0.85 }}>📍</Text> {coords?.prettyCity ?? "Unknown"}
              </Text>
            </View>
          </View>

          {/* Header */}
          <View style={{ marginBottom: 18, alignItems: "center" }}>
            <Text style={{ color: CARD.text, fontSize: 28, fontWeight: "800" }}>MySalat</Text>
            <Text style={{ color: CARD.sub, marginTop: 4 }}>Automatic prayer notifications</Text>
          </View>

          {/* Card: Next prayer */}
          <View
            style={{
              backgroundColor: CARD.bg,
              borderColor: CARD.border,
              borderWidth: 1,
              padding: 18,
              borderRadius: 16,
              marginBottom: 16,
            }}
          >
            {nextInfo ? (
              <>
                <Text style={{ color: CARD.sub, marginBottom: 6 }}>Next prayer</Text>
                <Text style={{ color: CARD.text, fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
                  {nextInfo.key.toUpperCase()} · {format(nextInfo.at, "HH:mm")}
                </Text>
                <Text style={{ color: CARD.accent, fontSize: 16 }}>
                  Starts in {fmtCountdown(nextInfo.at)}
                </Text>
              </>
            ) : (
              <Text style={{ color: CARD.sub }}>
                All prayers passed for today. You’re scheduled for the next days.
              </Text>
            )}
          </View>

          {/* Card: Today list */}
          <View
            style={{
              backgroundColor: CARD.bg,
              borderColor: CARD.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: CARD.sub, marginBottom: 10 }}>Today</Text>
            {todayTimes ? (
              PRAYERS.map((k) => (
                <View
                  key={k}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    borderBottomColor: CARD.border,
                    borderBottomWidth: 1,
                  }}
                >
                  <Text style={{ color: CARD.text, fontSize: 16, textTransform: "capitalize" }}>{k}</Text>
                  <Text style={{ color: CARD.text, fontSize: 16 }}>
                    {format(todayTimes[k], "HH:mm")}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#fca5a5" }}>Failed to compute prayer times.</Text>
            )}
          </View>

          {/* Qibla section */}
          <View
            style={{
              backgroundColor: CARD.bg,
              borderColor: CARD.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
              marginTop: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: CARD.sub, marginBottom: 10 }}>Qibla direction</Text>

            <View
              style={{
                width: 180,
                height: 180,
                borderRadius: 90,
                borderWidth: 1,
                borderColor: CARD.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderWidth: 1,
                  borderColor: "#141414",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: "#141414",
                }}
              />

              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 10,
                  borderRightWidth: 10,
                  borderBottomWidth: 60,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderBottomColor: CARD.accent,
                  transform: [{ rotate: `${arrowAngle}deg` }, { translateY: -10 }],
                }}
              />
            </View>

            <Text style={{ color: CARD.text, marginTop: 12, fontSize: 16 }}>
              {qibla != null ? `Face toward: ${Math.round(qibla)}°` : "—"}
            </Text>
            <Text style={{ color: CARD.sub, marginTop: 4, fontSize: 13 }}>
              Turn your phone until the arrow points up to face the Qibla.
            </Text>
          </View>

          {/* Footer */}
          <View style={{ marginTop: 16, alignItems: "center" }}>
            <Text style={{ color: CARD.sub, fontSize: 13 }}>
              Notifications enabled · {scheduledCount} reminders set
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
