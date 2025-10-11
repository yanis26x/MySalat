// App.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
  Pressable,
} from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPrayerTimesForDate } from "./src/prayerTimes";
import { scheduleNextDays } from "./src/scheduler";
import NotesScreen from "./src/screens/NotesScreen";
import QiblaScreen from "./src/screens/QiblaScreen";

// 🧭 Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

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

const Tab = createBottomTabNavigator();

/* ---------- HOME SCREEN (Qibla retirée d'ici) ---------- */
function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [todayTimes, setTodayTimes] = useState(null);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const notifPerm = await Notifications.requestPermissionsAsync();
        if (notifPerm.status !== "granted") {
          // pas bloquant, on continue
        }

        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== "granted") {
          Alert.alert("Localisation requise", "Active la localisation pour calculer les horaires.");
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        const prettyCity =
          places.length > 0
            ? places[0].city || places[0].subregion || places[0].region || places[0].country || "Unknown"
            : "Unknown";
        setCoords({ lat, lon, prettyCity });

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
      <LinearGradient colors={["#0a2472", "#000000"]} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: CARD.sub, marginTop: 12 }}>Preparing your prayer times…</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0a2472", "#000000"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          {/* 📍 Localisation */}
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
            <Text style={{ color: CARD.sub, marginTop: 4 }}>@yanis26x</Text>
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
                <Text style={{ color: CARD.accent, fontSize: 16 }}>Starts in {fmtCountdown(nextInfo.at)}</Text>
              </>
            ) : (
              <Text style={{ color: CARD.sub }}>All prayers passed for today. You’re scheduled for the next days.</Text>
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
                  <Text style={{ color: CARD.text, fontSize: 16 }}>{format(todayTimes[k], "HH:mm")}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#fca5a5" }}>Failed to compute prayer times.</Text>
            )}
          </View>

          {/* Footer */}
          <View style={{ marginTop: 30, alignItems: "center" }}>
            {/* <Text style={{ color: CARD.sub, fontSize: 13, opacity: 0.9 }}>
              Notifications enabled · {scheduledCount} reminders set
            </Text> */}

            <Pressable onPress={() => Linking.openURL("https://www.instagram.com/yanis26x")}>
              <Text style={{ color: CARD.accent, fontSize: 14, fontWeight: "700", marginTop: 8, letterSpacing: 0.5 }}>
                © 2025 @yanis26x
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ---------- APP (Tabs) ---------- */
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: CARD.accent,
          tabBarInactiveTintColor: CARD.sub,
          tabBarStyle: {
            backgroundColor: CARD.bg,
            borderTopColor: CARD.border,
            borderTopWidth: 1,
          },
          tabBarIcon: ({ color, size, focused }) => {
            if (route.name === "Home") {
              return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
            }
            if (route.name === "Qibla") {
              return <Ionicons name={focused ? "compass" : "compass-outline"} size={size} color={color} />;
            }
            if (route.name === "Notes") {
              return <Ionicons name={focused ? "book" : "book-outline"} size={size} color={color} />;
            }
            return null;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Qibla" component={QiblaScreen} />
        <Tab.Screen name="Notes" component={NotesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
