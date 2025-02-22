import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../context/firebase";

const AlbumPage = () => {
  const { userId, albumId } = useParams();
  const navigate = useNavigate();
  const { getAlbum } = useFirebase();
  const [album, setAlbum] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    const fetchAlbumData = async () => {
      if (userId && albumId) {
        try {
          const albumData = await getAlbum(userId, albumId);
          setAlbum(albumData);
          setMediaItems(albumData.media || []);
        } catch (error) {
          console.error("Error fetching album data:", error);
        }
      }
    };

    fetchAlbumData();
  }, [userId, albumId, getAlbum]);

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading album...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] p-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-stone-300">{album.title}</h1>
          <div className="flex space-x-4">
            <Link to="/" className="text-stone-300 hover:underline">
              Home
            </Link>
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
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#036c5f] mb-4">Album Details</h2>
          <p className="text-gray-800 mb-2">
            <span className="font-semibold">Description:</span> {album.description}
          </p>
          <p className="text-gray-800">
            <span className="font-semibold">Privacy:</span> {album.privacy}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#036c5f] mb-4">Media Items</h2>
          {mediaItems.length === 0 ? (
            <p className="text-gray-700">No media available in this album.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mediaItems.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={`Media ${index}`}
                      className="w-full h-40 object-cover rounded"
                    />
                  ) : (
                    <video
                      src={item.url}
                      controls
                      className="w-full h-40 object-cover rounded"
                    ></video>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

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
