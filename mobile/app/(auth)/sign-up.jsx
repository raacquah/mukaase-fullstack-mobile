import * as React from 'react';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { authStyles } from '@/assets/styles/auth.styles';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import VerifyEmail from './verify-email';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = useState(false);
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  

if (pendingVerification) { 
  return (
  <VerifyEmail 
  email={emailAddress}
  onBack={() => setPendingVerification (false)} 
    />
  );
}


const handleSignUp = async () => {
  if (loading) return;

  const email = emailAddress.trim().toLowerCase();

  if (!email || !password?.trim()) {
    return Alert.alert("Missing Fields", "Please complete both fields");
  }

  if (!emailRegex.test(email)) {
    return Alert.alert("Invalid Email", "Please enter a valid email address");
  }

  if (password.length < 6) {
    return Alert.alert("Weak Password", "Password must be at least 6 characters");
  }

  if (!isLoaded) return;

  setLoading(true);

  try {
    const signUpAttempt = await signUp.create({
      emailAddress: email,
      password,
    });

    // store sign-up id for verification screen
    await AsyncStorage.setItem("pendingSignUpId", signUpAttempt.id);

    await signUp.prepareEmailAddressVerification({
      strategy: "email_code",
    });

    setPendingVerification(true);

  } catch (err) {
    console.log("Signup Error (raw) →", err);
    console.log("Signup Error (JSON) →", JSON.stringify(err, null, 2));

    const message =
      err?.errors?.[0]?.message ||
      "Something went wrong creating your account";

    Alert.alert("Signup Failed", message);

  } finally {
    setLoading(false);
  }
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

          <View style={authStyles.imageContainer}>
            <Image 
              source={require("../../assets/images/i2.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>
          <Text style={authStyles.title}>Create an Account</Text>

            {/* Email input */}
            <View style={authStyles.formContainer}>
            <TextInput
              style={authStyles.textInput}
              placeholder='Enter email'
              placeholderTextColor={COLORS.textLight}
              value={emailAddress}
              onChangeText={setEmailAddress}
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
            onPress={() => setShowPassword(!showPassword)}>

            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={COLORS.textLight}
            />
            </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
          <TouchableOpacity 
            style={[authStyles.button, loading && authStyles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.6}
          >
            <Text style={authStyles.buttonText}>
              {loading ? "Creating your account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity style={authStyles.linkContainer}
        onPress={() => router.back()}
        activeOpacity={0.7}>         
          <Text style={authStyles.linkText}>
            Already have an account? <Text style={authStyles.link}>Sign in</Text>
          </Text> 
        </TouchableOpacity>

      </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </View>
  )
}
        

