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
} from "firebase/auth";
import {
  //getFirestore,
  // collection,
  // addDoc,
  // getDocs,
  // getDoc,
  // doc,
  // query,
  // where,
} from "firebase/firestore";
//import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const FirebaseContext = createContext(null);

const firebaseConfig = {
    apiKey: "AIzaSyB4dJU_pMvB79Jy7SDTlik3GC_wmyUGy8I",
    authDomain: "timecapsule-5ce63.firebaseapp.com",
    projectId: "timecapsule-5ce63",
    storageBucket: "timecapsule-5ce63.firebasestorage.app",
    messagingSenderId: "1001064662306",
    appId: "1:1001064662306:web:2af6174250a8ecc280917b"
};

export const useFirebase = () => useContext(FirebaseContext);

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
// const firestore = getFirestore(firebaseApp);
// const storage = getStorage(firebaseApp);

const googleProvider = new GoogleAuthProvider();

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

  

  const isLoggedIn = user ? true : false;

  return (
    <FirebaseContext.Provider
      value={{
        signinWithGoogle,
        signupUserWithEmailAndPassword,
        singinUserWithEmailAndPass,
        isLoggedIn,
        user,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};

FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};