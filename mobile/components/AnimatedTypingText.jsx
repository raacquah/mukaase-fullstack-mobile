import { useState, useEffect, useRef } from "react";
import { Text } from "react-native";

const phrases = [
  "Your next masterpiece is one click away.",
  "Turn \"What's for dinner?\" into \"This is amazing!\"",
  "The home for your culinary legacy.",
  "Unlock your digital cookbook.",
  "Ready to whip up something new?",
  "Sign in and start seasoning.",
  "Welcome back to the table.",
  "Save your favorites, share the flavor.",
  "A world of taste, organized by you.",
  "Cook. Save. Repeat.",
];

const AnimatedTypingText = ({ style }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const usedIndicesRef = useRef([]);
  const timeoutRef = useRef(null);

  // Get a random phrase index that hasn't been used recently
  const getRandomPhraseIndex = () => {
    // If all phrases have been used, reset
    if (usedIndicesRef.current.length >= phrases.length) {
      usedIndicesRef.current = [];
    }

    // Get available indices (not in usedIndices)
    const availableIndices = phrases
      .map((_, index) => index)
      .filter((index) => !usedIndicesRef.current.includes(index));

    // Pick a random one
    const randomIndex = availableIndices[
      Math.floor(Math.random() * availableIndices.length)
    ];

    // Add to used indices
    usedIndicesRef.current = [...usedIndicesRef.current, randomIndex];

    return randomIndex;
  };

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    if (isTyping && !isDeleting) {
      // Typing phase
      if (displayedText.length < currentPhrase.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
        }, 50); // Typing speed: 50ms per character
      } else {
        // Finished typing, wait before deleting
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, 2000); // Wait 2 seconds before deleting
      }
    } else if (isDeleting) {
      // Deleting phase
      if (displayedText.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 30); // Deleting speed: 30ms per character (faster)
      } else {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        const nextIndex = getRandomPhraseIndex();
        setCurrentPhraseIndex(nextIndex);
        // Small delay before starting to type next phrase
        timeoutRef.current = setTimeout(() => {
          setIsTyping(true);
        }, 300);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayedText, isTyping, isDeleting, currentPhraseIndex]);

  // Initialize with first random phrase
  useEffect(() => {
    const initialIndex = getRandomPhraseIndex();
    setCurrentPhraseIndex(initialIndex);
  }, []);

  return (
    <Text style={style}>
      {displayedText}
      <Text style={{ opacity: 0.5 }}>|</Text>
    </Text>
  );
};

export default AnimatedTypingText;

