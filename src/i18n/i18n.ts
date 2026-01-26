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
        photoLabel: "Photo",
        changePhoto: "Change photo",
        tagsLabel: "Tags",
        tagsPlaceholder: "e.g. Italian, Quick Meals",
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
        searchPlaceholder: "Search recipes...",
        searchText: "Text",
        searchTags: "Tags",
        searchIngredients: "Ingredients",
        emptySearch: "No recipes found for your search.",
        oneResult: "result",
        manyResults: "results",
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
        photoLabel: "Foto",
        changePhoto: "Skift foto",
        tagsLabel: "Tags",
        tagsPlaceholder: "Fx Italiensk, Hurtige retter",
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
        searchPlaceholder: "Søg opskrifter...",
        searchText: "Tekst",
        searchTags: "Tags",
        searchIngredients: "Ingredienser",
        emptySearch: "Ingen opskrifter fundet for din søgning.",
        oneResult: "resultat",
        manyResults: "resultater",
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
