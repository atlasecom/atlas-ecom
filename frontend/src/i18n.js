import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationEN from "./locales/en.json";
import translationFR from "./locales/fr.json";
import translationAR from "./locales/ar.json";

const resources = {
  en: { translation: translationEN },
  fr: { translation: translationFR },
  ar: { translation: translationAR },
};

i18n
  .use(LanguageDetector) // Detect browser language
  .use(initReactI18next) // Pass i18n to React
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

// Set document direction based on language
i18n.on("languageChanged", (lng) => {
  document.dir = lng === "ar" ? "rtl" : "ltr";
});

// Set initial direction
document.dir = i18n.language === "ar" ? "rtl" : "ltr";

export default i18n;
