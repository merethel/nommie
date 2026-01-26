const tintColorLight = "#F2B84B"; // softer, honey-like gold
const tintColorDark = "#F4C96B"; // warmer night-gold

export default {
  light: {
    // text & backgrounds
    text: "#2A1E12", // espresso brown (not gray)
    background: "#FFF4E4", // warm paper / cookbook page
    tint: tintColorLight,

    // surfaces
    card: "#FFF9F0", // soft parchment
    cardLight: "#FFFCF7", // subtle highlight
    border: "#EAD9BF", // linen edge

    // accents
    primary: tintColorLight, // honey gold
    secondary: "#E6A84A", // baked caramel
    muted: "#9C8B73", // warm stone (not gray)

    // tab bar
    tabIconDefault: "#B9A07A", // muted wheat
    tabIconSelected: tintColorLight,
    tabIconActive: "#3A2612", // dark roasted coffee
  },

  dark: {
    // text & backgrounds
    text: "#FFF3DE", // warm cream text
    background: "#1C1813", // dark kitchen at night
    tint: tintColorDark,

    // surfaces
    card: "#262017", // dark wood
    cardLight: "#2F281D", // raised surface
    border: "#3A3126",

    // accents
    primary: tintColorDark,
    secondary: "#E8B95B",
    muted: "#B4A68A", // warm clay

    // tab bar
    tabIconDefault: "#9F8A60",
    tabIconSelected: tintColorDark,
    tabIconActive: "#FFF6E3", // warm butter highlight
  },
};
