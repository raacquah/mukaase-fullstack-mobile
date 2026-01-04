import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { MealAPI } from "../../services/mealAPI";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Image } from "expo-image";
import ToastPopup from "../../components/ToastPopup";

import { recipeDetailStyles } from "../../assets/styles/recipe-detail.styles";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../constants/colors";

import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

const RecipeDetailScreen = () => {
  const { id: recipeId } = useLocalSearchParams();
  const router = useRouter();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const toastTimerRef = useRef(null);

  const { user } = useUser();
  const userId = user?.id;
  const isNumericId = /^\d+$/.test(String(recipeId ?? ""));
  const isUserRecipe = !isNumericId;

  useEffect(() => {
    // reset video state when navigating between recipes
    setShowVideo(false);

    const checkIfSaved = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites/${userId}`);
        const favorites = await response.json();
        const isRecipeSaved = favorites.some((fav) => fav.recipeId === parseInt(recipeId, 10));
        setIsSaved(isRecipeSaved);
      } catch (error) {
        console.error("Error checking if recipe is saved:", error);
      }
    };

    const loadRecipeDetail = async () => {
      setLoading(true);
      try {
        if (isUserRecipe) {
          const response = await fetch(`${API_URL}/user-recipes/${userId}/${recipeId}`);
          if (!response.ok) throw new Error("Failed to load user recipe");
          const userRecipe = await response.json();
          setRecipe(userRecipe);
          setIsSaved(true); // it's already "yours", so treat as saved
          return;
        }

        const mealData = await MealAPI.getMealById(recipeId);
        if (!mealData) return;

        const transformedRecipe = MealAPI.transformMealData(mealData);
        const recipeWithVideo = {
          ...transformedRecipe,
          youtubeUrl: mealData.strYoutube || null,
        };

        setRecipe(recipeWithVideo);
      } catch (error) {
        console.error("Error loading recipe detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isUserRecipe) checkIfSaved();
    loadRecipeDetail();
  }, [recipeId, userId, isUserRecipe]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    // Handles:
    // - https://www.youtube.com/watch?v=VIDEO_ID
    // - https://youtu.be/VIDEO_ID
    // - https://www.youtube.com/embed/VIDEO_ID
    const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return match?.[1] ?? null;
  };

  const getYouTubeEmbedUrl = (videoId) => {
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?playsinline=1&modestbranding=1&rel=0`;
  };

  const getYouTubeThumbnailUrl = (videoId) => {
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await fetch(`${API_URL}/user-recipes/${userId}/${recipeId}`, {
                method: "DELETE",
              });

              if (!response.ok) throw new Error("Failed to delete recipe");

              showToast("Recipe deleted", "success");
              setTimeout(() => {
                router.replace("/(tabs)/favorites");
              }, 1000);
            } catch (error) {
              console.error("Error deleting recipe:", error);
              showToast("Could not delete recipe. Try again.", "error");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleSave = async () => {
    if (isUserRecipe) {
      showToast("This is your recipe", "info");
      return;
    }

    setIsSaving(true);

    try {
      if (isSaved) {
        // remove from favorites
        const response = await fetch(`${API_URL}/favorites/${userId}/${recipeId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to remove recipe");

        setIsSaved(false);
        showToast("Removed from favorites", "success");
      } else {
        // add to favorites
        const response = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            recipeId: parseInt(recipeId, 10),
            title: recipe.title,
            image: recipe.image,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
          }),
        });

        if (!response.ok) throw new Error("Failed to save recipe");
        setIsSaved(true);
        showToast("Added to favorites", "success");
      }
    } catch (error) {
      console.error("Error toggling recipe save:", error);
      showToast("Could not update favorites. Try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (message, type = "info", duration = 2000) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), duration);
  };

  if (loading) return <LoadingSpinner message="Loading recipe details..." />;

  const youtubeVideoId = getYouTubeVideoId(recipe?.youtubeUrl);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeVideoId);
  const youtubeThumbnailUrl = getYouTubeThumbnailUrl(youtubeVideoId);

  return (
    <View style={recipeDetailStyles.container}>
      <ToastPopup visible={toastVisible} message={toastMessage} type={toastType} />
      <ScrollView showsHorizontalScrollIndicator={false}>
        {/* HEADER */}
        <View style={recipeDetailStyles.headerContainer}>
          <View style={recipeDetailStyles.imageContainer}>
            <Image
              source={{ uri: recipe.image }}
              style={recipeDetailStyles.headerImage}
              contentFit="cover"
            />
          </View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}
            style={recipeDetailStyles.gradientOverlay}
          />

          <View style={recipeDetailStyles.floatingButtons}>
            <TouchableOpacity
              style={recipeDetailStyles.floatingButton}
              onPress={() => {
                if (isUserRecipe) {
                  router.replace("/(tabs)/favorites");
                } else {
                  router.back();
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            {isUserRecipe ? (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={[
                    recipeDetailStyles.floatingButton,
                    { backgroundColor: COLORS.primary },
                  ]}
                  onPress={() => router.push(`/recipe/edit/${recipeId}`)}
                >
                  <Ionicons name="create-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    recipeDetailStyles.floatingButton,
                    { backgroundColor: isDeleting ? COLORS.gray : "#FF3B30" },
                  ]}
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  <Ionicons
                    name={isDeleting ? "hourglass" : "trash-outline"}
                    size={24}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  recipeDetailStyles.floatingButton,
                  { backgroundColor: isSaving ? COLORS.gray : COLORS.primary },
                ]}
                onPress={handleToggleSave}
                disabled={isSaving}
              >
                <Ionicons
                  name={isSaving ? "hourglass" : isSaved ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Title Section */}
          <View style={recipeDetailStyles.titleSection}>
            <View style={recipeDetailStyles.categoryBadge}>
              <Text style={recipeDetailStyles.categoryText}>{recipe.category}</Text>
            </View>
            <Text style={recipeDetailStyles.recipeTitle}>{recipe.title}</Text>
            {isUserRecipe && (
              <View style={recipeDetailStyles.categoryBadge}>
                <Text style={recipeDetailStyles.categoryText}>You added this</Text>
              </View>
            )}
            {recipe.area && (
              <View style={recipeDetailStyles.locationRow}>
                <Ionicons name="location" size={16} color={COLORS.white} />
                <Text style={recipeDetailStyles.locationText}>{recipe.area} Cuisine</Text>
              </View>
            )}
          </View>
        </View>

        <View style={recipeDetailStyles.contentSection}>
          {/* QUICK STATS */}
          <View style={recipeDetailStyles.statsContainer}>
            <View style={recipeDetailStyles.statCard}>
              <LinearGradient
                colors={["#FF6B6B", "#FF8E53"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name="time" size={20} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.statValue}>{recipe.cookTime}</Text>
              <Text style={recipeDetailStyles.statLabel}>Prep Time</Text>
            </View>

            <View style={recipeDetailStyles.statCard}>
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name="people" size={20} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.statValue}>{recipe.servings}</Text>
              <Text style={recipeDetailStyles.statLabel}>Servings</Text>
            </View>
          </View>

          {recipe.youtubeUrl && youtubeVideoId && (
            <View style={recipeDetailStyles.sectionContainer}>
              <View style={recipeDetailStyles.sectionTitleRow}>
                <LinearGradient
                  colors={["#FF0000", "#CC0000"]}
                  style={recipeDetailStyles.sectionIcon}
                >
                  <Ionicons name="play" size={16} color={COLORS.white} />
                </LinearGradient>

                <Text style={recipeDetailStyles.sectionTitle}>Video Tutorial</Text>
              </View>

              <View style={recipeDetailStyles.videoCard}>
                {!showVideo ? (
                  <TouchableOpacity
                    style={recipeDetailStyles.videoThumbnailButton}
                    activeOpacity={0.9}
                    onPress={() => setShowVideo(true)}
                  >
                    <Image
                      source={{ uri: youtubeThumbnailUrl }}
                      style={recipeDetailStyles.videoThumbnail}
                      contentFit="cover"
                      transition={300}
                    />
                    <View style={recipeDetailStyles.videoThumbnailOverlay} />
                    <View style={recipeDetailStyles.videoPlayButton}>
                      <Ionicons name="play" size={28} color={COLORS.white} />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <WebView
                    style={recipeDetailStyles.webview}
                    source={{ uri: youtubeEmbedUrl }}
                    allowsFullscreenVideo
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled
                    domStorageEnabled
                    originWhitelist={["*"]}
                  />
                )}
              </View>
            </View>
          )}

          {/* INGREDIENTS SECTION */}
          <View style={recipeDetailStyles.sectionContainer}>
            <View style={recipeDetailStyles.sectionTitleRow}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary + "80"]}
                style={recipeDetailStyles.sectionIcon}
              >
                <Ionicons name="list" size={16} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.sectionTitle}>Ingredients</Text>
              <View style={recipeDetailStyles.countBadge}>
                <Text style={recipeDetailStyles.countText}>{recipe.ingredients.length}</Text>
              </View>
            </View>

            <View style={recipeDetailStyles.ingredientsGrid}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={recipeDetailStyles.ingredientCard}>
                  <View style={recipeDetailStyles.ingredientNumber}>
                    <Text style={recipeDetailStyles.ingredientNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={recipeDetailStyles.ingredientText}>{ingredient}</Text>
                  <View style={recipeDetailStyles.ingredientCheck}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.textLight} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* INSTRUCTIONS SECTION */}
          <View style={recipeDetailStyles.sectionContainer}>
            <View style={recipeDetailStyles.sectionTitleRow}>
              <LinearGradient
                colors={["#9C27B0", "#673AB7"]}
                style={recipeDetailStyles.sectionIcon}
              >
                <Ionicons name="book" size={16} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.sectionTitle}>Instructions</Text>
              <View style={recipeDetailStyles.countBadge}>
                <Text style={recipeDetailStyles.countText}>{recipe.instructions.length}</Text>
              </View>
            </View>

            <View style={recipeDetailStyles.instructionsContainer}>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={recipeDetailStyles.instructionCard}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primary + "CC"]}
                    style={recipeDetailStyles.stepIndicator}
                  >
                    <Text style={recipeDetailStyles.stepNumber}>{index + 1}</Text>
                  </LinearGradient>
                  <View style={recipeDetailStyles.instructionContent}>
                    <Text style={recipeDetailStyles.instructionText}>{instruction}</Text>
                    <View style={recipeDetailStyles.instructionFooter}>
                      <Text style={recipeDetailStyles.stepLabel}>Step {index + 1}</Text>
                      <TouchableOpacity style={recipeDetailStyles.completeButton}>
                        <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {!isUserRecipe && (
            <TouchableOpacity
              style={recipeDetailStyles.primaryButton}
              onPress={handleToggleSave}
              disabled={isSaving}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary + "CC"]}
                style={recipeDetailStyles.buttonGradient}
              >
                <Ionicons name="heart" size={20} color={COLORS.white} />
                <Text style={recipeDetailStyles.buttonText}>
                  {isSaved ? "Remove from Favorites" : "Add to Favorites"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {isUserRecipe && (
            <TouchableOpacity
              style={[recipeDetailStyles.primaryButton, { opacity: isDeleting ? 0.6 : 1 }]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <LinearGradient
                colors={["#FF3B30", "#FF2D55"]}
                style={recipeDetailStyles.buttonGradient}
              >
                <Ionicons name="trash" size={20} color={COLORS.white} />
                <Text style={recipeDetailStyles.buttonText}>
                  {isDeleting ? "Deleting..." : "Delete Recipe"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipeDetailScreen;