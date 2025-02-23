import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../context/firebase";

// Component for the three-dot menu on each media card
const MediaCardMenu = ({ onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete();
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
    <div ref={menuRef} className="absolute top-1 right-1">
      <button onClick={toggleMenu} className="p-1 rounded-full hover:bg-gray-200">
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded shadow-lg z-10">
          <button
            onClick={handleDelete}
            className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const AlbumPage = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { getAlbumById, addPhotoToAlbum, deletePhotoFromAlbum, getUserById } = useFirebase();
  const [album, setAlbum] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [creator, setCreator] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);

  // Helper function to check if a URL points to an image
  const isImage = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/i) !== null;
  };

  const fetchAlbumData = async () => {
    if (albumId) {
      try {
        const albumData = await getAlbumById(albumId);
        setAlbum(albumData);
        setMediaItems(albumData.files || []);
      } catch (error) {
        console.error("Error fetching album data:", error);
      }
    }
  };

  useEffect(() => {
    fetchAlbumData();
  }, [albumId, getAlbumById]);

  // Fetch creator details
  useEffect(() => {
    const fetchCreator = async () => {
      if (album && album.createdBy) {
        try {
          const userData = await getUserById(album.createdBy);
          setCreator(userData);
        } catch (error) {
          console.error("Error fetching creator details:", error);
        }
      }
    };
    fetchCreator();
  }, [album, getUserById]);

  // Handler for file input change to add new photos/videos
  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      await addPhotoToAlbum(albumId, file);
    }
    fetchAlbumData();
  };

  // Handler to delete a media item
  const handleDeleteMedia = async (url) => {
    if (window.confirm("Are you sure you want to delete this media?")) {
      await deletePhotoFromAlbum(albumId, url);
      fetchAlbumData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] p-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-stone-300">
            {album ? album.name : "Album"}
          </h1>
          <div className="flex space-x-4">
            <Link to="/" className="text-stone-300 hover:underline">Home</Link>
            <button
              onClick={() => navigate(-1)}
              className="text-stone-300 hover:underline"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <section className="mb-6">
          <h2 className="text-xl font-bold text-[#036c5f] mb-4">Album Details</h2>
          <p className="text-gray-800 mb-2">
            <span className="font-semibold">Note:</span> {album?.note}
          </p>
          <p className="text-gray-800 mb-2">
            <span className="font-semibold">Privacy:</span> {album?.albumType}
          </p>
          <p className="text-gray-800">
            <span className="font-semibold">Created by:</span>{" "}
            {creator ? `${creator.firstName} ${creator.lastName} (${creator.email})` : album?.createdBy}
          </p>
        </section>

        {/* Add Photo Button */}
        <div className="mb-6">
          <input 
            id="photoInput"
            type="file" 
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handlePhotoChange}
          />
          <label 
            htmlFor="photoInput"
            className="cursor-pointer bg-teal-600 text-stone-300 py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors inline-block"
          >
            Add Photo/Video
          </label>
        </div>

        {/* Media Items Section */}
        <section>
          <h2 className="text-xl font-bold text-[#036c5f] mb-4">Media Items</h2>
          {mediaItems.length === 0 ? (
            <p className="text-gray-700">No media available in this album.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mediaItems.map((url, index) => (
                <div 
                  key={index} 
                  className="relative bg-white rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedMediaIndex(index)}
                >
                  {isImage(url) ? (
                    <img 
                      src={url} 
                      alt={`Media ${index}`} 
                      className="w-full h-40 object-cover rounded"
                    />
                  ) : (
                    <video 
                      src={url} 
                      controls 
                      className="w-full h-40 object-cover rounded"
                    ></video>
                  )}
                  <MediaCardMenu onDelete={() => handleDeleteMedia(url)} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal for enlarged media with next/previous navigation */}
      {selectedMediaIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setSelectedMediaIndex(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedMediaIndex(null)}
              className="absolute top-0 right-0 m-2 text-white text-2xl"
            >
              &times;
            </button>
            {isImage(mediaItems[selectedMediaIndex]) ? (
              <img 
                src={mediaItems[selectedMediaIndex]} 
                alt={`Media ${selectedMediaIndex}`} 
                className="max-w-full max-h-screen" 
              />
            ) : (
              <video src={mediaItems[selectedMediaIndex]} controls className="max-w-full max-h-screen"></video>
            )}
            {selectedMediaIndex > 0 && (
              <button 
                onClick={() => setSelectedMediaIndex(selectedMediaIndex - 1)}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white text-3xl p-2"
              >
                &#8249;
              </button>
            )}
            {selectedMediaIndex < mediaItems.length - 1 && (
              <button 
                onClick={() => setSelectedMediaIndex(selectedMediaIndex + 1)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white text-3xl p-2"
              >
                &#8250;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] py-4">
        <div className="container mx-auto text-center text-stone-300">
          &copy; {new Date().getFullYear()} Time Capsule 2.0. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AlbumPage;
