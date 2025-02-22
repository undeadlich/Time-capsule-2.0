import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Inner card with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Welcome Back
        </h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="loginEmail">
              Email Address
            </label>
            <input
              id="loginEmail"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-1" htmlFor="loginPassword">
              Password
            </label>
            <input
              id="loginPassword"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>

        {/* Divider with "or" */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-500">or</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        {/* Google Sign In Button with Google image */}
        <div className="mt-4">
          <button
            type="button"
            className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition-colors"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
              alt="Google Logo"
              className="w-5 h-5 mr-2"
            />
            Sign in with Google
          </button>
        </div>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup"><a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
