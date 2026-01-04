import { Redirect } from "expo-router";

// Custom 3-second splash removed: go straight into the app.
// `/(tabs)` will automatically redirect to `/(auth)/sign-in` when signed out.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}

