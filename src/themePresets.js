// src/themePresets.js
export const THEMES = {
  // 🌿 Clair vert (actuel)
  greenLight: {
    label: "Mint",
    screenGradient: ["#E6F4EA", "#CDE9D5"],
    appBg: "#F3FDF6",
    card: "#E6F4EA",
    surface: "#D7ECD9",
    border: "#C1E1C1",
    text: "#1C3A27",
    sub: "#5C715E",
    accent: "#58B368",
    accentSoft: "rgba(88,179,104,0.15)",
    success: "#2F855A",
    tabBg: "#E6F4EA",
  },

  // 🌌 Ancien thème sombre bleu
  darkBlue: {
    label: "Dark Blue (v1)",
    screenGradient: ["#0a2472", "#000000"],
    appBg: "#000000",
    card: "#0B0B0F",
    surface: "#0F1115",
    border: "#1a1a1a",
    text: "#FFFFFF",
    sub: "#9CA3AF",
    accent: "#3B82F6",
    accentSoft: "rgba(59,130,246,0.12)",
    success: "#22c55e",
    tabBg: "#0B0B0F",
  },
  // ❄️ Winter (hiver clair, glacé)
winter: {
  label: "Winter",
  screenGradient: ["#F0F9FF", "#E0F2FE", "#BFDBFE"], // givre → azur clair → bleu glacé
  appBg: "#F8FAFC",     // blanc bleuté
  card: "#ECF5FF",      // carte très claire
  surface: "#E0F2FE",   // surface azur pâle
  border: "#93C5FD",    // contour bleu froid
  text: "#0F172A",      // texte ardoise foncé (lisible)
  sub: "#475569",       // sous-texte ardoise
  accent: "#60A5FA",    // bleu “glace” pour boutons
  accentSoft: "rgba(96,165,250,0.20)",
  success: "#22C55E",   // vert discret pour succès
  tabBg: "#ECF5FF",     // onglets assortis, clairs
},



// 🐠 Aqua (bleu frutiger aero)
Aqua: {
  label: "Aqua Frutiger",
  screenGradient: ["#B3E5FC", "#4DD0E1", "#00ACC1"], // bleu clair → turquoise → cyan profond
  appBg: "#E0F7FA",         // fond clair légèrement aqua
  card: "#CCFBF1",          // cartes translucides
  surface: "#B2EBF2",       // surface plus lumineuse
  border: "#4DD0E1",        // contours bleus doux
  text: "#00363A",          // texte bleu foncé
  sub: "#0277BD",           // sous-texte bleu moyen
  accent: "#00BCD4",        // cyan vibrant pour boutons et liens
  accentSoft: "rgba(0,188,212,0.25)", // effet “verre” léger
  success: "#2DD4BF",       // vert-menthe typique Aero
  tabBg: "#B2EBF2",         // fond d’onglets clair
},

   // 🌸 Sakura Petals (rose pastel lumineux)
  sakuraPetals: {
    label: "Sakura Petals",
    screenGradient: ["#F9A8D4", "#F472B6", "#EC4899"],
    appBg: "#FDF2F8",
    card: "#FCE7F3",
    surface: "#FBCFE8",
    border: "#F9A8D4",
    text: "#3F1D2E",
    sub: "#9D6389",
    accent: "#DB2777",
    accentSoft: "rgba(219,39,119,0.2)",
    success: "#16A34A",
    tabBg: "#FBCFE8",
  },

  // 💜 Violet (mauve doux et apaisant)
Amethyst: {
  label: "Amethyst",
  screenGradient: ["#C084FC", "#9333EA", "#6D28D9"],
  appBg: "#F5F3FF",
  card: "#EDE9FE",
  surface: "#DDD6FE",
  border: "#876debff",
  text: "#2e1065ff",
  sub: "#7C3AED",
  accent: "#8B5CF6",//
  accentSoft: "rgba(115, 101, 246, 0.15)",//
  success: "#22C55E",
  tabBg: "#feede9ff",
},

   // 🎋 Bamboo (vert fluo)
  coolGreen: {
    label: "Bamboo",
    screenGradient: ["#A7F3D0", "#10B981"],
    appBg: "#ECFDF5",
    card: "#D1FAE5",
    surface: "#A7F3D0",
    border: "#6EE7B7",
    text: "#064E3B",
    sub: "#047857",
    accent: "#10B981",
    accentSoft: "rgba(16,185,129,0.15)",
    success: "#15803D",
    tabBg: "#D1FAE5",
  },

  // 🌇 Autumn Fall (coucher de soleil chaud)
autumnFall: {
  label: "Autumn Fall",
  screenGradient: ["#FFEDD5", "#FB923C", "#EA580C"], // dégradé crème → orange doux → orange profond
  appBg: "#FFF7ED", // fond clair légèrement chaud
  card: "#FED7AA", // cartes orange pâle
  surface: "#FDBA74", // surfaces lumineuses
  border: "#F97316", // contour orange vif
  text: "#3C1E0A", // texte brun très foncé (lisible)
  sub: "#9A3412", // sous-texte orange sombre
  accent: "#F97316", // orange principal éclatant
  accentSoft: "rgba(249,115,22,0.25)", // accent adouci
  success: "#16A34A", // vert équilibré
  tabBg: "#FED7AA", // fond onglets doux
},


// Océan (sombre turquoise)
  oceanDark: {
    label: "Obsidian Ocean",
    screenGradient: ["#022C22", "#000000"],
    appBg: "#000000",
    card: "#071A1A",
    surface: "#0B2424",
    border: "#113333",
    text: "#E6FFFA",
    sub: "#99F6E4",
    accent: "#14B8A6",
    accentSoft: "rgba(20,184,166,0.12)",
    success: "#16A34A",
    tabBg: "#071A1A",
  },

  // 🖤 Full Black
black: {
  label: "Shadow",
  screenGradient: ["#000000", "#0B0B0B"],
  appBg: "#000000",
  card: "#0C0C0C",
  surface: "#121212",
  border: "#1E1E1E",
  text: "#FFFFFF",
  sub: "#9CA3AF",
  accent: "#6b787cff",           // 🔹 boutons sombres (pas blancs)
  accentSoft: "rgba(255,255,255,0.08)", 
  success: "#16A34A",          // vert discret pour validation
  tabBg: "#0B0B0B",
},

};
