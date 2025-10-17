// src/screens/NotesScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Platform,
  Switch,
  Image
} from "react-native";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme26x } from "../themeContext";
import { getPrayerTimesForDate } from "../prayerTimes";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Footer from "../components/Footer";

// 🆕 i18n
import "../i18n/i18n"; // s'assure que i18n est initialisé
import i18n from "../i18n/i18n";
import { useTranslation } from "react-i18next";

const INSTAGRAM_USER = "yanis26x";
const GITHUB_USER = "yanis26x";
const LINKEDIN_URL = "https://www.linkedin.com/in/yanis-djenadi-058964307/";

const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const PREFS_KEY = "notifPrefs26x";
const LANG_KEY = "appLang26x";

/* ---------- Helpers ---------- */
function SectionHeader({ icon, title, subtitle }) {
  const { THEME } = useTheme26x();
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name={icon} size={20} color={THEME.accent} />
        <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "800" }}>
          {title}
        </Text>
      </View>
      {subtitle ? (
        <Text style={{ color: THEME.sub, marginTop: 4 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

async function openExternal(urls) {
  try {
    if (urls.app && (await Linking.canOpenURL(urls.app))) {
      await Linking.openURL(urls.app);
      return;
    }
    await Linking.openURL(urls.web);
  } catch {
    Alert.alert(
      i18n.t("alert.openFail.title"),
      i18n.t("alert.openFail.body")
    );
  }
}

/* ---------- Replanification simple sur 7 jours selon préférences ---------- */
async function rescheduleNextDaysWithPrefs(prefs, days = 7) {
  const perm = await Notifications.requestPermissionsAsync();
  if (perm.status !== "granted") {
    Alert.alert(
      i18n.t("alert.notifsOff.title"),
      i18n.t("alert.notifsOff.body")
    );
    return;
  }

  const { status: locStatus } =
    await Location.requestForegroundPermissionsAsync();
  if (locStatus !== "granted") {
    Alert.alert(
      i18n.t("alert.locationReq.title"),
      i18n.t("alert.locationReq.body")
    );
    return;
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}

  const now = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const times = getPrayerTimesForDate(lat, lon, d);
    for (const key of PRAYERS) {
      if (!prefs[key]) continue;

      const at = times[key];
      if (!(at instanceof Date)) continue;
      if (i === 0 && at.getTime() <= Date.now()) continue;

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: i18n.t("notif.title"),
            body: i18n.t("notif.bodyPrayer", { name: i18n.t(`prayers.${key}`) }),
            sound: true,
          },
          trigger: { date: at },
        });
      } catch (e) {
        console.warn("schedule error", key, e);
      }
    }
  }

  Alert.alert(
    i18n.t("alert.rescheduled.title"),
    i18n.t("alert.rescheduled.body", { days })
  );
}

export default function ParametresScreen() {
  const { t, i18n: i18next } = useTranslation();
  const { THEME, themeKey, setThemeKey, THEMES } = useTheme26x();
  const tabBarHeight = useBottomTabBarHeight();

  // ---------- État des préférences notifs ----------
  const [notifPrefs, setNotifPrefs] = useState({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  });

  // 🔐 Charger la langue sauvegardée au démarrage de l’écran
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (saved && saved !== i18next.language) {
          await i18next.changeLanguage(saved);
        }
      } catch {}
    })();
  }, [i18next]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setNotifPrefs((p) => ({ ...p, ...parsed }));
        }
      } catch {}
    })();
  }, []);

  const updatePref = async (key, value) => {
    const next = { ...notifPrefs, [key]: value };
    setNotifPrefs(next);
    try {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {}
  };

  const setAll = async (value) => {
    const next = PRAYERS.reduce((acc, k) => ((acc[k] = value), acc), {});
    setNotifPrefs(next);
    try {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {}
  };

  async function testNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🕌 Test Notification",
          body: "TEST26x - It's time to pray",
          sound: true,
        },
        trigger: { seconds: 5 },
      });
      Alert.alert(t("alert.test.ok"), t("alert.test.scheduled"));
    } catch (e) {
      console.error("Test notification error:", e);
      Alert.alert(t("alert.test.errorTitle"), t("alert.test.errorBody"));
    }
  }

  const THEME_KEYS = Object.keys(THEMES);

  // 🆕 Bouton de langue
  const toggleLanguage = async () => {
    const next = i18next.language === "fr" ? "en" : "fr";
    await i18next.changeLanguage(next);
    await AsyncStorage.setItem(LANG_KEY, next);
  };

  return (
    <LinearGradient colors={THEME.screenGradient} style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: tabBarHeight + 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header + bouton langue */}
          <View style={{ marginBottom: 18, alignItems: "center" }}>
            <Text
              style={{ color: THEME.text, fontSize: 28, fontWeight: "800" }}
            >
              {t("settings.title")}
            </Text>
            <Text
              style={{ color: THEME.sub, marginTop: 6, textAlign: "center" }}
            >
              @yanis26x
            </Text>

            {/* 🔘 Lang switch */}
            <Pressable
              onPress={toggleLanguage}
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: THEME.accentSoft,
                borderWidth: 1,
                borderColor: THEME.accent,
              }}
            >
              <Ionicons name="globe-outline" size={18} color={THEME.accent} />
              <Text style={{ color: THEME.accent, fontWeight: "800" }}>
                {i18next.language === "fr" ? t("lang.to_en") : t("lang.to_fr")}
              </Text>
            </Pressable>
          </View>

                    {/* ---------- Sélecteur de thèmes ---------- */}
          <View
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
              marginBottom: 22,
            }}
          >
            <SectionHeader
              icon="color-palette-outline"
              title={t("settings.theme.title")}
              subtitle={t("settings.theme.subtitle")}
            />

            {/* Grille de thèmes */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {Object.keys(THEMES).map((key) => {
                const tTheme = THEMES[key];
                const active = key === themeKey;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setThemeKey(key)}
                    style={{
                      width: "47%",
                      backgroundColor: tTheme.card,
                      borderWidth: 2,
                      borderColor: active ? tTheme.accent : THEME.border,
                      borderRadius: 14,
                      padding: 12,
                    }}
                  >
                    <LinearGradient
                      colors={tTheme.screenGradient}
                      style={{
                        height: 56,
                        borderRadius: 10,
                        overflow: "hidden",
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: THEME.border,
                      }}
                    />
                    <Text style={{ color: tTheme.accent, fontWeight: "800" }}>
                      {tTheme.label}
                    </Text>
                    <View style={{ flexDirection: "row", marginTop: 8, gap: 6 }}>
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          backgroundColor: tTheme.accent,
                          borderWidth: 1,
                          borderColor: THEME.border,
                        }}
                      />
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          backgroundColor: tTheme.card,
                          borderWidth: 1,
                          borderColor: THEME.border,
                        }}
                      />
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          backgroundColor: tTheme.appBg,
                          borderWidth: 1,
                          borderColor: THEME.border,
                        }}
                      />
                    </View>

                    {active && (
                      <View
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          backgroundColor: tTheme.accent,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 999,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: "800",
                          }}
                        >
                          {t("common.active")}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Text style={{ color: THEME.sub, fontSize: 12, marginTop: 12 }}>
              {t("settings.theme.saved")}
            </Text>
          </View>

          {/* ---------- SECTION NOTIFS PRIÈRES ---------- */}
          <View
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
              marginBottom: 22,
            }}
          >
            <SectionHeader
              icon="notifications-outline"
              title={t("settings.notifications.title")}
              subtitle={t("settings.notifications.subtitle")}
            />

            {PRAYERS.map((k, idx) => (
              <View
                key={k}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: THEME.border,
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
                      backgroundColor: notifPrefs[k]
                        ? THEME.accent
                        : THEME.border,
                    }}
                  />
                  <Text
                    style={{
                      color: THEME.text,
                      fontSize: 16,
                      fontWeight: "700",
                      textTransform: "capitalize",
                    }}
                  >
                    {t(`prayers.${k}`)}
                  </Text>
                </View>

                <Switch
                  trackColor={{ false: THEME.border, true: THEME.accent }}
                  thumbColor={"#fff"}
                  value={!!notifPrefs[k]}
                  onValueChange={(val) => updatePref(k, val)}
                />
              </View>
            ))}

            {/* Actions rapides */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable
                onPress={() => setAll(true)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: THEME.accent,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  {t("actions.enableAll")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setAll(false)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: THEME.border,
                  backgroundColor: THEME.surface,
                }}
              >
                <Text style={{ color: THEME.text, fontWeight: "800" }}>
                  {t("actions.disableAll")}
                </Text>
              </Pressable>
            </View>

            {/* Replanifier */}
            <Pressable
              onPress={() => rescheduleNextDaysWithPrefs(notifPrefs, 7)}
              style={{
                marginTop: 10,
                alignItems: "center",
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: THEME.accent,
                backgroundColor: THEME.accentSoft,
              }}
            >
              <Text style={{ color: THEME.accent, fontWeight: "800" }}>
                {t("actions.reschedule7d")}
              </Text>
            </Pressable>

            <Text style={{ color: THEME.sub, fontSize: 12, marginTop: 8 }}>
              {t("tips.fajr")}
            </Text>
          </View>

          
          {/* ---------- À venir ---------- */}
          <View
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
              marginBottom: 22,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <SectionHeader icon="information-circle-outline" title={t("coming.title")} />
            <Text style={{ color: THEME.text, fontSize: 16, lineHeight: 22 }}>
              {t("coming.body")}
            </Text>
          </View>

          {/* ---------- Follow me ---------- */}
          <View
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
              marginBottom: 22,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <SectionHeader
              icon="heart-outline"
              title={t("follow.title")}
              subtitle={t("follow.subtitle")}
            />

            {/* Instagram */}
            <Pressable
              onPress={() =>
                openExternal({
                  app:
                    Platform.OS === "ios"
                      ? `instagram://user?username=${INSTAGRAM_USER}`
                      : `intent://instagram.com/_u/${INSTAGRAM_USER}#Intent;package=com.instagram.android;scheme=https;end`,
                  web: `https://instagram.com/${INSTAGRAM_USER}`,
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                borderColor: THEME.border,
                borderWidth: 1,
                marginBottom: 10,
                gap: 12,
                backgroundColor: THEME.surface,
              }}
            >
              <Ionicons name="logo-instagram" size={22} color={THEME.text} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: THEME.text, fontWeight: "700" }}>
                  {t("follow.instagram")}
                </Text>
                <Text style={{ color: THEME.sub }}>@{INSTAGRAM_USER}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={THEME.sub} />
            </Pressable>

            {/* GitHub */}
            <Pressable
              onPress={() => openExternal({ web: `https://github.com/${GITHUB_USER}` })}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                borderColor: THEME.border,
                borderWidth: 1,
                marginBottom: 10,
                gap: 12,
                backgroundColor: THEME.surface,
              }}
            >
              <Ionicons name="logo-github" size={22} color={THEME.text} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: THEME.text, fontWeight: "700" }}>
                  {t("follow.github")}
                </Text>
                <Text style={{ color: THEME.sub }}>@{GITHUB_USER}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={THEME.sub} />
            </Pressable>

            {/* 🌐 Site Web */}
            <Pressable
              onPress={() => Linking.openURL("https://yanis26x.github.io/yanis26x/")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                borderColor: THEME.border,
                borderWidth: 1,
                marginBottom: 10,
                gap: 12,
                backgroundColor: THEME.surface,
              }}
            >
              <Image
                source={require("../../assets/26xLogo.png")}
                style={{ width: 24, height: 24, borderRadius: 6 }}
                resizeMode="contain"
              />

              <View style={{ flex: 1 }}>
                <Text style={{ color: THEME.text, fontWeight: "700" }}>
                  {t("follow.website")}
                </Text>
                <Text style={{ color: THEME.sub }}>yanis26x.github.io</Text>
              </View>

              <Ionicons name="open-outline" size={18} color={THEME.sub} />
            </Pressable>

            {/* LinkedIn */}
            <Pressable
              onPress={() => openExternal({ web: LINKEDIN_URL })}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                borderColor: THEME.border,
                borderWidth: 1,
                gap: 12,
                backgroundColor: THEME.surface,
              }}
            >
              <Ionicons name="logo-linkedin" size={22} color={THEME.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: THEME.text, fontWeight: "700" }}>
                  {t("follow.linkedin")}
                </Text>
                <Text style={{ color: THEME.sub }}>@yanis26x</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={THEME.sub} />
            </Pressable>
          </View>

          {/* ---------- Dev tools ---------- */}
          <View
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
              marginBottom: 10,
            }}
          >
            <SectionHeader
              icon="construct-outline"
              title={t("dev.title")}
              subtitle={t("dev.subtitle")}
            />
            <Pressable
              onPress={testNotification}
              style={{
                alignSelf: "flex-start",
                backgroundColor: THEME.accentSoft,
                borderColor: THEME.accent,
                borderWidth: 1,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: THEME.accent, fontWeight: "700" }}>
                {t("dev.testNotif")}
              </Text>
            </Pressable>
          </View>

          <Footer />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
