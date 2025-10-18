// src/navigation/Tabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme26x } from "../themeContext";
import { useTranslation } from "react-i18next";

const Tab = createBottomTabNavigator();

export default function Tabs({ screens }) {
  const { THEME } = useTheme26x();
  const { t } = useTranslation("tabs");

  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: THEME.appBg }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: THEME.accent,
        tabBarInactiveTintColor: THEME.sub,
        tabBarStyle: {
          backgroundColor: THEME.tabBg ?? THEME.card,
          borderTopWidth: 0,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Home: ["home-outline", "home"],
            Qibla: ["compass-outline", "compass"],
            Play: ["game-controller-outline", "game-controller"],
            Learn: ["book-outline", "book"],
            Parametres: ["settings-outline", "settings"],
          };
          const [off, on] = icons[route.name] ?? ["ellipse-outline", "ellipse"];
          return <Ionicons name={focused ? on : off} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={screens.Home} options={{ title: t("home") }} />
      <Tab.Screen name="Qibla" component={screens.Qibla} options={{ title: t("qibla") }} />
      <Tab.Screen name="Play" component={screens.Play} options={{ title: t("play") }} />
      <Tab.Screen name="Learn" component={screens.Learn} options={{ title: t("learn") }} />
      <Tab.Screen name="Parametres" component={screens.Parametres} options={{ title: t("settings") }} />
    </Tab.Navigator>
  );
}
