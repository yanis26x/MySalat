// src/screens/NotesScreen.js
import React from "react";
import { View, Text, ScrollView, Pressable, Alert, Linking, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme26x } from "../themeContext";

const INSTAGRAM_USER = "yanis26x";
const GITHUB_USER = "yanis26x";
const LINKEDIN_URL = "https://www.linkedin.com/in/yanis-djenadi-058964307/";

function SectionHeader({ icon, title, subtitle }) {
  const { THEME } = useTheme26x();
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name={icon} size={20} color={THEME.accent} />
        <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "800" }}>{title}</Text>
      </View>
      {subtitle ? <Text style={{ color: THEME.sub, marginTop: 4 }}>{subtitle}</Text> : null}
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
    Alert.alert("Ouverture impossible", "Vérifie que l’app ou le navigateur est disponible.");
  }
}

export default function NotesScreen() {
  const { THEME, themeKey, setThemeKey, THEMES } = useTheme26x();

  async function testNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: "🕌 Test Notification", body: "TEST26x - Its time to pray", sound: true },
        trigger: { seconds: 5 },
      });
      Alert.alert("A notification will be sent...");
    } catch (e) {
      console.error("Test notification error:", e);
      Alert.alert("Erreur", "Impossible de programmer une notification test.");
    }
  }

  const THEME_KEYS = Object.keys(THEMES);

  return (
    <LinearGradient colors={THEME.screenGradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
          {/* Header */}
          <View style={{ marginBottom: 18, alignItems: "center" }}>
            <Text style={{ color: THEME.text, fontSize: 28, fontWeight: "800" }}>Notes</Text>
            <Text style={{ color: THEME.sub, marginTop: 6, textAlign: "center" }}>@yanis26x</Text>
          </View>

          {/* Sélecteur de thèmes */}
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
            <SectionHeader icon="color-palette-outline" title="Theme" subtitle="Choisis le style de l’app" />

            {/* Grille de thèmes */}
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
  {THEME_KEYS.map((key) => {
    const t = THEMES[key];
    const active = key === themeKey;
    return (
      <Pressable
        key={key}
        onPress={() => setThemeKey(key)}
        style={{
          width: "47%",
          backgroundColor: t.card,
          borderWidth: 2,
          borderColor: active ? t.accent : THEME.border,
          borderRadius: 14,
          padding: 12,
        }}
      >
        {/* mini aperçu gradient */}
        <LinearGradient
          colors={t.screenGradient}
          style={{
            height: 56,
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 10,
            borderWidth: 1,
            borderColor: THEME.border,
          }}
        />

        {/* titre dans la couleur du thème */}
        <Text style={{ color: t.accent, fontWeight: "800" }}>{t.label}</Text>

        {/* petites pastilles */}
        <View style={{ flexDirection: "row", marginTop: 8, gap: 6 }}>
          <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: t.accent, borderWidth: 1, borderColor: THEME.border }} />
          <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: t.card, borderWidth: 1, borderColor: THEME.border }} />
          <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: t.appBg, borderWidth: 1, borderColor: THEME.border }} />
        </View>

        {active && (
          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: t.accent,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>Active</Text>
          </View>
        )}
      </Pressable>
    );
  })}
</View>


            <Text style={{ color: THEME.sub, fontSize: 12, marginTop: 12 }}>
              Le thème est enregistré automatiquement et appliqué à tous les écrans.
            </Text>
          </View>

          {/* About */}
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
            <SectionHeader icon="information-circle-outline" title="Why MySalat ?" subtitle="26x" />
            <Text style={{ color: THEME.text, fontSize: 16, lineHeight: 22 }}>
              MySalat is a modern and minimalist mobile app built with React Native (Expo) that helps you stay connected
              to your faith.{"\n\n"}It automatically detects your location to display accurate prayer times, shows the
              Qibla direction, and sends smart notifications before each prayer — all wrapped in a clean, elegant design.
            </Text>
          </View>

          {/* Follow me */}
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
            <SectionHeader icon="heart-outline" title="Follow me" subtitle="Let’s connect" />

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
                <Text style={{ color: THEME.text, fontWeight: "700" }}>Instagram</Text>
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
                <Text style={{ color: THEME.text, fontWeight: "700" }}>GitHub</Text>
                <Text style={{ color: THEME.sub }}>@{GITHUB_USER}</Text>
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
                <Text style={{ color: THEME.text, fontWeight: "700" }}>LinkedIn</Text>
                <Text style={{ color: THEME.sub }}>@yanis26x</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={THEME.sub} />
            </Pressable>
          </View>

          {/* Dev tools */}
          <View
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
            }}
          >
            <SectionHeader icon="construct-outline" title="Dev tools" subtitle="Outils internes pendant le dev" />
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
              <Text style={{ color: THEME.accent, fontWeight: "700" }}>Tester les notifications</Text>
            </Pressable>
          </View>

          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ color: THEME.accent, fontWeight: "700" }}>© 2025 yanis26x · Tous droits réservé</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
