import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../context/firebase'; // Adjust the path as needed

const HomePage = () => {
  const { isLoggedIn, logout } = useFirebase(); // Use Firebase context

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleMenuClick = (callback) => {
    if (callback) callback();
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#048c7f] to-[#036c5f]">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-stone-300">Time Capsule 2.0</h1>
          <nav className="relative">
            {isLoggedIn ? (
              <div className="inline-block">
                {/* Dropdown toggle button */}
                <button
                  onClick={handleToggleDropdown}
                  className="flex items-center text-white hover:underline px-3 py-2"
                >
                  <div className="w-8 h-8 bg-white text-[#036c5f] rounded-full flex items-center justify-center mr-2 border border-[#036c5f] shadow">
                    Y
                  </div>
                  <svg
                    className="w-4 h-4 fill-current text-white"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.5 7l4.5 4.5L14.5 7" />
                  </svg>
                </button>
                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <ul className="py-1">
                      <li>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => handleMenuClick()}
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => handleMenuClick(logout)}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-stone-300 hover:underline mr-4">
                  Login
                </Link>
                <Link to="/signup" className="text-stone-300 hover:underline">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] text-stone-300 py-20">
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
              className="bg-stone-300 text-[#036c5f] font-semibold py-3 px-6 rounded-full shadow hover:bg-gray-100 transition-colors mr-4"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-stone-300 text-stone-300 font-semibold py-3 px-6 rounded-full hover:bg-stone-300 hover:text-[#036c5f] transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-[#036c5f]">
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-stone-300 rounded-lg shadow p-6">
              <h4 className="text-xl font-semibold mb-2 text-[#036c5f]">
                Time-Locked Vaults
              </h4>
              <p>
                Secure your memories with vaults that unlock on special occasions.
              </p>
            </div>
            <div className="bg-stone-300 rounded-lg shadow p-6">
              <h4 className="text-xl font-semibold mb-2 text-[#036c5f]">
                AI-Powered Search
              </h4>
              <p>
                Instantly find your memories using smart tagging and auto-generated image descriptions.
              </p>
            </div>
            <div className="bg-stone-300 rounded-lg shadow p-6">
              <h4 className="text-xl font-semibold mb-2 text-[#036c5f]">
                Seamless Sharing
              </h4>
              <p>
                Share your capsules privately, with groups, or publicly for collective experiences.
              </p>
            </div>
            <div className="bg-stone-300 rounded-lg shadow p-6">
              <h4 className="text-xl font-semibold mb-2 text-[#036c5f]">
                Organized Albums & Notes
              </h4>
              <p>
                Easily structure your text, images, and videos in albums and journals.
              </p>
            </div>
            <div className="bg-stone-300 rounded-lg shadow p-6">
              <h4 className="text-xl font-semibold mb-2 text-[#036c5f]">
                Secure & Private
              </h4>
              <p>
                Enjoy a secure, unified platform that protects your personal and communal memories.
              </p>
            </div>
            <div className="bg-stone-300 rounded-lg shadow p-6">
              <h4 className="text-xl font-semibold mb-2 text-[#036c5f]">
                Community Capsules
              </h4>
              <p>
                Create shared capsules for cultural heritage, recovery stories, and group journaling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-stone-300">
            &copy; {new Date().getFullYear()} Time Capsule 2.0. All rights reserved.
          </p>
          <p className="text-stone-300 text-sm mt-2">
            Designed by Team GPAY from IIT Mandi
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
