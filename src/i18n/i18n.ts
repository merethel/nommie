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
        validation: {
          titleRequired: "Title is required",
          descriptionRequired: "Description is required",
          ingredientsRequired: "At least one ingredient is required",
          instructionsRequired: "Instructions are required",
        },
        addPhoto: "Add photo",
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
      recipes: {
        empty: "No recipes saved yet.",
        title: "Recipes",
        description: "A collection of your favorite recipes.",
        ingredients: "Ingredients list",
        instructions: "Cooking instructions",
      },
      common: {
        showMore: "Show more",
        showLess: "Show less",
        edit: "Edit",
        delete: "Delete",
        cancel: "Cancel",
        save: "Save",
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
        validation: {
          titleRequired: "Titel er påkrævet",
          descriptionRequired: "Beskrivelse er påkrævet",
          ingredientsRequired: "Mindst én ingrediens er påkrævet",
          instructionsRequired: "Fremgangsmåde er påkrævet",
        },
        addPhoto: "Tilføj foto",
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
      recipes: {
        empty: "Ingen opskrifter gemt endnu.",
        title: "Opskrifter",
        description: "En samling af dine yndlingsopskrifter.",
        ingredients: "Ingrediensliste",
        instructions: "Fremgangsmåde",
      },
      common: {
        showMore: "Vis mere",
        showLess: "Vis mindre",
        edit: "Rediger",
        delete: "Slet",
        cancel: "Annuller",
        save: "Gem",
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
