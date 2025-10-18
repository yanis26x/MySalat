// src/screens/PlayScreen.js
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTheme26x } from "../themeContext";

function WorldCard({ THEME, title, subtitle, locked = false, onPress }) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={{
        opacity: locked ? 0.5 : 1,
        backgroundColor: THEME.card,
        borderColor: THEME.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: THEME.accentSoft,
            borderWidth: 1,
            borderColor: THEME.accent,
          }}
        >
          <Ionicons
            name={locked ? "lock-closed" : "game-controller"}
            size={22}
            color={locked ? THEME.sub : THEME.accent}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: THEME.text, fontSize: 18, fontWeight: "800" }}>
            {title}
          </Text>
          <Text style={{ color: THEME.sub, marginTop: 2 }}>{subtitle}</Text>
        </View>

        {!locked && (
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        )}
      </View>
    </Pressable>
  );
}

export default function PlayScreen() {
  const navigation = useNavigation();
  const { THEME } = useTheme26x();

  return (
    <LinearGradient colors={THEME.screenGradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header simple */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 4,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: THEME.card,
              borderWidth: 1,
              borderColor: THEME.border,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={THEME.text} />
          </Pressable>

          <Text style={{ color: THEME.text, fontWeight: "800", fontSize: 16 }}>
            @yanis26x
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              color: THEME.text,
              fontSize: 30,
              fontWeight: "900",
              marginBottom: 6,
            }}
          >
            Teste tes connaissances
          </Text>
          <Text style={{ color: THEME.sub, marginBottom: 14 }}>
          50$ au premier qui finit le niveau 3
          </Text>

          {/* Monde 1 — déverrouillé */}
          <WorldCard
            THEME={THEME}
            title="DEBUTANT"
            subtitle="apprends les bases de l'islam"
            onPress={() => navigation.navigate("M1")}
          />

          {/* Monde 2 — verrouillé */}
          <WorldCard
            THEME={THEME}
            title="INTERMEDIAIRE"
            subtitle="finir débutant pour débloquer"
            locked
          />

          {/* Monde 3 — verrouillé */}
          <WorldCard
            THEME={THEME}
            title="H4RDGORE"
            subtitle="finir intermédiaire pour débloquer"
            locked
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
