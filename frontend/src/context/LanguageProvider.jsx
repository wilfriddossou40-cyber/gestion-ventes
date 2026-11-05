import { useLayoutEffect, useMemo, useState } from "react";
import en from "../i18n/en.json";
import fr from "../i18n/fr.json";
import LanguageContext from "./languageContext";

const dictionaries = { en, fr };

function getInitialLanguage() {
  return localStorage.getItem("app-language") === "en" ? "en" : "fr";
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useLayoutEffect(() => {
    localStorage.setItem("app-language", language);
    document.documentElement.lang = language;
    document.title = dictionaries[language].meta.title;
  }, [language]);

  const value = useMemo(() => {
    const t = (key, values = {}) => {
      const message = key.split(".").reduce((entry, part) => entry?.[part], dictionaries[language]);
      if (message === undefined || message === null) {
        if (import.meta.env.DEV) {
          console.warn(`Clé de traduction manquante : ${key}`);
        }
        return key;
      }

      return Object.entries(values).reduce(
        (text, [name, replacement]) => text.replaceAll(`{${name}}`, replacement),
        message,
      );
    };

    return { language, setLanguage, t };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
