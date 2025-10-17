// src/components/Footer.js
import React, { useState } from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { useTheme26x } from "../themeContext";

export default function Footer() {
  const { THEME } = useTheme26x();
  const [visible, setVisible] = useState(false);
  const year = new Date().getFullYear();

  return (
    <>
      {/* FOOTER BAR */}
      <Pressable
        onPress={() => setVisible(true)}
        style={{
          width: "100%",
          backgroundColor: "#000",
          paddingVertical: 10,
          alignItems: "center",
          justifyContent: "center",
          borderTopWidth: 1,
          borderTopColor: THEME.border,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.4,
          }}
        >
          © {year} yanis26x · Tous droits réservés
        </Text>
      </Pressable>

      {/* MODALE DE MESSAGE */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          onPress={() => setVisible(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: THEME.card,
              borderRadius: 16,
              paddingVertical: 20,
              paddingHorizontal: 28,
              borderWidth: 1,
              borderColor: THEME.border,
            }}
          >
            <Text
              style={{
                color: THEME.text,
                fontSize: 16,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Fait par yanis djenadi (@yanis26x)
              {"\n"} I hope you like it! 
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
