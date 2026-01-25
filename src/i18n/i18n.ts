import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      createRecipe: {
        screenTitle: "Create recipe",
        titleLabel: "Title",
        titlePlaceholder: "e.g. Pasta carbonara",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Short description (optional)",
        ingredientsLabel: "Ingredients",
        ingredientsPlaceholder: "e.g. pasta, eggs, parmesan, bacon",
        instructionsLabel: "Instructions",
        instructionsPlaceholder: "How to make it?",
        save: "Save",
        cancel: "Cancel",
      },
      settings: {
        screenTitle: "Settings",
        language: "Language",
        english: "English",
        danish: "Danish",
      },
      tabs: {
        home: "Home",
        recipes: "Recipes",
        settings: "Settings",
      },
      notFound: {
        title: "This screen doesn't exist.",
        link: "Go to home screen!",
      },
    },
  },
  da: {
    translation: {
      createRecipe: {
        screenTitle: "Opret opskrift",
        titleLabel: "Titel",
        titlePlaceholder: "Fx Pasta carbonara",
        descriptionLabel: "Beskrivelse",
        descriptionPlaceholder: "Kort beskrivelse (valgfri)",
        ingredientsLabel: "Ingredienser",
        ingredientsPlaceholder: "Fx pasta, æg, parmesan, bacon",
        instructionsLabel: "Fremgangsmåde",
        instructionsPlaceholder: "Hvordan laves retten?",
        save: "Gem",
        cancel: "Annuller",
      },
      settings: {
        screenTitle: "Indstillinger",
        language: "Sprog",
        english: "Engelsk",
        danish: "Dansk",
      },
      tabs: {
        home: "Hjem",
        recipes: "Opskrifter",
        settings: "Indstillinger",
      },
      notFound: {
        title: "Denne skærm findes ikke.",
        link: "Gå til startsiden!",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()?.[0]?.languageCode === "da" ? "da" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
