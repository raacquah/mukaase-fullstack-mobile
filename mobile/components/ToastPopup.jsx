import { COLORS } from "@/constants/colors";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, StyleSheet } from "react-native";

const ToastPopup = ({ visible, message, type = "info" }) => {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 30, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  if (!message) return null;

  const backgroundColor =
    type === "success" ? COLORS.primary : type === "error" ? "#e74c3c" : "#3498db";

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.container, { transform: [{ translateY }], opacity }]}
    >
      <TouchableOpacity activeOpacity={0.9} style={[styles.toast, { backgroundColor }]}> 
        <Text style={styles.message}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
    paddingTop: 18,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginHorizontal: 16,
    minWidth: 160,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  message: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default ToastPopup;
