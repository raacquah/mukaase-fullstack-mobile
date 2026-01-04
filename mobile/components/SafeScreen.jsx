import { View, StyleSheet, Keyboard, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useSegments } from "expo-router";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";

const SafeScreen = ({ children }) => {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const kenteOpacity = useRef(new Animated.Value(1)).current;
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Show kente only on auth screens (sign-in/sign-up/verify-email).
  // Group names may or may not appear in `segments`, so we also match route names.
  const showKenteNotch =
    segments?.includes("(auth)") ||
    segments?.includes("sign-in") ||
    segments?.includes("sign-up") ||
    segments?.includes("verify-email");

  useEffect(() => {
    if (!showKenteNotch) return;

    const fadeTo = (toValue) => {
      Animated.timing(kenteOpacity, {
        toValue,
        duration: 180,
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardOpen(true);
      fadeTo(0.0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOpen(false);
      fadeTo(1);
    });

    return () => {
      showSub?.remove?.();
      hideSub?.remove?.();
    };
  }, [showKenteNotch, kenteOpacity]);

  return (
    <View style={styles.root}>
      {showKenteNotch && <StatusBar style={keyboardOpen ? "dark" : "light"} />}
      {showKenteNotch && (
        <Animated.View style={{ opacity: kenteOpacity }}>
          <Image
            source={require("../assets/images/kente1.jpg")}
            contentFit="cover"
            pointerEvents="none"
            style={[styles.kenteNotch, { height: Math.max(insets.top, 44) }]}
          />
        </Animated.View>
      )}
      <View style={[styles.content, { paddingTop: insets.top }]}>{children}</View>
    </View>
  );
};
export default SafeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  kenteNotch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 10,
  },
});