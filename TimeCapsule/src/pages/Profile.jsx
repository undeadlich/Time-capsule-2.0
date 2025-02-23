import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore"; // For fetching received media if needed
import { useFirebase } from "../context/firebase";
import AddContentModal from "../components/AddContentModal";

// CardMenu component (unchanged except for added onShare prop)
const CardMenu = ({ id, type, onEdit, onDelete, onShare }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit(id, type);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(id, type);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onShare) onShare(id, type);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div ref={menuRef} className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
      <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-gray-200">
        <svg className="w-6 h-6 text-[#036c5f]" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="2" />
          <circle cx="10" cy="10" r="2" />
          <circle cx="10" cy="16" r="2" />
        </svg>
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg z-10">
          <ul className="py-1">
            <li>
              <button
                onClick={handleEdit}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit
              </button>
            </li>
            <li>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Delete
              </button>
            </li>
            {type === "album" && onShare && (
              <li>
                <button
                  onClick={handleShare}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Share
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const {
    user,
    getUserMedia,
    getReceivedMedia, // Returns { capsules, acceptedCapsules, albums, acceptedAlbums }
    getCapsuleById,
    getAlbumById,
    addContent,
    deleteCapsule,
    deleteAlbum,
    acceptReceivedContent,
    rejectReceivedContent,
    shareAlbum, // For sharing albums (used in CardMenu)
  } = useFirebase();

  const [capsules, setCapsules] = useState([]); // Personal capsules
  const [albums, setAlbums] = useState([]); // Personal albums

  // Pending received media
  const [receivedCapsules, setReceivedCapsules] = useState([]);
  const [receivedAlbums, setReceivedAlbums] = useState([]);

  // Accepted received media
  const [acceptedCapsules, setAcceptedCapsules] = useState([]);
  const [acceptedAlbums, setAcceptedAlbums] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "capsule" or "album"

  // State for tracking flipped capsules (to show locked state)
  const [flippedCapsules, setFlippedCapsules] = useState({});

  // Fetch personal media details from "userMedia" document
  const fetchUserMediaDetails = async () => {
    if (user?.uid) {
      try {
        const userMedia = await getUserMedia(user.uid);
        const capsuleIds = userMedia.capsules || [];
        const albumIds = userMedia.albums || [];

        const capsulePromises = capsuleIds.map((id) => getCapsuleById(id));
        const capsuleDetails = await Promise.all(capsulePromises);
        setCapsules(capsuleDetails.filter((item) => item !== null));

        const albumPromises = albumIds.map((id) => getAlbumById(id));
        const albumDetails = await Promise.all(albumPromises);
        setAlbums(albumDetails.filter((item) => item !== null));
      } catch (error) {
        console.error("Error fetching personal media details:", error);
      }
    }
  };

  // Fetch received media details using getReceivedMedia from Firebase context
  const fetchReceivedMediaDetails = async () => {
    if (user?.uid) {
      try {
        const receivedData = await getReceivedMedia(user.uid);
        // Pending received items
        const pendingCapsuleIds = receivedData.capsules || [];
        const pendingAlbumIds = receivedData.albums || [];
        // Accepted received items
        const acceptedCapsuleIds = receivedData.acceptedCapsules || [];
        const acceptedAlbumIds = receivedData.acceptedAlbums || [];

        const pendingCapsulePromises = pendingCapsuleIds.map((id) => getCapsuleById(id));
        const pendingCapsuleDetails = await Promise.all(pendingCapsulePromises);
        setReceivedCapsules(pendingCapsuleDetails.filter((item) => item !== null));

        const pendingAlbumPromises = pendingAlbumIds.map((id) => getAlbumById(id));
        const pendingAlbumDetails = await Promise.all(pendingAlbumPromises);
        setReceivedAlbums(pendingAlbumDetails.filter((item) => item !== null));

        const acceptedCapsulePromises = acceptedCapsuleIds.map((id) => getCapsuleById(id));
        const acceptedCapsuleDetails = await Promise.all(acceptedCapsulePromises);
        setAcceptedCapsules(acceptedCapsuleDetails.filter((item) => item !== null));

        const acceptedAlbumPromises = acceptedAlbumIds.map((id) => getAlbumById(id));
        const acceptedAlbumDetails = await Promise.all(acceptedAlbumPromises);
        setAcceptedAlbums(acceptedAlbumDetails.filter((item) => item !== null));
      } catch (error) {
        console.error("Error fetching received media details:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserMediaDetails();
  }, [user]);

  useEffect(() => {
    fetchReceivedMediaDetails();
  }, [user]);

  // Handler for capsule click – if locked, flip card; otherwise, navigate.
  const handleCapsuleClick = (capsule) => {
    const now = new Date();
    if (capsule.lockUntil && new Date(capsule.lockUntil) > now) {
      setFlippedCapsules((prev) => ({ ...prev, [capsule.id]: true }));
      setTimeout(() => {
        setFlippedCapsules((prev) => ({ ...prev, [capsule.id]: false }));
      }, 3000);
    } else {
      navigate(`/profile/capsule/${capsule.id}`);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = async () => {
    setModalOpen(false);
    await fetchUserMediaDetails();
    await fetchReceivedMediaDetails();
  };

  const handleSubmitContent = async (data) => {
    try {
      const contentId = await addContent(data);
      if (!contentId) throw new Error("Failed to add content.");
      await fetchUserMediaDetails();
      await fetchReceivedMediaDetails();
    } catch (error) {
      console.error("Error adding content:", error);
      alert(error.message);
    }
    handleCloseModal();
  };

  const handleEditContent = (id, type) => {
    alert(`Edit ${type} ${id}`);
    // Replace with your edit functionality
  };

  const handleDeleteContent = async (id, type) => {
    try {
      if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
      if (type === "capsule") {
        await deleteCapsule(user.uid, id);
      } else if (type === "album") {
        await deleteAlbum(user.uid, id);
      }
      await fetchUserMediaDetails();
      await fetchReceivedMediaDetails();
    } catch (error) {
      console.error("Error deleting content:", error);
      alert(error.message);
    }
  };

  const handleAcceptReceived = async (id, type) => {
    try {
      const success = await acceptReceivedContent(user.uid, id, type);
      if (success) {
        await fetchReceivedMediaDetails();
      }
    } catch (error) {
      console.error("Error accepting content:", error);
      alert(error.message);
    }
  };

  const handleRejectReceived = async (id, type) => {
    try {
      const success = await rejectReceivedContent(user.uid, id, type);
      if (success) {
        await fetchReceivedMediaDetails();
      }
    } catch (error) {
      console.error("Error rejecting content:", error);
      alert(error.message);
    }
  };

  // Share handler for albums (for CardMenu)
  const handleShareContent = (id, type) => {
    if (type === "album") {
      setShareAlbumId(id);
      setShareModalOpen(true);
    }
  };

  // State for share modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareAlbumId, setShareAlbumId] = useState(null);
  const [shareEmail, setShareEmail] = useState("");

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    try {
      await shareAlbum(shareAlbumId, shareEmail);
      alert("Album shared successfully!");
    } catch (error) {
      console.error("Error sharing album:", error);
      alert(error.message);
    }
    setShareModalOpen(false);
    setShareAlbumId(null);
    setShareEmail("");
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className={modalOpen ? "filter blur-sm" : ""}>
        {/* Header */}
        <header className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] p-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-stone-300">Your Profile</h1>
            <Link to="/" className="text-stone-300 hover:underline">Home</Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-6">
          {/* Personal Capsules Section */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#036c5f]">Personal Capsules</h2>
              <button
                onClick={() => handleOpenModal("capsule")}
                className="bg-teal-600 text-stone-300 py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add Capsule
              </button>
            </div>
            {capsules.length === 0 ? (
              <p className="text-gray-700">You haven't created any capsules yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                {capsules.map((capsule) => (
                  <div
                    key={capsule.id}
                    onClick={() => handleCapsuleClick(capsule)}
                    className="relative bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:bg-stone-200 hover:scale-105 hover:shadow-xl transition-all w-full aspect-[3/2] flex items-center justify-center"
                  >
                    <CardMenu
                      id={capsule.id}
                      type="capsule"
                      onEdit={handleEditContent}
                      onDelete={handleDeleteContent}
                    />
                    {flippedCapsules[capsule.id] ? (
                      <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                        Capsule is locked
                      </h3>
                    ) : (
                      <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                        {capsule.name}
                      </h3>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Personal Albums Section */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#036c5f]">Your Albums</h2>
              <button
                onClick={() => handleOpenModal("album")}
                className="bg-teal-600 text-stone-300 py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add Album
              </button>
            </div>
            {albums.length === 0 ? (
              <p className="text-gray-700">You haven't created any albums yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => navigate(`/profile/album/${album.id}`)}
                    className="relative bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:bg-stone-200 hover:scale-105 hover:shadow-xl transition-all w-full aspect-[3/2] flex items-center justify-center"
                  >
                    <CardMenu
                      id={album.id}
                      type="album"
                      onEdit={handleEditContent}
                      onDelete={handleDeleteContent}
                      onShare={handleShareContent}
                    />
                    <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                      {album.name}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Received Capsules Section (Pending) */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#036c5f]">Received Capsules (Pending)</h2>
            </div>
            {receivedCapsules.length === 0 ? (
              <p className="text-gray-700">You haven't received any capsules yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                {receivedCapsules.map((capsule) => (
                  <div
                    key={capsule.id}
                    onClick={() => handleCapsuleClick(capsule)}
                    className="relative bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:bg-stone-200 hover:scale-105 hover:shadow-xl transition-all w-full aspect-[3/2] flex items-center justify-center"
                  >
                    {flippedCapsules[capsule.id] ? (
                      <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                        Capsule is locked
                      </h3>
                    ) : (
                      <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                        {capsule.name}
                      </h3>
                    )}
                    <div className="absolute bottom-2 right-2 space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptReceived(capsule.id, "capsule");
                        }}
                        className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectReceived(capsule.id, "capsule");
                        }}
                        className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Accepted Capsules Section */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#036c5f]">Accepted Capsules</h2>
            </div>
            {acceptedCapsules.length === 0 ? (
              <p className="text-gray-700">No accepted capsules.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                {acceptedCapsules.map((capsule) => (
                  <div
                    key={capsule.id}
                    onClick={() => handleCapsuleClick(capsule)}
                    className="relative bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:bg-stone-200 hover:scale-105 hover:shadow-xl transition-all w-full aspect-[3/2] flex items-center justify-center"
                  >
                    {flippedCapsules[capsule.id] ? (
                      <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                        Capsule is locked
                      </h3>
                    ) : (
                      <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                        {capsule.name}
                      </h3>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Received Albums Section (Pending) */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#036c5f]">Received Albums (Pending)</h2>
            </div>
            {receivedAlbums.length === 0 ? (
              <p className="text-gray-700">You haven't received any albums yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                {receivedAlbums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => navigate(`/profile/album/${album.id}`)}
                    className="relative bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:bg-stone-200 hover:scale-105 hover:shadow-xl transition-all w-full aspect-[3/2] flex items-center justify-center"
                  >
                    <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                      {album.name}
                    </h3>
                    <div className="absolute bottom-2 right-2 space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptReceived(album.id, "album");
                        }}
                        className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectReceived(album.id, "album");
                        }}
                        className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Accepted Albums Section */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#036c5f]">Accepted Albums</h2>
            </div>
            {acceptedAlbums.length === 0 ? (
              <p className="text-gray-700">No accepted albums.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                {acceptedAlbums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => navigate(`/profile/album/${album.id}`)}
                    className="relative bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:bg-stone-200 hover:scale-105 hover:shadow-xl transition-all w-full aspect-[3/2] flex items-center justify-center"
                  >
                    <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                      {album.name}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Other Features Section */}
          <section>
            <h2 className="text-xl font-bold text-[#036c5f] mb-4">Other Features</h2>
            <div className="bg-stone-300 p-4 rounded shadow">
              <p className="text-gray-800">
                Explore additional features like shared capsules, recent activity, and more...
              </p>
            </div>
          </section>
        </main>
      </div>

      {modalOpen && (
        <AddContentModal
          type={modalType}
          onClose={handleCloseModal}
          onSubmit={handleSubmitContent}
        />
      )}

      {/* Share Album Modal */}
      {shareModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setShareModalOpen(false)}
        >
          <div className="bg-white p-6 rounded-lg relative" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Share Album</h2>
            <form onSubmit={handleShareSubmit}>
              <label className="block text-gray-700 mb-2">Recipient Email:</label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                required
                className="w-full px-4 py-2 mb-4 border rounded"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
                >
                  Share
                </button>
              </div>
            </form>
            <button
              onClick={() => setShareModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
