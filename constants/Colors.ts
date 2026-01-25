const tintColorLight = "#F4A938"; // warm golden yellow
const tintColorDark = "#F6C453";

export default {
  light: {
    text: "#1F2937", // dark neutral text
    background: "#fbeaccff", // warm cream background
    tint: tintColorLight,

    card: "#fff8ecff",
    cardLight: "#fefaf2ff",
    border: "#F1E3C8",

    primary: "#F4A938", // buttons / highlights
    secondary: "#FFD166", // chips, accents
    muted: "#9CA3AF",

    tabIconDefault: "#C9B08A",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#FFF7E6",
    background: "#1F1B16",
    tint: tintColorDark,

    card: "#2A241C",
    cardLight: "#3A3126",
    border: "#3A3126",

    primary: "#F6C453",
    secondary: "#FFD166",
    muted: "#A8A29E",

    tabIconDefault: "#A68C5A",
    tabIconSelected: tintColorDark,
  },
};
