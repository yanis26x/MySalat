// src/screens/NotesScreen.js
import React from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD = {
  bg: "#0B0B0F",
  text: "#FFFFFF",
  sub: "#9CA3AF",
  accent: "#3B82F6",
  border: "#1a1a1a",
};

export default function NotesScreen() {
  async function testNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🕌 Test Notification",
          body: "Ceci est un test — les notifications fonctionnent ✅",
          sound: true,
        },
        trigger: { seconds: 5 },
      });
      Alert.alert("Notification test", "Une notification sera envoyée dans 5 secondes.");
    } catch (e) {
      console.error("Test notification error:", e);
      Alert.alert("Erreur", "Impossible de programmer une notification test.");
    }
  }

  return (
    <LinearGradient colors={["#0a2472", "#000000"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{ color: CARD.text, fontSize: 28, fontWeight: "800", textAlign: "center" }}
            >
              Notes
            </Text>
            <Text style={{ color: CARD.sub, marginTop: 6, textAlign: "center" }}>
              idk yet.
            </Text>
          </View>

          <View
            style={{
              backgroundColor: CARD.bg,
              borderColor: CARD.border,
              borderWidth: 1,
              padding: 16,
              borderRadius: 16,
              marginBottom: 18,
            }}
          >
            <Text style={{ color: CARD.text, fontSize: 16, lineHeight: 22 }}>
              idk yet...
            </Text>
          </View>

          {/* 🔔 Bouton test notif ici */}
          <Pressable
            onPress={testNotification}
            style={{
              alignSelf: "center",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              borderColor: CARD.accent,
              borderWidth: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: CARD.accent, fontWeight: "700" }}>
              Tester les notifications (5s)
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
