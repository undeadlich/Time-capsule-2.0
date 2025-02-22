import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Time Capsule 2.0</h1>
          <nav>
            <Link to="/login" className="text-orange-400 hover:underline mr-4">
              Login
            </Link>
            <Link to="/signup" className="text-orange-400 hover:underline">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-orange-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Lock Memories, Relive the Past, Shape the Future
          </h2>
          <p className="text-xl mb-8">
            A unified, secure platform to preserve and share your digital memories.
          </p>
          <div>
            <Link
              to="/signup"
              className="bg-white text-blue-900 font-semibold py-3 px-6 rounded-full shadow hover:bg-gray-100 transition-colors mr-4"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-white text-white font-semibold py-3 px-6 rounded-full hover:bg-white hover:text-blue-900 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-blue-900">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-900">
              <h4 className="text-xl font-semibold mb-2 text-blue-900">Time-Locked Vaults</h4>
              <p>
                Secure your memories with vaults that unlock on special occasions.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-900">
              <h4 className="text-xl font-semibold mb-2 text-blue-900">AI-Powered Search</h4>
              <p>
                Instantly find your memories using smart tagging and auto-generated image descriptions.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-900">
              <h4 className="text-xl font-semibold mb-2 text-blue-900">Seamless Sharing</h4>
              <p>
                Share your capsules privately, with groups, or publicly for collective experiences.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-900">
              <h4 className="text-xl font-semibold mb-2 text-blue-900">Organized Albums & Notes</h4>
              <p>
                Easily structure your text, images, and videos in albums and journals.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-900">
              <h4 className="text-xl font-semibold mb-2 text-blue-900">Secure & Private</h4>
              <p>
                Enjoy a secure, unified platform that protects your personal and communal memories.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-900">
              <h4 className="text-xl font-semibold mb-2 text-blue-900">Community Capsules</h4>
              <p>
                Create shared capsules for cultural heritage, recovery stories, and group journaling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white">
            &copy; {new Date().getFullYear()} Time Capsule 2.0. All rights reserved.
          </p>
          <p className="text-white text-sm mt-2">
            Designed by Team GPAY from IIT Mandi
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
