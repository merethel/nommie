// components/recipe/WavyHeaderImage.tsx
import { Text, View } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";
import { t } from "i18next";
import React, { useMemo } from "react";
import { Dimensions, Pressable, StyleSheet } from "react-native";
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

  function onPressHeaderImage() {
    if (!isEditing) return;
    void pickImage();
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

  if (!photoUri) {
    return isEditing ? (
      <Pressable onPress={pickImage} style={styles.placeholderWrap}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            {t("createRecipe.addPhoto")}
          </Text>
        </View>
      </Pressable>
    ) : null;
  }

  return (
    <View
      style={[
        styles.wavyHeaderWrap,
        isEditing && styles.wavyHeaderWrapEditing,
        { backgroundColor: "transparent" },
      ]}
    >
      <Pressable onPress={onPressHeaderImage} disabled={!isEditing}>
        <Svg width={svgW} height={svgH - 23} viewBox={`0 0 ${svgW} ${svgH}`}>
          <Defs>
            <ClipPath id="wavyClip">
              <Path d={wavePath} />
            </ClipPath>
          </Defs>

          <SvgImage
            href={{ uri: photoUri }}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#wavyClip)"
          />
        </Svg>
      </Pressable>

      {isEditing && (
        <Pressable onPress={onRemove} hitSlop={10} style={styles.removeBadge}>
          <Text style={styles.removeText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wavyHeaderWrap: {
    position: "absolute",
    top: -BLEED,
    left: -BLEED,
    right: -BLEED,
    height: HEADER_HEIGHT,
    zIndex: 0,
  },
  wavyHeaderWrapEditing: { zIndex: 5 },

  placeholderWrap: {
    position: "absolute",
    top: -BLEED,
    left: -BLEED,
    right: -BLEED,
    height: HEADER_HEIGHT,
    zIndex: 5,
  },
  placeholderCard: {
    height: HEADER_HEIGHT,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  placeholderText: { opacity: 0.7, fontWeight: "700" },

  removeBadge: {
    position: "absolute",
    top: 16,
    right: 16,
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
});
