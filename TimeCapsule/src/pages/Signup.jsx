
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../context/firebase"; // Ensure correct path

const Signup = () => {
  const navigate = useNavigate();
  const {
    signupUserWithEmailAndPassword,
    signinWithGoogle,
    isLoggedIn,
    addUser,
  } = useFirebase();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Redirect if user is already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await signupUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Store user details in Firestore
      await addUser(user.uid, { firstName, lastName, email });

      alert("Signup successful!");
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const userCredential = await signinWithGoogle();
      const user = userCredential.user;

      // Store user details in Firestore if it's a new account
      await addUser(user.uid, {
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email,
      });

      //alert("Google Sign-Up successful!");
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Your Capsule Account
        </h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-gray-900 mb-1" htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-900 mb-1" htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-900 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-900 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-900 mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-stone-300 py-2 rounded-lg hover:bg-teal-800 transition-colors"
          >
            Sign Up
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-800" />
          <span className="mx-2 text-gray-950">or</span>
          <hr className="flex-grow border-t border-gray-800" />
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="flex items-center justify-center w-full bg-teal-500 rounded-lg py-2 hover:bg-teal-800 transition-colors"
            onClick={handleGoogleSignup}
          >
            <img
              src="https://media.wired.com/photos/5926ffe47034dc5f91bed4e8/master/w_1920,c_limit/google-logo.jpg"
              alt="Google Logo"
              className="w-10 h-6 mr-2"
            />
            Sign up with Google
          </button>
        </div>

        <p className="mt-4 text-center text-gray-900">
          Already have an account?{" "}
          <Link to="/login" className="text-stone-300 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
