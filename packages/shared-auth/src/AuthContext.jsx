import { createContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "./firebase.js";

export const AuthContext = createContext({});

const AUTH_STORAGE_KEY = "expense_tracker_auth_cache";
const CACHE_DURATION = 5 * 60 * 1000;

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cached = localStorage.getItem(AUTH_STORAGE_KEY);
      if (cached) {
        const { user, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return user;
        }
      }
    } catch (error) {
      console.error("Error reading auth cache:", error);
    }
    return null;
  });
  const [loading, setLoading] = useState(!currentUser);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async (useMobile = false) => {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");

    if (useMobile) {
      return signInWithRedirect(auth, provider);
    } else {
      return signInWithPopup(auth, provider);
    }
  };

  const setupRecaptcha = (elementId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired");
        },
      });
    }
    return window.recaptchaVerifier;
  };

  const sendPhoneOTP = async (phoneNumber) => {
    try {
      const recaptchaVerifier = setupRecaptcha("recaptcha-container");
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      window.confirmationResult = confirmationResult;
      return confirmationResult;
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      throw error;
    }
  };

  const verifyPhoneOTP = async (otp) => {
    try {
      if (!window.confirmationResult) {
        throw new Error(
          "No confirmation result found. Please request OTP again."
        );
      }
      const result = await window.confirmationResult.confirm(otp);
      return result.user;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        try {
          const userCache = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          };
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({
              user: userCache,
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.error("Error caching auth state:", error);
        }
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    });

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          setCurrentUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    sendPhoneOTP,
    verifyPhoneOTP,
    setupRecaptcha,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
