import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useFirebase } from "../context/firebase"; // Adjust path as needed
import AddContentModal from "../components/AddContentModal";

const HomePage = () => {
  const { isLoggedIn, logout, getPublicAlbums, addContent } = useFirebase();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [publicAlbums, setPublicAlbums] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "capsule" or "album"

  // Ref for dropdown (if needed)
  const dropdownRef = useRef(null);

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleMenuClick = (callback) => {
    if (callback) callback();
    setDropdownOpen(false);
  };

  const fetchPublicAlbums = async () => {
    try {
      const albums = await getPublicAlbums();
      setPublicAlbums(albums || []);
    } catch (error) {
      console.error("Error fetching public albums:", error);
    }
  };

  useEffect(() => {
    fetchPublicAlbums();
  }, []);

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = async () => {
    setModalOpen(false);
    await fetchPublicAlbums();
  };

  const handleSubmitContent = async (data) => {
    try {
      const contentId = await addContent(data);
      if (!contentId) throw new Error("Failed to add content.");
      await fetchPublicAlbums();
    } catch (error) {
      console.error("Error adding content:", error);
      alert(error.message);
    }
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Main content blurred when modal is open */}
      <div className={modalOpen ? "filter blur-sm" : ""}>
        {/* Header */}
        <header className="bg-gradient-to-r from-[#048c7f] to-[#036c5f]">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-stone-300">Time Capsule 2.0</h1>
            <nav className="relative">
              {isLoggedIn ? (
                <div className="inline-block">
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
                  <Link
                    to="/login"
                    className="text-stone-300 hover:underline mr-4"
                  >
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
            </div>
          </div>
        </section>

        {/* Public Albums Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-3xl font-bold text-[#036c5f]">
                Public Albums
              </h3>
              {isLoggedIn && (
                <button
                  onClick={() => handleOpenModal("album")}
                  className="bg-teal-600 text-stone-300 py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add Album
                </button>
              )}
            </div>
            {/** Ensure that publicAlbums is defined in your Firebase context **/}
            {publicAlbums && publicAlbums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                {publicAlbums.map((album) => (
                  <Link key={album.id} to={`/album/${album.id}`} className="w-full">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:bg-stone-200 hover:scale-105 hover:shadow-xl transition-all w-full aspect-[3/2] flex items-center justify-center">
                      <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                        {album.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-700">
                No public albums available.
              </p>
            )}
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

      {/* Modal Component rendered on top */}
      {modalOpen && (
        <AddContentModal
          type={modalType}
          onClose={handleCloseModal}
          onSubmit={handleSubmitContent}
        />
      )}
    </div>
  );
};

export default HomePage;
  