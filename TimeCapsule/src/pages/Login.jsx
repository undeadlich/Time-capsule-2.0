import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../context/firebase"; // Ensure correct path

const Login = () => {
  const navigate = useNavigate();
  const { singinUserWithEmailAndPass, signinWithGoogle, isLoggedIn, addUser } =
    useFirebase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if user is already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await singinUserWithEmailAndPass(email, password);
      //alert("Login successful!");
      navigate("/"); // Redirect to home
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signinWithGoogle();
      const user = userCredential.user;

      // Store user details in Firestore if it's a new account
      await addUser(user.uid, {
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email,
      });

      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          'url("https://img.freepik.com/free-photo/blue-pigment-water_23-2147798188.jpg?ga=GA1.1.397460206.1740223550&semt=ais_hybrid")',
      }}
    >
      <div className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Welcome Back
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-900 mb-1" htmlFor="loginEmail">
              Email Address
            </label>
            <input
              id="loginEmail"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-900 mb-1"
              htmlFor="loginPassword"
            >
              Password
            </label>
            <input
              id="loginPassword"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-stone-300 py-2 rounded-lg hover:bg-teal-800 transition-colors"
          >
            Login
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
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full bg-teal-500 rounded-lg py-2 hover:bg-teal-800 transition-colors"
          >
            <img
              src="https://media.wired.com/photos/5926ffe47034dc5f91bed4e8/master/w_1920,c_limit/google-logo.jpg"
              alt="Google Logo"
              className="w-10 h-6 mr-2"
            />
            Sign in with Google
          </button>
        </div>

        <p className="mt-4 text-center text-gray-900">
          Don't have an account?{" "}
          <Link to="/signup" className="text-stone-300 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
