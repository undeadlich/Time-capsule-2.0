import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../context/firebase";
import AddContentModal from "../components/AddContentModal";

// Updated CardMenu component with click-outside functionality
const CardMenu = ({ id, type, onEdit, onDelete }) => {
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
          </ul>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, getUserMedia, getCapsuleById, getAlbumById, addContent,deleteAlbum,deleteCapsule } = useFirebase();
  const [capsules, setCapsules] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "capsule" or "album"

  // Fetch user media (capsules and albums)
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
        console.error("Error fetching user media details:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserMediaDetails();
  }, [user]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = async () => {
    setModalOpen(false);
    await fetchUserMediaDetails(); // Refresh data after modal closes
  };

  const handleSubmitContent = async (data) => {
    try {
      const contentId = await addContent(data);
      if (!contentId) throw new Error("Failed to add content.");
      await fetchUserMediaDetails();
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
      // Optional: ask for confirmation before deletion
      if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

      if (type === "capsule") {
        await deleteCapsule(user.uid, id);
      } else if (type === "album") {
        await deleteAlbum(user.uid, id);
      }
      await fetchUserMediaDetails();
    } catch (error) {
      console.error("Error deleting content:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Blur background content when modal is open */}
      <div className={modalOpen ? "filter blur-sm" : ""}>
        {/* Header */}
        <header className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] p-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-stone-300">Your Profile</h1>
            <Link to="/" className="text-stone-300 hover:underline">
              Home
            </Link>
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
              <p className="text-gray-700">
                You haven't created any capsules yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                {capsules.map((capsule) => (
                  <div
                    key={capsule.id}
                    onClick={() => navigate(`/profile/capsule/${capsule.id}`)}
                    className="relative bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:bg-stone-200 hover:scale-105 hover:shadow-xl transition-all w-full aspect-[3/2] flex items-center justify-center"
                  >
                    <CardMenu
                      id={capsule.id}
                      type="capsule"
                      onEdit={handleEditContent}
                      onDelete={handleDeleteContent}
                    />
                    <h3 className="text-lg font-semibold text-[#036c5f] text-center">
                      {capsule.name}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Albums Section */}
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
              <p className="text-gray-700">
                You haven't created any albums yet.
              </p>
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
                    />
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
            <h2 className="text-xl font-bold text-[#036c5f] mb-4">
              Other Features
            </h2>
            <div className="bg-stone-300 p-4 rounded shadow">
              <p className="text-gray-800">
                Explore additional features like shared capsules, recent activity, and more...
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] py-4">
          <div className="container mx-auto text-center text-stone-300">
            &copy; {new Date().getFullYear()} Time Capsule 2.0. All rights reserved.
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

export default Profile;
