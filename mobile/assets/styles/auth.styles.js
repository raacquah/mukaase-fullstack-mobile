import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

const { height } = Dimensions.get("window");

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 0,
    justifyContent: "center", // center content vertically so form sits in middle
    alignItems: "center", // center content horizontally
  },
  imageContainerSignIn: {
    height: height * 0.18,
    marginTop: 50,
    marginBottom: 130,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainerSignUp: {
    height: height * 0.18,
    marginTop: 70,
    marginBottom: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  imageSignIn: {
    width: 410,
    height: 410,
  },
  imageSignUp: {
    width: 260,
    height: 260,
  },
  title: {
                      // Change font family here
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 3,
  },
  brandSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 18,
  },
  typingTextContainer: {
    height: 80,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {    // Return to work on this
    width: "100%",           // take full width inside ScrollView padding
    alignItems: "center",    // center children horizontally
    justifyContent: "center",
    marginTop: 3,
    marginBottom: 100,
  },
  inputContainer: {
    width: "100%",           // ensure input and eye button align to full width
    marginTop: 15,
    marginBottom: 20,
    position: "relative",
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: "100%", // full width inside the centered formContainer
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 0,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 100,
    marginTop: 5,
    marginBottom: 5,
    width: "100%", // full width
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 100,
    marginTop: 5,
    marginBottom: 5,
    width: "100%", // full width
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  linkContainer: {
    alignItems: "center",
    paddingTop: 10,
    width: "100%",
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});