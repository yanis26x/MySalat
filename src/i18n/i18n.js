// src/i18n/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

// 🗂️ Import des fichiers de traduction
import frSettings from "./fr/parametres.json";
import enSettings from "./en/parametres.json";
import frTabs from "./fr/tabs.json";
import enTabs from "./en/tabs.json";
import frQibla from "./fr/qibla.json";
import enQibla from "./en/qibla.json";
import frFooter from "./fr/footer.json";
import enFooter from "./en/footer.json";
import frMenu from "./fr/menu.json";
import enMenu from "./en/menu.json";
import frPlay from "./fr/play.json"; // 👈 ajouté
import enPlay from "./en/play.json"; // 👈 ajouté

// 🧩 Regroupe toutes les langues ici
const resources = {
  fr: {
    translation: {
      ...frSettings, // namespace global "translation" pour textes communs
    },
    tabs: frTabs,
    qibla: frQibla,
    footer: frFooter,
    menu: frMenu,
    play: frPlay, // 👈 ajouté
  },
  en: {
    translation: {
      ...enSettings,
    },
    tabs: enTabs,
    qibla: enQibla,
    footer: enFooter,
    menu: enMenu,
    play: enPlay, // 👈 ajouté
  },
};

// 🌍 Détection automatique de la langue du téléphone
const initialLng = Localization.locale?.toLowerCase().startsWith("fr")
  ? "fr"
  : "en";

// ⚙️ Initialisation
i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  lng: initialLng,
  fallbackLng: "en",
  ns: ["translation", "tabs", "qibla", "footer", "menu", "play"], // 👈 liste des namespaces
  defaultNS: "translation",
  interpolation: {
    escapeValue: false, // ⚡️ évite les problèmes avec React Native
  },
});

export default i18n;
