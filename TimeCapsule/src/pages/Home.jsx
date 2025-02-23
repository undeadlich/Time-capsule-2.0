import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useFirebase } from "../context/firebase";
import AddContentModal from "../components/AddContentModal";

const cardBgUrl =
  "https://is1-ssl.mzstatic.com/image/thumb/Purple123/v4/da/43/2d/da432dd4-0143-4ee3-7a70-3871c861dee1/AppIcon-0-1x_U007emarketing-0-0-GLES2_U002c0-512MB-sRGB-0-0-0-85-220-0-0-0-7.png/1200x630wa.png";

const cardStyle = {
  backgroundImage: `url(${cardBgUrl})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const HomePage = () => {
  const {
    isLoggedIn,
    logout,
    getPublicAlbums,
    searchPublicAlbumsByCommunity,
    addContent,
  } = useFirebase();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [publicAlbums, setPublicAlbums] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "capsule" or "album"
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  const dropdownRef = useRef(null);

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleMenuClick = (callback) => {
    if (callback) callback();
    setDropdownOpen(false);
  };

  // Fetch all public albums (without filtering) for grouping.
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

  // Search handler: when the search input changes, call firebase search function.
  const handleSearchChange = async (e) => {
    const queryText = e.target.value;
    setSearchQuery(queryText);
    if (queryText.trim() !== "") {
      const results = await searchPublicAlbumsByCommunity(queryText);
      setSearchResults(results);
    } else {
      setSearchResults(null);
    }
  };

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

  // Group public albums by community for default view
  const groupedAlbums = publicAlbums.reduce((acc, album) => {
    const community = album.community || "Other";
    if (!acc[community]) {
      acc[community] = [];
    }
    acc[community].push(album);
    return acc;
  }, {});

  // If search is active, group search results by community
  let groupedSearchResults = {};
  if (searchResults) {
    groupedSearchResults = searchResults.reduce((acc, album) => {
      const community = album.community || "Other";
      if (!acc[community]) {
        acc[community] = [];
      }
      acc[community].push(album);
      return acc;
    }, {});
  }

  // Determine which community groups to display when no search is active.
  const communityKeys = Object.keys(groupedAlbums);
  let displayedCommunities;
  if (showAllCommunities || communityKeys.length <= 2) {
    displayedCommunities = communityKeys;
  } else {
    displayedCommunities = [...communityKeys].sort(() => 0.5 - Math.random()).slice(0, 2);
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
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
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                    >
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
                    Log In
                  </Link>
                  <Link to="/signup" className="text-stone-300 hover:underline">
                    Get Started
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
            {!isLoggedIn && (
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
                  Log In
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Search Section */}
        <section className="py-4">
          <div className="container mx-auto px-4 text-center">
            <input
              type="text"
              placeholder="Search by community..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full max-w-md px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#036c5f]"
            />
          </div>
        </section>

        {/* Conditionally render Features Section only when no search query is active */}
        {searchQuery.trim() === "" && (
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
        )}

        {/* Public Albums Section Grouped by Community */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-3xl font-bold text-[#036c5f]">Public Albums</h3>
              {isLoggedIn && (
                <button
                  onClick={() => handleOpenModal("album")}
                  className="bg-teal-600 text-stone-300 py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add Album
                </button>
              )}
            </div>
            {searchQuery.trim() !== "" ? (
              <>
                {searchResults && Object.keys(groupedSearchResults).length > 0 ? (
                  Object.keys(groupedSearchResults).map((community) => (
                    <div key={community} className="mb-8">
                      <h4 className="text-2xl font-bold text-[#036c5f] mb-4">
                        {community}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                        {groupedSearchResults[community].map((album) => (
                          <Link key={album.id} to={`/album/${album.id}`} className="w-full">
                            <div
                              className="relative rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all w-full aspect-[3/2] flex items-center justify-center"
                              style={cardStyle}
                            >
                              <div className="absolute bottom-0 left-0 w-full bg-teal-600 bg-opacity-80 p-2">
                                <p className="text-white text-center text-lg font-semibold">
                                  {album.name}
                                </p>
                                <p className="text-white text-center text-sm">
                                  {album.community}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-700">
                    No albums found for this community.
                  </p>
                )}
              </>
            ) : (
              <>
                {Object.keys(groupedAlbums).length === 0 ? (
                  <p className="text-center text-gray-700">No public albums available.</p>
                ) : (
                  <>
                    {displayedCommunities.map((community) => (
                      <div key={community} className="mb-8">
                        <h4 className="text-2xl font-bold text-[#036c5f] mb-4">{community}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                          {groupedAlbums[community].map((album) => (
                            <Link key={album.id} to={`/album/${album.id}`} className="w-full">
                              <div
                                className="relative rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all w-full aspect-[3/2] flex items-center justify-center"
                                style={cardStyle}
                              >
                                <div className="absolute bottom-0 left-0 w-full bg-teal-600 bg-opacity-80 p-2">
                                  <p className="text-white text-center text-lg font-semibold">
                                    {album.name}
                                  </p>
                                  <p className="text-white text-center text-sm">
                                    {album.community}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    {Object.keys(groupedAlbums).length > 2 && !showAllCommunities && (
                      <div className="text-center mt-4">
                        <button
                          onClick={() => setShowAllCommunities(true)}
                          className="bg-teal-600 text-stone-300 py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          See More
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
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
        <AddContentModal type={modalType} onClose={handleCloseModal} onSubmit={handleSubmitContent} />
      )}
    </div>
  );
};

export default HomePage;
