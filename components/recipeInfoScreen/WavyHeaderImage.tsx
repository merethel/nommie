import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { DEFAULT_RECIPE_IMAGE } from "@/constants/images";
import * as ImagePicker from "expo-image-picker";
import { t } from "i18next";
import React, { useMemo } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  View as RNView,
  StyleSheet,
} from "react-native";
import Svg, { ClipPath, Defs, Path, Image as SvgImage } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 260;
const BLEED = 28;

type Props = {
  isEditing: boolean;
  photoUri: string;
  onChangePhotoUri: (uri: string) => void;
  onRemove: () => void;
};

export default function WavyHeaderImage({
  isEditing,
  photoUri,
  onChangePhotoUri,
  onRemove,
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onChangePhotoUri(result.assets[0].uri);
    }
  }

  const svgW = SCREEN_WIDTH + BLEED * 2;
  const svgH = HEADER_HEIGHT;

  const wavePath = useMemo(
    () => `
      M ${svgW} 0
      H -10
      V ${svgH - 170}
      C ${svgW * 0.15} ${svgH},
        ${svgW * 0.45} ${svgH - 10},
        ${svgW * 0.6} ${svgH - 17}
      C ${svgW * 0.85} ${svgH - 30},
        ${svgW * 0.9} ${svgH + 3},
        ${svgW} ${svgH}
      Z
    `,
    [svgW, svgH],
  );

  /* ------------------------------------------------------------------ */
  /* EDIT MODE — image behaves like a normal card field                  */
  /* ------------------------------------------------------------------ */
  if (isEditing) {
    return (
      <RNView style={{ marginTop: 40 }}>
        <Pressable onPress={pickImage} style={styles.editImageWrap}>
          <Image
            source={photoUri ? { uri: photoUri } : DEFAULT_RECIPE_IMAGE}
            style={styles.editImage}
            resizeMode="cover"
          />

          {/* ✅ centered overlay text */}
          <RNView style={styles.overlayCenter} pointerEvents="none">
            <View style={styles.overlayPill}>
              <Text style={styles.overlayText}>
                {t("createRecipe.changePhoto")}
              </Text>
            </View>
          </RNView>

          {!!photoUri && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              hitSlop={10}
              style={styles.removeBadge}
            >
              <Text style={styles.removeText}>✕</Text>
            </Pressable>
          )}
        </Pressable>
      </RNView>
    );
  }

  /* ------------------------------------------------------------------ */
  /* VIEW MODE — wavy image header in the background                     */
  /* ------------------------------------------------------------------ */
  const headerSource = photoUri ? { uri: photoUri } : DEFAULT_RECIPE_IMAGE;

  return (
    <View style={[styles.wavyHeaderWrap, { backgroundColor: "transparent" }]}>
      <Svg width={svgW} height={svgH - 23} viewBox={`0 0 ${svgW} ${svgH}`}>
        <Defs>
          <ClipPath id="wavyClip">
            <Path d={wavePath} />
          </ClipPath>
        </Defs>

        <SvgImage
          href={headerSource as any}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#wavyClip)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ---------------- View mode (wavy header) ---------------- */
  wavyHeaderWrap: {
    position: "absolute",
    top: -BLEED,
    left: -BLEED,
    right: -BLEED,
    height: HEADER_HEIGHT,
    zIndex: 0,
  },

  /* ---------------- Edit mode (card in content) ---------------- */
  editCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginTop: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    opacity: 0.85,
  },

  editImageWrap: {
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },

  editImage: {
    width: "100%",
    height: 180,
  },

  placeholderInner: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    fontWeight: "700",
    opacity: 0.9,
  },

  /* ---------------- Remove badge ---------------- */
  removeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  removeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 18,
  },
  overlayCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  overlayPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  overlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
