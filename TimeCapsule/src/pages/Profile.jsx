import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFirebase } from "../context/firebase"; // Adjust path as needed
import AddContentModal from "../components/AddContentModal"; // Adjust path as needed

const Profile = () => {
  const { user, getUserCapsules, getUserAlbums, addCapsule, addAlbum } = useFirebase();
  const [capsules, setCapsules] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "capsule" or "album"

  useEffect(() => {
    if (user && user.uid) {
      const fetchData = async () => {
        try {
          const userCapsules = await getUserCapsules(user.uid);
          setCapsules(userCapsules);
          const userAlbums = await getUserAlbums(user.uid);
          setAlbums(userAlbums);
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmitContent = async (data) => {
    // data: { type, name, note, files }
    console.log("Submitted content:", data);
    try {
      if (data.type === "capsule") {
        await addCapsule(user.uid, data);
      } else if (data.type === "album") {
        await addAlbum(user.uid, data);
      }
      // Re-fetch updated data
      const userCapsules = await getUserCapsules(user.uid);
      setCapsules(userCapsules);
      const userAlbums = await getUserAlbums(user.uid);
      setAlbums(userAlbums);
    } catch (error) {
      console.error("Error adding content:", error);
      alert(error.message);
    }
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Apply blur to background content when modal is open */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {capsules.map((capsule) => (
                  <div
                    key={capsule.id}
                    className="bg-stone-300 p-4 rounded shadow"
                  >
                    <h3 className="text-lg font-semibold text-[#036c5f]">
                      {capsule.title}
                    </h3>
                    <p className="text-gray-800">{capsule.description}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {albums.map((album) => (
                  <div key={album.id} className="bg-stone-300 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold text-[#036c5f]">
                      {album.title}
                    </h3>
                    <p className="text-gray-800">{album.description}</p>
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
                Explore additional features like shared capsules, recent activity,
                and more...
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

      {/* Modal Overlay (without dark background) */}
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
