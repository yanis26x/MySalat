import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { format, addDays } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPrayerTimesForDate } from "./src/prayerTimes";
import { scheduleNextDays } from "./src/scheduler";
import ParametresScreen from "./src/screens/ParametresScreen";
import QiblaScreen from "./src/screens/QiblaScreen";
import HowToScreen from "./src/screens/Learn";
import { ThemeProvider, useTheme26x } from "./src/themeContext";
import { useNavigation } from "@react-navigation/native";
import Footer from "./src/components/Footer";


// 🧭 Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator, useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldSetBadge: false,
    shouldPlaySound: true,
  }),
});

const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const Tab = createBottomTabNavigator();

/* ---------- HELPERS UI ---------- */
function Section({ children, style }) {
  return (
    <View style={[{ backgroundColor: "transparent", marginBottom: 16 }, style]}>
      {children}
    </View>
  );
}

function Card({ children, style, THEME }) {
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

/* ---------- HOME SCREEN (refonte) ---------- */
function HomeScreen() {
  const { THEME } = useTheme26x();
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();

  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [todayTimes, setTodayTimes] = useState(null);
  const [now, setNow] = useState(new Date());
  const [weekPeek, setWeekPeek] = useState([]); // 5 jours compacts

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await Notifications.requestPermissionsAsync();
        const { status: locStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (locStatus !== "granted") {
          Alert.alert(
            "Localisation requise",
            "Active la localisation pour calculer les horaires."
          );
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const places = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });
        const prettyCity =
          places.length > 0
            ? places[0].city ||
              places[0].subregion ||
              places[0].region ||
              places[0].country ||
              "Unknown"
            : "Unknown";
        setCoords({ lat, lon, prettyCity });

        // Aujourd'hui
        const t0 = getPrayerTimesForDate(lat, lon, new Date());
        setTodayTimes(t0);

        // Petit aperçu 5 jours (fajr & maghrib)
        const arr = [];
        for (let i = 1; i <= 5; i++) {
          const d = addDays(new Date(), i);
          const ti = getPrayerTimesForDate(lat, lon, d);
          arr.push({
            date: d,
            fajr: ti.fajr,
            maghrib: ti.maghrib,
          });
        }
        setWeekPeek(arr);

        // planifie la semaine
        await scheduleNextDays(lat, lon, 7);
      } catch (e) {
        console.error("Init error:", e);
        Alert.alert(
          "Erreur",
          "Un problème est survenu lors de l'initialisation."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Trouver prochaine et précédente prière + progression
  const { nextInfo, prevInfo, progress } = useMemo(() => {
    if (!todayTimes) return { nextInfo: null, prevInfo: null, progress: 0 };
    const order = PRAYERS.map((k) => ({ key: k, at: todayTimes[k] })).sort(
      (a, b) => a.at - b.at
    );

    const upcoming = order.find((o) => o.at.getTime() > now.getTime());
    const previous = [...order]
      .reverse()
      .find((o) => o.at.getTime() <= now.getTime()) || {
      key: "isha",
      at: order[order.length - 1].at,
    };

    let pct = 0;
    if (upcoming) {
      const start = previous.at;
      const end = upcoming.at;
      const total = end.getTime() - start.getTime();
      const done = now.getTime() - start.getTime();
      pct = Math.max(0, Math.min(1, done / total));
    }
    return {
      nextInfo: upcoming || null,
      prevInfo: previous || null,
      progress: pct,
    };
  }, [todayTimes, now]);

  const greet = useMemo(() => {
    const h = now.getHours();
    if (h < 6) return "Salut, tu dors pas?!";
    if (h < 12) return "Bon matin ☀️";
    if (h < 18) return "Bonne journée !";
    return "Bonne soirée 🌙";
  }, [now]);

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
        colors={THEME.screenGradient}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color={THEME.accent} />
        <Text style={{ color: THEME.sub, marginTop: 12 }}>
          Préparation de ta journée…
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={THEME.screenGradient} style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: tabBarHeight + 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER : Salam + Date + Localisation dessous */}
          <Section>
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              {/* date */}
              <Text style={{ color: THEME.sub, fontSize: 14 }}>
                {format(now, "EEEE, dd MMM yyyy")}
              </Text>

              {/* salam */}
              <Text
                style={{
                  color: THEME.text,
                  fontSize: 28,
                  fontWeight: "800",
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                {greet}
              </Text>

              {/* localisation plus propre, centrée */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 6,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: THEME.border,
                  backgroundColor: THEME.accentSoft,
                }}
              >
                <Ionicons name="location" size={14} color={THEME.accent} />
                <Text
                  style={{
                    color: THEME.text,
                    fontSize: 14,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  {coords?.prettyCity ?? "Unknown"}
                </Text>
              </View>
            </View>
          </Section>

          {/* PROCHAINE PRIÈRE — carte riche avec barre de progression */}
          <Section>
            <Card THEME={THEME} style={{ padding: 18 }}>
              <Text style={{ color: THEME.sub, marginBottom: 8 }}>
                Prochaine prière
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: THEME.text,
                      fontSize: 22,
                      fontWeight: "800",
                    }}
                  >
                    {nextInfo ? nextInfo.key.toUpperCase() : "—"}
                  </Text>
                  <Text
                    style={{ color: THEME.accent, fontSize: 16, marginTop: 4 }}
                  >
                    {nextInfo
                      ? `dans ${fmtCountdown(nextInfo.at)}`
                      : "toutes passées pour aujourd’hui"}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: THEME.surface,
                    borderColor: THEME.border,
                    borderWidth: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    minWidth: 90,
                  }}
                >
                  <Text style={{ color: THEME.sub, fontSize: 12 }}>à</Text>
                  <Text
                    style={{
                      color: THEME.text,
                      fontSize: 20,
                      fontWeight: "800",
                    }}
                  >
                    {nextInfo ? format(nextInfo.at, "HH:mm") : "--:--"}
                  </Text>
                </View>
              </View>

              {/* barre progression simple */}
              <View
                style={{
                  height: 8,
                  backgroundColor: THEME.surface,
                  borderRadius: 999,
                  marginTop: 14,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: THEME.border,
                }}
              >
                <View
                  style={{
                    width: `${Math.round((progress || 0) * 100)}%`,
                    height: "100%",
                    backgroundColor: THEME.accent,
                  }}
                />
              </View>

              {prevInfo && nextInfo && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: THEME.sub, fontSize: 12 }}>
                    Depuis {prevInfo.key.toUpperCase()} ·{" "}
                    {format(prevInfo.at, "HH:mm")}
                  </Text>
                  <Text style={{ color: THEME.sub, fontSize: 12 }}>
                    Vers {nextInfo.key.toUpperCase()} ·{" "}
                    {format(nextInfo.at, "HH:mm")}
                  </Text>
                </View>
              )}
            </Card>
          </Section>

          {/* RACCOURCIS */}
          <Section>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => navigation.navigate("Qibla")}
                style={{
                  flex: 1,
                  backgroundColor: THEME.card,
                  borderColor: THEME.border,
                  borderWidth: 1,
                  borderRadius: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="compass" size={20} color={THEME.accent} />
                <Text style={{ color: THEME.text, fontWeight: "800" }}>
                  Qibla
                </Text>
                <Text style={{ color: THEME.sub, fontSize: 12 }}>
                  Trouve la direction
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Learn", { initialMode: "howto" })}
                style={{
                  flex: 1,
                  backgroundColor: THEME.card,
                  borderColor: THEME.border,
                  borderWidth: 1,
                  borderRadius: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="school" size={20} color={THEME.accent} />
                <Text style={{ color: THEME.text, fontWeight: "800" }}>
                  Learn
                </Text>
                <Text style={{ color: THEME.sub, fontSize: 12 }}>
                  enprendre & pratiquer
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  navigation.navigate("Learn", { initialMode: "dua" })
                }
                style={{
                  flex: 1,
                  backgroundColor: THEME.card,
                  borderColor: THEME.border,
                  borderWidth: 1,
                  borderRadius: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="sparkles" size={20} color={THEME.accent} />
                <Text style={{ color: THEME.text, fontWeight: "800" }}>
                  Dua du jour
                </Text>
                <Text style={{ color: THEME.sub, fontSize: 12 }}>
                  Invocation & partage
                </Text>
              </Pressable>
            </View>
          </Section>

          {/* LISTE DU JOUR */}
          <Section>
            <Card THEME={THEME}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{ color: THEME.text, fontSize: 18, fontWeight: "800" }}
                >
                  Aujourd’hui
                </Text>
                <Text style={{ color: THEME.sub }}>
                  {format(now, "dd MMM")}
                </Text>
              </View>

              {todayTimes ? (
                PRAYERS.map((k) => {
                  const t = todayTimes[k];
                  const isNext = nextInfo && nextInfo.key === k;
                  return (
                    <View
                      key={k}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingVertical: 10,
                        borderBottomWidth: k === "isha" ? 0 : 1,
                        borderBottomColor: THEME.border,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            backgroundColor: isNext
                              ? THEME.accent
                              : THEME.border,
                          }}
                        />
                        <Text
                          style={{
                            color: isNext ? THEME.accent : THEME.text,
                            fontSize: 16,
                            fontWeight: isNext ? "800" : "600",
                            textTransform: "capitalize",
                          }}
                        >
                          {k}
                        </Text>
                      </View>
                      <Text style={{ color: THEME.text, fontSize: 16 }}>
                        {format(t, "HH:mm")}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={{ color: "#b91c1c" }}>
                  Impossible de calculer les horaires.
                </Text>
              )}
            </Card>
          </Section>

          {/* APERÇU 5 JOURS */}
          <Section>
            <Card THEME={THEME}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{ color: THEME.text, fontSize: 18, fontWeight: "800" }}
                >
                  Prochains jours
                </Text>
                <Text style={{ color: THEME.sub, fontSize: 12 }}>
                  Fajr / Maghrib
                </Text>
              </View>

              {weekPeek.map((d, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    borderBottomWidth: idx === weekPeek.length - 1 ? 0 : 1,
                    borderBottomColor: THEME.border,
                  }}
                >
                  <Text style={{ color: THEME.text, width: 110 }}>
                    {format(d.date, "EEE dd MMM")}
                  </Text>
                  <Text
                    style={{ color: THEME.sub, width: 70, textAlign: "right" }}
                  >
                    {format(d.fajr, "HH:mm")}
                  </Text>
                  <Text
                    style={{
                      color: THEME.text,
                      width: 12,
                      textAlign: "center",
                    }}
                  >
                    ·
                  </Text>
                  <Text
                    style={{ color: THEME.text, width: 70, textAlign: "right" }}
                  >
                    {format(d.maghrib, "HH:mm")}
                  </Text>
                </View>
              ))}
            </Card>
          </Section>

          {/* FOOTER */}
          <Footer/>
          
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ---------- APP (avec ThemeProvider & Tab bar thémée) ---------- */
function AppShell() {
  const { THEME } = useTheme26x();

  return (
    <NavigationContainer>
      <Tab.Navigator
        sceneContainerStyle={{ backgroundColor: THEME.appBg }}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: THEME.accent,
          tabBarInactiveTintColor: THEME.sub,
          tabBarStyle: {
            backgroundColor: THEME.tabBg ?? THEME.card,
            borderTopWidth: 0, // enlève la bande gênante
          },
          tabBarIcon: ({ color, size, focused }) => {
            if (route.name === "Home") {
              return (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={size}
                  color={color}
                />
              );
            }
            if (route.name === "Qibla") {
              return (
                <Ionicons
                  name={focused ? "compass" : "compass-outline"}
                  size={size}
                  color={color}
                />
              );
            }
            if (route.name === "Parametres") {
              return (
                <Ionicons
                  name={focused ? "settings" : "settings-outline"}
                  size={size}
                  color={color}
                />
              );
            }
            if (route.name === "Learn") {
              return (
                <Ionicons
                  name={focused ? "book" : "book-outline"}
                  size={size}
                  color={color}
                />
              );
            }
            return null;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Qibla" component={QiblaScreen} />
        <Tab.Screen name="Learn" component={HowToScreen} />
        <Tab.Screen name="Parametres" component={ParametresScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}