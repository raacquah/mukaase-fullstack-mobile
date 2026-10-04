import * as React from 'react';
import { useState, useRef } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, Keyboard } from 'react-native';
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
  
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = useState(false);
  
  const firstNameInputRef = useRef(null);
  const lastNameInputRef = useRef(null);
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

  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const email = emailAddress.trim().toLowerCase();

  if (!trimmedFirstName || !trimmedLastName || !email || !password?.trim()) {
    return Alert.alert("Missing Fields", "Please complete all fields");
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
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
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
        keyboardVerticalOffset={0}
        style={authStyles.keyboardView}>
        
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={authStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive">

          <View style={authStyles.imageContainerSignUp}>
            <Image 
              source={require("../../assets/images/i2.png")}
              style={authStyles.imageSignUp}
              contentFit="contain"
            />
          </View>
          <Text style={authStyles.brandTitle}>Mukaase</Text>
          <Text style={authStyles.brandSubtitle}>Join the Family</Text>

            {/* Form inputs */}
            <View style={authStyles.formContainer}>
            {/* First Name input */}
            <TextInput
              ref={firstNameInputRef}
              style={authStyles.textInput}
              placeholder='First name'
              placeholderTextColor={COLORS.textLight}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize='words'
              returnKeyType="next"
              onSubmitEditing={() => lastNameInputRef.current?.focus()}
              blurOnSubmit={false}
              onFocus={() => scrollToInput(firstNameInputRef)}
            />

            {/* Last Name input */}
            <TextInput
              ref={lastNameInputRef}
              style={[authStyles.textInput, { marginTop: 15 }]}
              placeholder='Last name'
              placeholderTextColor={COLORS.textLight}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize='words'
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              blurOnSubmit={false}
              onFocus={() => scrollToInput(lastNameInputRef)}
            />

            {/* Email input */}
            <TextInput
              ref={emailInputRef}
              style={[authStyles.textInput, { marginTop: 15 }]}
              placeholder='Enter email'
              placeholderTextColor={COLORS.textLight}
              value={emailAddress}
              onChangeText={setEmailAddress}
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
        

