import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { useFonts } from "expo-font";

const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [fontsLoaded] = useFonts({
  Raleway: require("../../assets/fonts/Raleway-Bold.ttf"),
  });

  if (!isLoaded || !fontsLoaded) return null;

  if (!isSignedIn) return <Redirect href={"/(auth)/sign-in"} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          paddingBottom: 8,
          paddingTop: 8,
          height: 75,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: COLORS.background,
          borderBottomColor: COLORS.background,
          borderBottomWidth: 0.5,
          height: 40,               
          // paddingTop: 0,            
          // paddingBottom: 5,
          },
        headerTitleStyle: {
          marginTop: 0,
          lineHeight: 56,           
          marginTop: -85,           
          lineHeight: 0,
          fontFamily: "Raleway",
          fontSize: 27,
          color: COLORS.primary
        },
        headerTitleContainerStyle: {
          paddingVertical: 0,
        },
        headerLeftContainerStyle: {
          paddingVertical: 0,
        },
        headerRightContainerStyle: {
          paddingVertical: 0,
        },
        }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
};
export default TabsLayout;