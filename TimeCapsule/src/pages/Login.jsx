import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Inner card with gradient background */}
      <div className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Welcome Back
        </h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-900 mb-1" htmlFor="loginEmail">
              Email Address
            </label>
            <input
              id="loginEmail"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-900 mb-1" htmlFor="loginPassword">
              Password
            </label>
            <input
              id="loginPassword"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-stone-300 py-2 rounded-lg hover:bg-teal-800 transition-colors"
          >
            Login
          </button>
        </form>

        {/* Divider with "or" */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-800" />
          <span className="mx-2 text-gray-950">or</span>
          <hr className="flex-grow border-t border-gray-800" />
        </div>

        {/* Google Sign In Button with Google image */}
        <div className="mt-4">
          <button
            type="button"
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
          Don't have an account?{' '}
          <Link to="/signup" className="text-stone-300 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
