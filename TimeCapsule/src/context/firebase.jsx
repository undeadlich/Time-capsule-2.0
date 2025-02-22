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
} from "firebase/firestore";

const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: "AIzaSyB4dJU_pMvB79Jy7SDTlik3GC_wmyUGy8I",
  authDomain: "timecapsule-5ce63.firebaseapp.com",
  projectId: "timecapsule-5ce63",
  storageBucket: "timecapsule-5ce63.appspot.com",
  messagingSenderId: "1001064662306",
  appId: "1:1001064662306:web:2af6174250a8ecc280917b"
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
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) setUser(user);
      else setUser(null);
    });
  }, []);

  const signupUserWithEmailAndPassword = (email, password) =>
    createUserWithEmailAndPassword(firebaseAuth, email, password);

  const singinUserWithEmailAndPass = (email, password) =>
    signInWithEmailAndPassword(firebaseAuth, email, password);

  const signinWithGoogle = () => signInWithPopup(firebaseAuth, googleProvider);

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
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload to Cloudinary");

      const data = await response.json();
      return data.secure_url; // URL of the uploaded file
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };

  const addContent = async (contentData) => {
    const { type, name, note, files, lockUntil, recipients, albumType } = contentData;
    const collectionName = type === "capsule" ? "capsules" : "albums";
    
    console.log("Content Type:", type); // Debug: Check content type
    console.log("Firestore Collection:", collectionName); // Debug: Check collection name
  
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
      dataToStore.recipients = 
  typeof recipients === "string"
    ? recipients.split(",").map((email) => email.trim())
    : Array.isArray(recipients)
    ? recipients  // If already an array, use as is
    : [];
    } else if (type === "album") {
      dataToStore.albumType = albumType;
    }
  
    try {
      const docRef = await addDoc(collection(firestore, collectionName), dataToStore);
      console.log(`Content added successfully to ${collectionName} with ID:`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding ${collectionName} to Firestore:`, error);
      return null;
    }
  };

  const getUserCapsules = async (user) => {
    if (!user?.uid) {
      console.error("No user logged in.");
      return [];
    }
  
    const userId = user.uid;
    const capsules = [];
  
    try {
      const capsulesQuery = query(collection(firestore, "capsules"), where("createdBy", "==", userId));
      const capsulesSnapshot = await getDocs(capsulesQuery);
  
      capsulesSnapshot.forEach((doc) => {
        capsules.push({ id: doc.id, ...doc.data() }); // Fetch full document
      });
      console.log("Capsules:", capsules); // Debug: Check capsules fetched
      return capsules;
    } catch (error) {
      console.error("Error fetching capsules:", error);
      return [];
    }
  };
  
  const getUserAlbums = async (user) => {
    if (!user?.uid) {
      console.error("No user logged in.");
      return [];
    }
  
    const userId = user.uid;
    const albums = [];
  
    try {
      const albumsQuery = query(collection(firestore, "albums"), where("createdBy", "==", userId));
      const albumsSnapshot = await getDocs(albumsQuery);
  
      albumsSnapshot.forEach((doc) => {
        albums.push({ id: doc.id, ...doc.data() }); // Fetch full document
      });
      console.log("Albums:", albums); // Debug: Check albums fetched
  
      return albums;
    } catch (error) {
      console.error("Error fetching albums:", error);
      return [];
    }
  };
  

  return (
    <FirebaseContext.Provider
      value={{
        signinWithGoogle,
        signupUserWithEmailAndPassword,
        singinUserWithEmailAndPass,
        isLoggedIn,
        user,
        addUser,
        logout,
        addContent,
        getUserCapsules, // Added here ✅
        getUserAlbums, 
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};

FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
