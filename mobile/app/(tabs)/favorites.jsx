import { View, Text, Alert, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useCallback, useState } from "react";
import { API_URL } from "../../constants/api";
import { favoritesStyles } from "../../assets/styles/favorites.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import NoFavoritesFound from "../../components/NoFavoritesFound";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

const FavoritesScreen = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadAll = async () => {
        setLoading(true);
      try {
        const [favoritesRes, userRecipesRes] = await Promise.allSettled([
          fetch(`${API_URL}/favorites/${user.id}`),
          fetch(`${API_URL}/user-recipes/${user.id}`),
        ]);

        const favorites =
          favoritesRes.status === "fulfilled" && favoritesRes.value.ok
            ? await favoritesRes.value.json()
            : [];

        const myRecipes =
          userRecipesRes.status === "fulfilled" && userRecipesRes.value.ok
            ? await userRecipesRes.value.json()
            : [];

        // transform favorites to match RecipeCard expected format
        const transformedFavorites = favorites.map((favorite) => ({
          ...favorite,
          id: favorite.recipeId,
          source: "mealdb",
        }));

        const transformedUserRecipes = (Array.isArray(myRecipes) ? myRecipes : []).map((r) => ({
          ...r,
          source: "user",
          isUserRecipe: true,
        }));

        if (!isActive) return;
        setFavoriteRecipes(transformedFavorites);
        setUserRecipes(transformedUserRecipes);
      } catch (error) {
        console.log("Error loading favorites", error);
        if (isActive) Alert.alert("Error", "Failed to load favorites");
      } finally {
        if (isActive) setLoading(false);
      }
    };

      loadAll();
      return () => {
        isActive = false;
      };
    }, [user.id])
  );

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  };

  // Get user's name from Clerk
  const getUserDisplayName = () => {
    const firstName = user?.firstName;
    if (firstName) {
      return `${firstName}'s Faves`;
    }
    return "Favorites";
  };

  if (loading) return <LoadingSpinner message="Loading favorites..." />;

  const showEmpty = userRecipes.length === 0 && favoriteRecipes.length === 0;

  return (
    <View style={favoritesStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={favoritesStyles.header}>
          <Text style={favoritesStyles.title}>
            {getUserDisplayName()}
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={favoritesStyles.logoutButton}
              onPress={() => router.push("/recipe/new")}
            >
              <Ionicons name="add" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={favoritesStyles.logoutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={favoritesStyles.recipesSection}>
          
          {/* Your recipes */}
          {userRecipes.length > 0 && (
            <>
              <Text style={favoritesStyles.sectionTitle}>My recipes</Text>
              <FlatList
                data={userRecipes}
                renderItem={({ item }) => <RecipeCard recipe={item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={favoritesStyles.row}
                contentContainerStyle={favoritesStyles.recipesGrid}
                scrollEnabled={false}
              />
            </>
          )}

          {/* Saved favorites */}
          {favoriteRecipes.length > 0 && (
            <>
              <Text style={favoritesStyles.sectionTitle}>Favorite recipes</Text>
              <FlatList
                data={favoriteRecipes}
                renderItem={({ item }) => <RecipeCard recipe={item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={favoritesStyles.row}
                contentContainerStyle={favoritesStyles.recipesGrid}
                scrollEnabled={false}
              />
            </>
          )}

          {showEmpty && <NoFavoritesFound />}
        </View>
      </ScrollView>
    </View>
  );
};
export default FavoritesScreen;