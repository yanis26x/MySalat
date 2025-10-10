// App.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Platform, Alert, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient"; // ✅ Import du dégradé
import { getPrayerTimesForDate } from "./src/prayerTimes";
import { scheduleNextDays } from "./src/scheduler";

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

  // live timer
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
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
          Alert.alert("Localisation requise", "Active la localisation pour calculer les horaires de prière.");
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });

        const times = getPrayerTimesForDate(lat, lon, new Date());
        setTodayTimes(times);

        const count = await scheduleNextDays(lat, lon, 7);
        setScheduledCount(count);
      } catch (e) {
        console.error("Init error:", e);
        Alert.alert("Erreur", "Un problème est survenu lors de l'initialisation.");
      } finally {
        setLoading(false);
      }
    })();
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

  if (loading) {
    return (
      <LinearGradient
        colors={["#0a2472", "#000000"]}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: CARD.sub, marginTop: 12 }}>Preparing your prayer times…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0a2472", "#000000"]} // 💙 Dégradé bleu → noir
      style={{ flex: 1, padding: 20 }}
    >
      {/* Header */}
      <View style={{ marginTop: 24, marginBottom: 18 }}>
        <Text style={{ color: CARD.text, fontSize: 28, fontWeight: "800" }}>MySalat</Text>
        <Text style={{ color: CARD.sub, marginTop: 4 }}>
          Notifications auto · {scheduledCount} scheduled
        </Text>
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

      {/* Footer meta */}
      <View style={{ marginTop: 16 }}>
        {coords && (
          <Text style={{ color: CARD.sub }}>
            Location: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
          </Text>
        )}
        <Text style={{ color: CARD.sub, marginTop: 4 }}>
          Permissions · notif: {permState.notif} · loc: {permState.loc}
        </Text>
      </View>
    </LinearGradient>
  );
}
