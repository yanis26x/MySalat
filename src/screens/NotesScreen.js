// src/screens/NotesScreen.js
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const CARD = {
  bg: "#0B0B0F",
  text: "#FFFFFF",
  sub: "#9CA3AF",
  accent: "#3B82F6",
  border: "#1a1a1a",
};

const INSTAGRAM_USER = "yanis26x";
const GITHUB_USER = "yanis26x";
const LINKEDIN_URL = "https://www.linkedin.com/in/yanis-djenadi-058964307/";

function SectionHeader({ icon, title, subtitle }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name={icon} size={20} color={CARD.accent} />
        <Text style={{ color: CARD.text, fontSize: 18, fontWeight: "800" }}>
          {title}
        </Text>
      </View>
      {subtitle ? (
        <Text style={{ color: CARD.sub, marginTop: 4 }}>{subtitle}</Text>
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
      "Ouverture impossible",
      "Vérifie que l’app ou le navigateur est disponible."
    );
  }
}

export default function NotesScreen() {
  async function testNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🕌 Test Notification",
          body: "Ceci est un test — les notifs marche ! ✅",
          sound: true,
        },
        trigger: { seconds: 5 },
      });
      Alert.alert(
        "Notification test",
        "Une notification sera envoyée...."
      );
    } catch (e) {
      console.error("Test notification error:", e);
      Alert.alert("Erreur", "Impossible de programmer une notification test.");
    }
  }

  return (
    <LinearGradient colors={["#0a2472", "#000000"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
          {/* Header */}
          <View style={{ marginBottom: 18, alignItems: "center" }}>
            <Text style={{ color: CARD.text, fontSize: 28, fontWeight: "800" }}>
              Notes
            </Text>
            <Text
              style={{ color: CARD.sub, marginTop: 6, textAlign: "center" }}
            >
              @yanis26x
            </Text>
          </View>

          {/* About */}
          <View
            style={{
              backgroundColor: CARD.bg,
              borderColor: CARD.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
              marginBottom: 22,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <SectionHeader
              icon="information-circle-outline"
              title="Why MySalat ?"
              subtitle="26x"
            />
            <Text style={{ color: CARD.text, fontSize: 16, lineHeight: 22 }}>
              MySalat is a modern and minimalist mobile app built with React
              Native (Expo) that helps you stay connected to your faith.{"\n\n"}
              It automatically detects your location to display accurate prayer
              times, shows the Qibla direction, and sends smart notifications
              before each prayer — all wrapped in a clean, elegant design.
            </Text>
          </View>

          {/* Follow me */}
          <View
            style={{
              backgroundColor: CARD.bg,
              borderColor: CARD.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
              marginBottom: 22,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <SectionHeader
              icon="heart-outline"
              title="Follow me"
              subtitle="Let’s connect"
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
                borderColor: CARD.border,
                borderWidth: 1,
                marginBottom: 10,
                gap: 12,
              }}
            >
              <Ionicons name="logo-instagram" size={22} color={CARD.text} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: CARD.text, fontWeight: "700" }}>
                  Instagram
                </Text>
                <Text style={{ color: CARD.sub }}>@{INSTAGRAM_USER}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={CARD.sub} />
            </Pressable>

            {/* GitHub */}
            <Pressable
              onPress={() =>
                openExternal({ web: `https://github.com/${GITHUB_USER}` })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                borderColor: CARD.border,
                borderWidth: 1,
                marginBottom: 10,
                gap: 12,
              }}
            >
              <Ionicons name="logo-github" size={22} color={CARD.text} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: CARD.text, fontWeight: "700" }}>
                  GitHub
                </Text>
                <Text style={{ color: CARD.sub }}>@{GITHUB_USER}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={CARD.sub} />
            </Pressable>

            {/* LinkedIn */}
            <Pressable
              onPress={() => openExternal({ web: LINKEDIN_URL })}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                borderColor: CARD.border,
                borderWidth: 1,
                gap: 12,
              }}
            >
              <Ionicons name="logo-linkedin" size={22} color="#0A66C2" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: CARD.text, fontWeight: "700" }}>
                  LinkedIn
                </Text>
                <Text style={{ color: CARD.sub }}>@yanis26x</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={CARD.sub} />
            </Pressable>
          </View>

          {/* Dev tools */}
          <View
            style={{
              backgroundColor: CARD.bg,
              borderColor: CARD.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
            }}
          >
            <SectionHeader
              icon="construct-outline"
              title="Dev tools"
              subtitle="Outils internes pendant le dev"
            />
            <Pressable
              onPress={testNotification}
              style={{
                alignSelf: "flex-start",
                backgroundColor: "rgba(59, 130, 246, 0.12)",
                borderColor: CARD.accent,
                borderWidth: 1,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: CARD.accent, fontWeight: "700" }}>
                Tester les notifications
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
