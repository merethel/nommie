import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TextInput } from "react-native";

import StyledButton from "@/components/StyledButton";
import { Text, View } from "@/components/Themed";

export default function CreateRecipeScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

  return (
    <>
      {/* Header with back button */}
      <Stack.Screen options={{ title: "Opret opskrift" }} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Titel</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Fx Pasta carbonara"
        />

        <Text style={styles.label}>Beskrivelse</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Kort beskrivelse (valgfri)"
        />

        <Text style={styles.label}>Ingredienser</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={ingredients}
          onChangeText={setIngredients}
          placeholder="Fx pasta, æg, parmesan, bacon"
          multiline
        />

        <Text style={styles.label}>Fremgangsmåde</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Hvordan laves retten?"
          multiline
        />

        <View style={styles.buttons}>
          <StyledButton
            title="Gem"
            onPress={() => {
              console.log({
                title,
                description,
                ingredients,
                instructions,
              });
              router.back();
            }}
          />

          <StyledButton title="Annuller" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttons: {
    gap: 12,
    marginTop: 8,
  },
});
