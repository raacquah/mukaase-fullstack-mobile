import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, Keyboard} from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router'
import { useSignIn } from "@clerk/clerk-expo";
import { getReactNavigationScreensConfig } from 'expo-router/build/getReactNavigationConfig';
import { authStyles } from '@/assets/styles/auth.styles';
import { Image } from "expo-image";
import { COLORS } from '@/constants/colors';
import { Ionicons } from "@expo/vector-icons";
import AnimatedTypingText from '@/components/AnimatedTypingText';

const SignInScreen = () => {
  const router = useRouter();

  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  const scrollToInput = (inputRef) => {
    setTimeout(() => {
      if (inputRef.current && scrollViewRef.current) {
        try {
          inputRef.current.measure((x, y, width, height, pageX, pageY) => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({ y: Math.max(0, pageY - 150), animated: true });
            }
          });
        } catch (error) {
          // If measure fails, just scroll a bit to ensure input is visible
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }
    }, 300);
  };

  const handleSignIn = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please enter both your email and password");
    return;
  }

  if (!isLoaded) return;
  if (loading) return; // prevent double-submit

  setLoading(true);

  try {
    const signInAttempt = await signIn.create({
      identifier: email.trim().toLowerCase(),
      password,
    });

    if (signInAttempt.status === "complete") {
      await setActive({ session: signInAttempt.createdSessionId });
      router.replace("/(tabs)"); // replace avoids back-nav to login
      return;
    }

    // Unexpected states (rare but possible)
    console.warn("Unexpected sign-in state:", signInAttempt.status);

  } catch (err) {
    console.error("Sign-in error:", JSON.stringify(err, null, 2));

    const message =
      err?.errors?.[0]?.message ||
      (err?.message ?? "Sign-in failed. Please try again.");

    Alert.alert("Error", message);

  } finally {
    setLoading(false);
  }
};


  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={authStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
          <View style={authStyles.imageContainerSignIn}>
            <Image 
              source={require("../../assets/images/i1.png")} 
              style={authStyles.imageSignIn}
              contentFit="contain"
            />
          </View>

          <View style={authStyles.typingTextContainer}>
            <AnimatedTypingText style={authStyles.title} />
          </View>

          {/* Text input Container */}
          <View style={authStyles.formContainer}>
            {/* Email Input */}
            <TextInput 
              ref={emailInputRef}
              style={authStyles.textInput}
              placeholder='Enter email'
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
              onFocus={() => scrollToInput(emailInputRef)}
            />

            {/* Password Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                ref={passwordInputRef}
                style={authStyles.textInput}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                onFocus={() => scrollToInput(passwordInputRef)}
              />

              <TouchableOpacity
                style={authStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[authStyles.button, loading && authStyles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.6}
            >
              <Text style={authStyles.buttonText}>
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity
            style={authStyles.linkContainer}
            onPress={() => router.push("/(auth)/sign-up")}
            activeOpacity={0.7}
          >
            <Text style={authStyles.linkText}>New to Mukaase?
              <Text style={authStyles.link}>Create an account</Text>
            </Text>
          </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignInScreen;