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
  deleteDoc,
  updateDoc,
  arrayRemove,
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
    const { type, name, note, files, lockUntil, recipients, albumType,community } = contentData;
    const collectionName = type === "capsule" ? "capsules" : "albums";
    const fileURLs = [];
    
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      if (url) fileURLs.push(url);
    }
   
     const response = await fetch("http://127.0.0.1:5000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image_urls: fileURLs })
      });
  
      const data = await response.json();
      console.log("Analysis Results:", data);
      const sfwFileURLs = fileURLs.filter(url => 
        data.results.some(result => result.image_url === url && result.classification !== "NSFW")
      );
      const response1 = await fetch("http://127.0.0.1:5000/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_urls: sfwFileURLs}) // Send multiple URLs
    });

    const data1 = await response1.json();
    console.log("Processed Images:", data.results);
    
    

    const dataToStore = {
      name,
      note,
      files: sfwFileURLs,
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
      dataToStore.community = community;
    }

    try {
      
      const docRef = await addDoc(collection(firestore, collectionName), dataToStore);
      const contentId = docRef.id;
      await updateUserMedia(user?.uid, contentId, type);
      
      // For capsules, update received user media for each recipient in a new collection "recievedusermedia"
      if (type === "capsule" && dataToStore.recipients && dataToStore.recipients.length > 0) {
        for (const email of dataToStore.recipients) {
          const userQuery = query(collection(firestore, "users"), where("email", "==", email));
          const querySnapshot = await getDocs(userQuery);
          if (!querySnapshot.empty) {
            querySnapshot.forEach(async (docSnap) => {
              const recipientId = docSnap.id;
              await updateReceivedUserMedia(recipientId, contentId, "capsule");
            });
          }
        }
      }
      
      return contentId;
    } catch (error) {
      console.error(`Error adding ${collectionName} to Firestore:`, error);
      return null;
    }
  };

  // New function: Get capsule details by its ID
  const getCapsuleById = async (capsuleId) => {
    try {
      const capsuleDoc = await getDoc(doc(firestore, "capsules", capsuleId));
      if (capsuleDoc.exists()) {
        return { id: capsuleDoc.id, ...capsuleDoc.data() };
      } else {
        console.error(`No capsule found with ID: ${capsuleId}`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching capsule by ID:", error);
      return null;
    }
  };

  // New function: Get album details by its ID
  const getAlbumById = async (albumId) => {
    try {
      const albumDoc = await getDoc(doc(firestore, "albums", albumId));
      if (albumDoc.exists()) {
        return { id: albumDoc.id, ...albumDoc.data() };
      } else {
        console.error(`No album found with ID: ${albumId}`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching album by ID:", error);
      return null;
    }
  };

  // New function: Ensure received user media exists for a recipient
  const ensureReceivedUserMedia = async (userId) => {
    try {
      const receivedMediaRef = doc(firestore, "recievedusermedia", userId);
      const receivedMediaSnap = await getDoc(receivedMediaRef);
      if (!receivedMediaSnap.exists()) {
        // Create with empty arrays for pending and accepted content
        await setDoc(receivedMediaRef, { capsules: [], albums: [], acceptedCapsules: [], acceptedAlbums: [] });
        console.log("Received user media created successfully for user", userId);
      }
    } catch (error) {
      console.error("Error ensuring received user media:", error);
    }
  };
  

  // New function: Update received user media for a recipient
  
  // New function: Update received user media for a recipient
  const updateReceivedUserMedia = async (userId, contentId, type) => {
    if (!userId) {
      console.error("No recipient user ID provided.");
      return;
    }
    const receivedMediaRef = doc(firestore, "recievedusermedia", userId);
    try {
      await ensureReceivedUserMedia(userId);
      await setDoc(
        receivedMediaRef,
        {
          [type === "capsule" ? "capsules" : "albums"]: arrayUnion(contentId),
        },
        { merge: true }
      );
      console.log(`Added ${contentId} to received user media for ${userId}`);
    } catch (error) {
      console.error("Error updating received user media:", error);
    }
  };

  // New function: Delete a capsule by its ID
  const deleteCapsule = async (userId, capsuleId) => {
    try {
      await deleteDoc(doc(firestore, "capsules", capsuleId));
      const userMediaRef = doc(firestore, "userMedia", userId);
      await updateDoc(userMediaRef, {
        capsules: arrayRemove(capsuleId),
      });
      console.log(`Capsule ${capsuleId} deleted successfully.`);
      return true;
    } catch (error) {
      console.error("Error deleting capsule:", error);
      return false;
    }
  };

  // New function: Delete an album by its ID
  const deleteAlbum = async (userId, albumId) => {
    try {
      await deleteDoc(doc(firestore, "albums", albumId));
      const userMediaRef = doc(firestore, "userMedia", userId);
      await updateDoc(userMediaRef, {
        albums: arrayRemove(albumId),
      });
      console.log(`Album ${albumId} deleted successfully.`);
      return true;
    } catch (error) {
      console.error("Error deleting album:", error);
      return false;
    }
  };

  // New function: Add a photo to an album
  const addPhotoToAlbum = async (albumId, file) => {
    try {
      
      const photoUrl = await uploadToCloudinary(file);
      if (!photoUrl) throw new Error("Photo upload failed");
      console.log("Photo uploaded successfully:", photoUrl);
      const photoUrlString = String(photoUrl);
      const photoArray = [photoUrlString];
      console.log(photoArray);
      try {
        const response = await fetch("http://127.0.0.1:5000/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ image_urls: photoArray })
        });
    
        const data = await response.json();
        console.log("Analysis Results:", data);
        const isNSFW = data.results.some(result => result.classification === "NSFW");
        if (isNSFW) {
          alert("NSFW Media detected. Unable to add to album.");
          return null;
        }
      } catch (error) {
        console.error("Error analyzing media:", error);
      }
      const response1 = await fetch("http://127.0.0.1:5000/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_urls: photoArray}) // Send multiple URLs
    });

      const data1 = await response1.json();
      console.log("Processed Images:", data1.results);
      const albumRef = doc(firestore, "albums", albumId);
      await updateDoc(albumRef, {
        files: arrayUnion(photoUrl),
      });
      console.log("Photo added to album successfully:", photoUrl);
      return photoUrl;
    } catch (error) {
      console.error("Error adding photo to album:", error);
      return null;
    }
  };

  // New function: Delete a photo from an album
  const deletePhotoFromAlbum = async (albumId, photoUrl) => {
    try {
      const albumRef = doc(firestore, "albums", albumId);
      await updateDoc(albumRef, {
        files: arrayRemove(photoUrl),
      });
      console.log("Photo removed from album successfully:", photoUrl);
      return true;
    } catch (error) {
      console.error("Error deleting photo from album:", error);
      return false;
    }
  };

  // New function: Accept a received capsule or album for a recipient

  // New function: Accept a received capsule or album for a recipient
  const acceptReceivedContent = async (recipientId, contentId, type) => {
    if (!recipientId) {
      console.error("No recipient user ID provided.");
      return false;
    }
    const receivedMediaRef = doc(firestore, "recievedusermedia", recipientId);
    try {
      await ensureReceivedUserMedia(recipientId);
      // Remove from pending array
      await updateDoc(receivedMediaRef, {
        [type === "capsule" ? "capsules" : "albums"]: arrayRemove(contentId),
      });
      // Add to accepted array
      await updateDoc(
        receivedMediaRef,
        {
          [type === "capsule" ? "acceptedCapsules" : "acceptedAlbums"]: arrayUnion(contentId),
        },
        { merge: true }
      );
      console.log(`Content ${contentId} accepted for recipient ${recipientId}`);
      return true;
    } catch (error) {
      console.error("Error accepting received content:", error);
      return false;
    }
  };

  // New function: Reject (decline) a received capsule or album for a recipient
  const rejectReceivedContent = async (recipientId, contentId, type) => {
    if (!recipientId) {
      console.error("No recipient user ID provided.");
      return false;
    }
    const receivedMediaRef = doc(firestore, "recievedusermedia", recipientId);
    try {
      await ensureReceivedUserMedia(recipientId);
      // Simply remove from pending array
      await updateDoc(receivedMediaRef, {
        [type === "capsule" ? "capsules" : "albums"]: arrayRemove(contentId),
      });
      console.log(`Content ${contentId} rejected for recipient ${recipientId}`);
      return true;
    } catch (error) {
      console.error("Error rejecting received content:", error);
      return false;
    }
  };
  const getReceivedMedia = async (userId) => {
    if (!userId) {
      console.error("No user ID provided.");
      return { capsules: [], acceptedCapsules: [], albums: [], acceptedAlbums: [] };
    }
    const receivedMediaRef = doc(firestore, "recievedusermedia", userId);
    try {
      const receivedSnap = await getDoc(receivedMediaRef);
      if (receivedSnap.exists()) {
        return receivedSnap.data();
      }
    } catch (error) {
      console.error("Error fetching received media:", error);
    }
    return { capsules: [], acceptedCapsules: [], albums: [], acceptedAlbums: [] };
  };
  // New function: Get user details by user ID
const getUserById = async (userId) => {
  if (!userId) {
    console.error("No user ID provided.");
    return null;
  }
  try {
    const userRef = doc(firestore, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      console.error(`No user found with ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};
const shareAlbum = async (albumId, emailString) => {
  const emails = emailString.split(",").map(email => email.trim());
  try {
    for (const email of emails) {
      const userQuery = query(collection(firestore, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnap) => {
          const recipientId = docSnap.id;
          await updateReceivedUserMedia(recipientId, albumId, "album");
        });
      } else {
        console.warn(`No user found with email: ${email}`);
      }
    }
    return true;
  } catch (error) {
    console.error("Error sharing album:", error);
    return false;
  }
};

// Function to share a capsule with recipient(s)
const shareCapsule = async (capsuleId, emailString) => {
  const emails = emailString.split(",").map(email => email.trim());
  try {
    for (const email of emails) {
      const userQuery = query(collection(firestore, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnap) => {
          const recipientId = docSnap.id;
          await updateReceivedUserMedia(recipientId, capsuleId, "capsule");
        });
      } else {
        console.warn(`No user found with email: ${email}`);
      }
    }
    return true;
  } catch (error) {
    console.error("Error sharing capsule:", error);
    return false;
  }
};
// Function to delete an accepted capsule for a recipient
const deleteAcceptedCapsule = async (recipientId, capsuleId) => {
  if (!recipientId) {
    console.error("No recipient user ID provided.");
    return false;
  }
  const receivedMediaRef = doc(firestore, "recievedusermedia", recipientId);
  try {
    await ensureReceivedUserMedia(recipientId); // Ensure the doc exists
    await updateDoc(receivedMediaRef, {
      acceptedCapsules: arrayRemove(capsuleId)
    });
    console.log(`Accepted capsule ${capsuleId} removed for recipient ${recipientId}`);
    return true;
  } catch (error) {
    console.error("Error deleting accepted capsule:", error);
    return false;
  }
};

// Function to delete an accepted album for a recipient
const deleteAcceptedAlbum = async (recipientId, albumId) => {
  if (!recipientId) {
    console.error("No recipient user ID provided.");
    return false;
  }
  const receivedMediaRef = doc(firestore, "recievedusermedia", recipientId);
  try {
    await ensureReceivedUserMedia(recipientId); // Ensure the doc exists
    await updateDoc(receivedMediaRef, {
      acceptedAlbums: arrayRemove(albumId)
    });
    console.log(`Accepted album ${albumId} removed for recipient ${recipientId}`);
    return true;
  } catch (error) {
    console.error("Error deleting accepted album:", error);
    return false;
  }
};


const updateCapsule = async (capsuleId, updatedData) => {
  try {
    await updateDoc(doc(firestore, "capsules", capsuleId), updatedData);
    console.log(`Capsule ${capsuleId} updated successfully.`);
    return true;
  } catch (error) {
    console.error("Error updating capsule:", error);
    return false;
  }
};
const updateAlbum = async (albumId, updatedData) => {
  try {
    await updateDoc(doc(firestore, "albums", albumId), updatedData);
    console.log(`Album ${albumId} updated successfully.`);
    return true;
  } catch (error) {
    console.error("Error updating album:", error);
    return false;
  }
};
const getPublicAlbums = async () => {
  try {
    const publicAlbumsQuery = query(
      collection(firestore, "albums"),
      where("albumType", "==", "public")
    );
    const querySnapshot = await getDocs(publicAlbumsQuery);
    const publicAlbums = [];
    querySnapshot.forEach((doc) => {
      publicAlbums.push({ id: doc.id, ...doc.data() });
    });
    return publicAlbums;
  } catch (error) {
    console.error("Error fetching public albums:", error);
    return [];
  }
};

const searchPublicAlbumsByCommunity = async (communityQuery) => {
  try {
    // First, get all public albums
    const publicAlbumsQuery = query(
      collection(firestore, "albums"),
      where("albumType", "==", "public")
    );
    const querySnapshot = await getDocs(publicAlbumsQuery);
    const results = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Check if the 'community' field exists and includes the query string (case-insensitive)
      if (
        data.community &&
        data.community.toLowerCase().includes(communityQuery.toLowerCase())
      ) {
        results.push({ id: docSnap.id, ...data });
      }
    });
    return results;
  } catch (error) {
    console.error("Error searching public albums by community:", error);
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
        addUserMedia: ensureUserMedia,
        getUserMedia,
        getCapsuleById,
        getAlbumById,
        deleteCapsule,
        deleteAlbum,
        addPhotoToAlbum,   
        deletePhotoFromAlbum,
        acceptReceivedContent,
        ensureReceivedUserMedia,
        updateReceivedUserMedia,
        rejectReceivedContent,
        getReceivedMedia,
        getUserById,
        shareAlbum,
        shareCapsule,
        deleteAcceptedAlbum,
        deleteAcceptedCapsule,
        updateCapsule,
        updateAlbum,  
        getPublicAlbums,
        searchPublicAlbumsByCommunity,
   
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
  
}
FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
