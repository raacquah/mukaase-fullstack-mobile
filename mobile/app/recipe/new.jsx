import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import { createRecipeStyles } from "../../assets/styles/create-recipe.styles";
import { authStyles } from "@/assets/styles/auth.styles";

function splitLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function NewRecipeScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

  if (!isLoaded) return;

  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [image, setImage] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [instructionsText, setInstructionsText] = useState("");

  const scrollToInput = (inputKey) => {
    const inputRef = inputRefs.current[inputKey];
    if (inputRef && scrollViewRef.current) {
      setTimeout(() => {
        inputRef.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - 100),
              animated: true,
            });
          },
          () => {
            // Fallback: try scrolling after a longer delay
            setTimeout(() => {
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
              }
            }, 300);
          }
        );
      }, 150);
    }
  };

  const onSubmit = async () => {
    const userId = user?.id;
    if (!userId || !isLoaded) return Alert.alert("Not signed in", "Please sign in again.");

    const ingredients = splitLines(ingredientsText);
    const instructions = splitLines(instructionsText);

    if (!title.trim()) return Alert.alert("Missing title", "Please add a recipe title.");
    if (ingredients.length === 0)
      return Alert.alert("Missing ingredients", "Add at least one ingredient (one per line).");
    if (instructions.length === 0)
      return Alert.alert("Missing instructions", "Add at least one instruction step (one per line).");

    setSubmitting(true);
    try {
      console.log("Submitting recipe...", { userId, title: title.trim() });
      
      const response = await fetch(`${API_URL}/user-recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          userId,
          title: title.trim(),
          category: category.trim() || null,
          area: area.trim() || null,
          cookTime: cookTime?.trim() || null,
          servings: servings ? parseInt(servings, 10) : null,
          youtubeUrl: youtubeUrl?.trim() || null,
          image: image?.trim() || null,
          ingredients,
          instructions,
        }),
      });

      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        console.error("Error response:", body);
        throw new Error(body?.details || body?.error || `Failed to create recipe (${response.status})`);
      }

      const created = await response.json();
      console.log("Recipe created:", created);
      router.replace(`/recipe/${created.id}`);
    } catch (e) {
      console.error("Error creating recipe:", e);
      Alert.alert("Couldn't save recipe", e.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={createRecipeStyles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
        <View style={createRecipeStyles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} />
          </TouchableOpacity>
          <Text style={createRecipeStyles.title}>Create a recipe</Text>
        </View>

        <Text style={createRecipeStyles.fieldLabel}>Dish *</Text>
        <TextInput
          ref={(ref) => (inputRefs.current.title = ref)}
          value={title}
          onChangeText={setTitle}
          onFocus={() => scrollToInput("title")}
          style={createRecipeStyles.input}
          placeholder="e.g. Grandma's Special Jollof Rice"
          returnKeyType="next"
        />

        <Text style={createRecipeStyles.fieldLabel}>Image URL</Text>
        <TextInput
          ref={(ref) => (inputRefs.current.image = ref)}
          value={image}
          onChangeText={setImage}
          onFocus={() => scrollToInput("image")}
          style={createRecipeStyles.input}
          placeholder="https://…"
          autoCapitalize="none"
          returnKeyType="next"
        />

        <Text style={createRecipeStyles.fieldLabel}>Category</Text>
        <TextInput
          ref={(ref) => (inputRefs.current.category = ref)}
          value={category}
          onChangeText={setCategory}
          onFocus={() => scrollToInput("category")}
          style={createRecipeStyles.input}
          placeholder="e.g. Main Course"
          returnKeyType="next"
        />

        <Text style={createRecipeStyles.fieldLabel}>Area / Cuisine</Text>
        <TextInput
          ref={(ref) => (inputRefs.current.area = ref)}
          value={area}
          onChangeText={setArea}
          onFocus={() => scrollToInput("area")}
          style={createRecipeStyles.input}
          placeholder="e.g. Ghanaian"
          returnKeyType="next"
        />

        <Text style={createRecipeStyles.fieldLabel}>Prep time</Text>
        <TextInput
          ref={(ref) => (inputRefs.current.cookTime = ref)}
          value={cookTime}
          onChangeText={setCookTime}
          onFocus={() => scrollToInput("cookTime")}
          style={createRecipeStyles.input}
          placeholder="e.g. 45 minutes"
          returnKeyType="next"
        />

        <Text style={createRecipeStyles.fieldLabel}>Servings</Text>
        <TextInput
          ref={(ref) => (inputRefs.current.servings = ref)}
          value={servings}
          onChangeText={setServings}
          onFocus={() => scrollToInput("servings")}
          style={createRecipeStyles.input}
          placeholder="e.g. 4"
          keyboardType="number-pad"
          returnKeyType="next"
        />

        <Text style={createRecipeStyles.fieldLabel}>YouTube URL (optional)</Text>
        <TextInput
          ref={(ref) => (inputRefs.current.youtubeUrl = ref)}
          value={youtubeUrl}
          onChangeText={setYoutubeUrl}
          onFocus={() => scrollToInput("youtubeUrl")}
          style={createRecipeStyles.input}
          placeholder="https://youtube.com/…"
          autoCapitalize="none"
          returnKeyType="next"
        />

        <Text style={createRecipeStyles.fieldLabel}>Ingredients *</Text>
        <TextInput
          ref={(ref) => (inputRefs.current.ingredients = ref)}
          value={ingredientsText}
          onChangeText={setIngredientsText}
          onFocus={() => scrollToInput("ingredients")}
          style={[createRecipeStyles.input, createRecipeStyles.textarea]}
          placeholder={"One ingredient per line\nExample:\n2 cups rice\n1 tsp salt"}
          multiline
          textAlignVertical="top"
        />
        <Text style={createRecipeStyles.helperText}>Tip: put measurements in the same line (like your app already displays).</Text>

        <Text style={createRecipeStyles.fieldLabel}>Instructions *</Text>
        <TextInput
          ref={(ref) => (inputRefs.current.instructions = ref)}
          value={instructionsText}
          onChangeText={setInstructionsText}
          onFocus={() => scrollToInput("instructions")}
          style={[createRecipeStyles.input, createRecipeStyles.textarea]}
          placeholder={"One step per line\nExample:\nRinse rice\nBoil water\nCook for 20 minutes"}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={createRecipeStyles.primaryButton}
          onPress={onSubmit}
          disabled={submitting}
          activeOpacity={0.9}
        >
          <View style={createRecipeStyles.primaryButtonInner}>
            <Ionicons name={submitting ? "hourglass" : "save"} size={18} color="white" />
            <Text style={createRecipeStyles.primaryButtonText}>
              {submitting ? "Saving…" : "Save recipe"}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}


