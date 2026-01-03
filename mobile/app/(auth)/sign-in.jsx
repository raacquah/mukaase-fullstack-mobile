import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router'
import { useSignIn } from "@clerk/clerk-expo";
import { getReactNavigationScreensConfig } from 'expo-router/build/getReactNavigationConfig';
import { authStyles } from '@/assets/styles/auth.styles';
import { Image } from "expo-image";
import { COLORS } from '@/constants/colors';
import { Ionicons } from "@expo/vector-icons";

const SignInScreen = () => {
  const router = useRouter();

  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      router.replace("/(tabs)/home"); // replace avoids back-nav to login
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 140 : 0} // reduce offset for smoother lift
        contentInsetAdjustmentBehavior="automatic"
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.imageContainer}>
            <Image 
              source={require("../../assets/images/i1.png")} 
              style={authStyles.image}
              contentFit="contain"
            />
          </View>
          <Text style={authStyles.title}>Welcome Back</Text>

          {/* Text input Container */}
          <View style={authStyles.formContainer}>
            {/* Email Input */}
            <TextInput 
              style={authStyles.textInput}
              placeholder='Enter email'
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'        
            />

            {/* Password Input */}
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
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
            <Text style={authStyles.linkText}>
              New to Flavor Bank? <Text style={authStyles.link}>Create an account</Text>
            </Text>
          </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignInScreen;