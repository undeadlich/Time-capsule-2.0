import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import PropTypes from "prop-types";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";

const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: "AIzaSyB4dJU_pMvB79Jy7SDTlik3GC_wmyUGy8I",
  authDomain: "timecapsule-5ce63.firebaseapp.com",
  projectId: "timecapsule-5ce63",
  storageBucket: "timecapsule-5ce63.appspot.com",
  messagingSenderId: "1001064662306",
  appId: "1:1001064662306:web:2af6174250a8ecc280917b",
};

export const useFirebase = () => useContext(FirebaseContext);

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

const googleProvider = new GoogleAuthProvider();

// Cloudinary Details
const CLOUDINARY_CLOUD_NAME = "dahbv7vtu";
const CLOUDINARY_UPLOAD_PRESET = "TimeCapsule";

export const FirebaseProvider = (props) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        setUser(user);
        await ensureUserMedia(user.uid);
      } else {
        setUser(null);
      }
    });
  }, []);

  const signupUserWithEmailAndPassword = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await addUser(userCredential.user.uid, { email });
    return userCredential;
  };

  const singinUserWithEmailAndPass = (email, password) =>
    signInWithEmailAndPassword(firebaseAuth, email, password);

  const signinWithGoogle = async () => {
    const userCredential = await signInWithPopup(firebaseAuth, googleProvider);
    await addUser(userCredential.user.uid, { email: userCredential.user.email });
    return userCredential;
  };

  const isLoggedIn = !!user;

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const addUser = async (userId, userData) => {
    try {
      await setDoc(doc(firestore, "users", userId), userData);
      await ensureUserMedia(userId);
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload to Cloudinary");

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };

  const ensureUserMedia = async (userId) => {
    try {
      const userMediaRef = doc(firestore, "userMedia", userId);
      const userMediaSnap = await getDoc(userMediaRef);
      if (!userMediaSnap.exists()) {
        await setDoc(userMediaRef, { capsules: [], albums: [] });
        console.log("User media created successfully.");
      }
    } catch (error) {
      console.error("Error ensuring user media:", error);
    }
  };

  const updateUserMedia = async (userId, contentId, type) => {
    if (!userId) {
      console.error("No user ID provided.");
      return;
    }

    const userMediaRef = doc(firestore, "userMedia", userId);

    try {
      await ensureUserMedia(userId);

      await setDoc(
        userMediaRef,
        {
          [type === "capsule" ? "capsules" : "albums"]: arrayUnion(contentId),
        },
        { merge: true }
      );

      console.log(`Added ${contentId} to userMedia.`);
    } catch (error) {
      console.error("Error updating userMedia:", error);
    }
  };

  const getUserMedia = async (userId) => {
    if (!userId) {
      console.error("No user ID provided.");
      return { capsules: [], albums: [] };
    }

    const userMediaRef = doc(firestore, "userMedia", userId);

    try {
      const userMediaSnap = await getDoc(userMediaRef);
      if (userMediaSnap.exists()) {
        return userMediaSnap.data();
      }
    } catch (error) {
      console.error("Error fetching userMedia:", error);
    }

    return { capsules: [], albums: [] };
  };

  const addContent = async (contentData) => {
    const { type, name, note, files, lockUntil, recipients, albumType } = contentData;
    const collectionName = type === "capsule" ? "capsules" : "albums";
    const fileURLs = [];
    
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      if (url) fileURLs.push(url);
    }

    const dataToStore = {
      name,
      note,
      files: fileURLs,
      createdBy: user?.uid,
      createdAt: new Date(),
    };

    if (type === "capsule") {
      dataToStore.lockUntil = lockUntil;
      dataToStore.recipients = Array.isArray(recipients)
        ? recipients
        : recipients?.split(",").map((email) => email.trim()) || [];
    } else if (type === "album") {
      dataToStore.albumType = albumType;
    }

    try {
      const docRef = await addDoc(collection(firestore, collectionName), dataToStore);
      const contentId = docRef.id;
      await updateUserMedia(user?.uid, contentId, type);
      return contentId;
    } catch (error) {
      console.error(`Error adding ${collectionName} to Firestore:`, error);
      return null;
    }
  };

  return (
    <FirebaseContext.Provider value={{ signinWithGoogle, signupUserWithEmailAndPassword, singinUserWithEmailAndPass, isLoggedIn, user, addUser, logout, addContent, addUserMedia: ensureUserMedia, getUserMedia }}>
      {props.children}
    </FirebaseContext.Provider>
  );
};

FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
