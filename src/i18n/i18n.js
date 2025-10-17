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


// 🧩 Regroupe toutes les langues ici
const resources = {
  fr: {
    translation: {
      ...frSettings, // namespace global "translation" pour textes communs
    },
    tabs: frTabs, // namespace séparé pour les noms d’onglets
    qibla: frQibla,
    footer: frFooter,
    menu: frMenu,
  },
  en: {
    translation: {
      ...enSettings,
    },
    tabs: enTabs,
    qibla: enQibla,
    footer: enFooter,
    menu: enMenu,
  },
};

// 🌍 Détection automatique de la langue du téléphone
const initialLng = Localization.locale?.toLowerCase().startsWith("fr")
  ? "fr"
  : "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  lng: initialLng,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // ⚡️ évite les problèmes avec React Native
  },
});

export default i18n;
