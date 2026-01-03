import { useSignUp } from "@clerk/clerk-expo";
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { authStyles } from "@/assets/styles/auth.styles";
import { Image } from "expo-image";
import { COLORS } from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VerifyEmail = ({email, onBack}) => {
const { isLoaded, signUp, setActive } = useSignUp();
const [code, setCode] = useState("");
const [loading, setLoading] = useState(false);

useEffect(() => {
  const loadSignUp = async () => {
    if (!isLoaded) return;

    const id = await AsyncStorage.getItem("pendingSignUpId");
    if (!id) return;

    await signUp.reload();  // ensures we're attached to same instance
  };

  loadSignUp();
}, [isLoaded]);


const handleVerification = async () => {
  if (!isLoaded) return;
  if (!code.trim()) return;

  setLoading(true);

  let isActive = true;   // 🟢 prevents alerts after unmount

  try {
    const attempt = await signUp.attemptEmailAddressVerification({ code });

    if (!isActive) return;   // screen no longer active → ignore

    if (attempt.status === "complete") {
      await setActive({ session: attempt.createdSessionId });
      router.replace("/(tabs)/home");
      return;   // 🛑 stop here, do NOT continue
    }

    if (attempt.status === "missing_requirements") {
      const done = await signUp.complete();
      await setActive({ session: done.createdSessionId });
      router.replace("/(tabs)/home");
      return;
    }

    Alert.alert("Verification Failed", "Please try again.");

  } catch (err) {
    if (!isActive) return;   // 🛑 ignore late errors

    console.log("Verification Error →", err);
    Alert.alert("Error", err?.errors?.[0]?.message || "Verification failed");

  } finally {
    setLoading(false);
  }

  return () => { isActive = false };  // 🟢 cancel pending callback
};








  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={authStyles.keyboardView}>
        
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
            
            {/* Image Container */}
            <View style={authStyles.imageContainer}>
            <Image 
            source={require("../../assets/images/i3.png")}
            style={authStyles.image}
            contentFit="contain"
            />
            </View>
            {/* Title */}
          <Text style={authStyles.title}>Verify Your Email</Text>
          <Text style={authStyles.subtitle}>We sent a verification code to {email}</Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
                
              <TextInput 
                style={authStyles.textInput}
                placeholder='Enter verification code'
                placeholderTextColor={COLORS.textLight}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoCapitalize='none'        
              />
              </View>

              <TouchableOpacity
                style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                onPress={handleVerification}
                disabled={loading}
                activeOpacity={0.8}>
                  <Text style={authStyles.buttonText}>{loading ? "Verifying..." : "Verify Email"}</Text>
              </TouchableOpacity>

              {/* Back to sign Up */}
              <TouchableOpacity style={authStyles.linkContainer} onPress={onBack}>
                <Text style={authStyles.linkText}>
                  <Text style={authStyles.link}>Back to SignUp</Text>
                </Text>

              </TouchableOpacity>

          </View>
        </ScrollView>

      </KeyboardAvoidingView>
    </View>
  )
}

export default VerifyEmail