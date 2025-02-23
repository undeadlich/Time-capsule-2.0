import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore"; // For fetching received media if needed
import { useFirebase } from "../context/firebase";
import AddContentModal from "../components/AddContentModal";

// URL for the card background image
const cardBgUrl =
  "https://is1-ssl.mzstatic.com/image/thumb/Purple123/v4/da/43/2d/da432dd4-0143-4ee3-7a70-3871c861dee1/AppIcon-0-1x_U007emarketing-0-0-GLES2_U002c0-512MB-sRGB-0-0-0-85-220-0-0-0-7.png/1200x630wa.png";

// CardMenu component with added Share button
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
    if (onEdit) onEdit(id, type);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onDelete) onDelete(id, type);
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
            {onEdit && (
              <li>
                <button onClick={handleEdit} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Edit
                </button>
              </li>
            )}
            <li>
              <button onClick={handleDelete} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Delete
              </button>
            </li>
            {onShare && (
              <li>
                <button onClick={handleShare} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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

const Header = () => {
  const { logout } = useFirebase();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <header className="bg-gradient-to-r from-[#048c7f] to-[#036c5f] p-6">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-stone-300">Your Profile</h1>
        <div className="relative" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="text-stone-300 hover:underline">
            Menu
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-10">
              <ul className="py-1">
                <li>
                  <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                    Home
                  </Link>
                </li>
                <li>
                  <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Inline EditCapsuleModal for editing capsule fields
const EditCapsuleModal = ({ capsule, onClose, onSubmit }) => {
  const [name, setName] = useState(capsule.name || "");
  const [lockUntil, setLockUntil] = useState(
    capsule.lockUntil ? new Date(capsule.lockUntil).toISOString().slice(0, 16) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ id: capsule.id, name, lockUntil });
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div ref={modalRef} className="bg-stone-100 rounded-lg p-6 w-full max-w-lg shadow-xl border-t-4 border-t-[#048c7f]">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-lg">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-[#036c5f]">Edit Capsule</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1 font-medium">Capsule Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1 font-medium">Unlock Date & Time</label>
            <input
              type="datetime-local"
              value={lockUntil}
              onChange={(e) => setLockUntil(e.target.value)}
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="bg-[#048c7f] text-white px-6 py-2 rounded-lg hover:bg-[#036c5f] transition-colors disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inline EditAlbumModal for editing album fields
const EditAlbumModal = ({ album, onClose, onSubmit }) => {
  const [name, setName] = useState(album.name || "");
  const [community, setCommunity] = useState(album.community || "");
  const [albumType, setAlbumType] = useState(album.albumType || "public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ id: album.id, name, community, albumType });
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div ref={modalRef} className="bg-stone-100 rounded-lg p-6 w-full max-w-lg shadow-xl border-t-4 border-t-[#048c7f]">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-lg">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-[#036c5f]">Edit Album</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1 font-medium">Album Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1 font-medium">Community</label>
            <input
              type="text"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1 font-medium">Privacy</label>
            <select
              value={albumType}
              onChange={(e) => setAlbumType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
            >
              <option value="public">Public - Visible to everyone</option>
              <option value="private">Private - Only visible to you</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="bg-[#048c7f] text-white px-6 py-2 rounded-lg hover:bg-[#036c5f] transition-colors disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const {
    user,
    getUserMedia,
    getReceivedMedia,
    getCapsuleById,
    getAlbumById,
    addContent,
    deleteCapsule,
    deleteAlbum,
    acceptReceivedContent,
    rejectReceivedContent,
    shareAlbum,
    shareCapsule,
    deleteAcceptedCapsule,
    deleteAcceptedAlbum,
    updateCapsule,
    updateAlbum,
    isLoggedIn,
  } = useFirebase();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const [capsules, setCapsules] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [receivedCapsules, setReceivedCapsules] = useState([]);
  const [receivedAlbums, setReceivedAlbums] = useState([]);
  const [acceptedCapsules, setAcceptedCapsules] = useState([]);
  const [acceptedAlbums, setAcceptedAlbums] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [flippedCapsules, setFlippedCapsules] = useState({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareId, setShareId] = useState(null);
  const [shareType, setShareType] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCapsule, setEditCapsule] = useState(null);
  const [editAlbumModalOpen, setEditAlbumModalOpen] = useState(false);
  const [editAlbum, setEditAlbum] = useState(null);

  // Card style for capsules and albums
  const cardStyle = {
    backgroundImage: `url(${cardBgUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const fetchUserMediaDetails = async () => {
    if (user?.uid) {
      try {
        const userMedia = await getUserMedia(user.uid);
        const capsuleIds = userMedia.capsules || [];
        const albumIds = userMedia.albums || [];
        const capsuleDetails = await Promise.all(capsuleIds.map((id) => getCapsuleById(id)));
        setCapsules(capsuleDetails.filter((item) => item !== null));
        const albumDetails = await Promise.all(albumIds.map((id) => getAlbumById(id)));
        setAlbums(albumDetails.filter((item) => item !== null));
      } catch (error) {
        console.error("Error fetching personal media details:", error);
      }
    }
  };

  const fetchReceivedMediaDetails = async () => {
    if (user?.uid) {
      try {
        const receivedData = await getReceivedMedia(user.uid);
        const pendingCapsuleDetails = await Promise.all((receivedData.capsules || []).map((id) => getCapsuleById(id)));
        setReceivedCapsules(pendingCapsuleDetails.filter((item) => item !== null));
        const pendingAlbumDetails = await Promise.all((receivedData.albums || []).map((id) => getAlbumById(id)));
        setReceivedAlbums(pendingAlbumDetails.filter((item) => item !== null));
        const acceptedCapsuleDetails = await Promise.all((receivedData.acceptedCapsules || []).map((id) => getCapsuleById(id)));
        setAcceptedCapsules(acceptedCapsuleDetails.filter((item) => item !== null));
        const acceptedAlbumDetails = await Promise.all((receivedData.acceptedAlbums || []).map((id) => getAlbumById(id)));
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
    if (type === "capsule") {
      const capsule = capsules.find((c) => c.id === id);
      if (capsule) {
        setEditCapsule(capsule);
        setEditModalOpen(true);
      }
    } else if (type === "album") {
      const album = albums.find((a) => a.id === id);
      if (album) {
        setEditAlbum(album);
        setEditAlbumModalOpen(true);
      }
    }
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      const success = await updateCapsule(updatedData.id, {
        name: updatedData.name,
        lockUntil: updatedData.lockUntil,
      });
      if (success) {
        await fetchUserMediaDetails();
        await fetchReceivedMediaDetails();
      }
    } catch (error) {
      console.error("Error updating capsule:", error);
      alert(error.message);
    }
    setEditModalOpen(false);
  };

  const handleEditAlbumSubmit = async (updatedData) => {
    try {
      const success = await updateAlbum(updatedData.id, {
        name: updatedData.name,
        community: updatedData.community,
        albumType: updatedData.albumType,
      });
      if (success) {
        await fetchUserMediaDetails();
        await fetchReceivedMediaDetails();
      }
    } catch (error) {
      console.error("Error updating album:", error);
      alert(error.message);
    }
    setEditAlbumModalOpen(false);
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
      if (success) await fetchReceivedMediaDetails();
    } catch (error) {
      console.error("Error accepting content:", error);
      alert(error.message);
    }
  };

  const handleRejectReceived = async (id, type) => {
    try {
      const success = await rejectReceivedContent(user.uid, id, type);
      if (success) await fetchReceivedMediaDetails();
    } catch (error) {
      console.error("Error rejecting content:", error);
      alert(error.message);
    }
  };

  const handleShareContent = (id, type) => {
    setShareId(id);
    setShareType(type);
    setShareModalOpen(true);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    try {
      if (shareType === "album") {
        await shareAlbum(shareId, shareEmail);
      } else if (shareType === "capsule") {
        await shareCapsule(shareId, shareEmail);
      }
      alert("Content shared successfully!");
    } catch (error) {
      console.error("Error sharing content:", error);
      alert(error.message);
    }
    setShareModalOpen(false);
    setShareId(null);
    setShareType("");
    setShareEmail("");
  };

  const handleDeleteAcceptedCapsule = async (id) => {
    if (window.confirm("Are you sure you want to delete this accepted capsule?")) {
      await deleteAcceptedCapsule(user.uid, id);
      await fetchReceivedMediaDetails();
    }
  };

  const handleDeleteAcceptedAlbum = async (id) => {
    if (window.confirm("Are you sure you want to delete this accepted album?")) {
      await deleteAcceptedAlbum(user.uid, id);
      await fetchReceivedMediaDetails();
    }
  };

  // Card style using the provided background image; card name overlay uses teal background.


  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className={modalOpen ? "filter blur-sm" : ""}>
        <Header />
        <section className="py-4">
          <div className="container mx-auto px-4 text-center">
            <input
              type="text"
              placeholder="Search..."
              className="w-full max-w-md px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#036c5f]"
            />
          </div>
        </section>
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
                    className="relative rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all w-full aspect-[3/2]"
                    style={cardStyle}
                  >
                    <CardMenu
                      id={capsule.id}
                      type="capsule"
                      onEdit={handleEditContent}
                      onDelete={handleDeleteContent}
                      onShare={handleShareContent}
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-teal-600 bg-opacity-80 p-2">
                      {flippedCapsules[capsule.id] ? (
                        <p className="text-white text-center text-sm">Capsule is locked</p>
                      ) : (
                        <p className="text-white text-center text-lg font-semibold">{capsule.name}</p>
                      )}
                    </div>
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
                    className="relative rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all w-full aspect-[3/2]"
                    style={cardStyle}
                  >
                    <CardMenu
                      id={album.id}
                      type="album"
                      onEdit={handleEditContent}
                      onDelete={handleDeleteContent}
                      onShare={handleShareContent}
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-teal-600 bg-opacity-80 p-2">
                      <p className="text-white text-center text-lg font-semibold">{album.name}</p>
                    </div>
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
                    className="relative rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all w-full aspect-[3/2]"
                    style={cardStyle}
                  >
                    <div className="absolute bottom-0 left-0 w-full bg-teal-600 bg-opacity-80 p-2">
                      {flippedCapsules[capsule.id] ? (
                        <p className="text-white text-center text-sm">Capsule is locked</p>
                      ) : (
                        <p className="text-white text-center text-lg font-semibold">{capsule.name}</p>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 space-x-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAcceptReceived(capsule.id, "capsule"); }}
                        className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRejectReceived(capsule.id, "capsule"); }}
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
                    className="relative rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all w-full aspect-[3/2]"
                    style={cardStyle}
                  >
                    <CardMenu id={capsule.id} type="capsule" onDelete={() => handleDeleteAcceptedCapsule(capsule.id)} />
                    <div className="absolute bottom-0 left-0 w-full bg-teal-600 bg-opacity-80 p-2">
                      {flippedCapsules[capsule.id] ? (
                        <p className="text-white text-center text-sm">Capsule is locked</p>
                      ) : (
                        <p className="text-white text-center text-lg font-semibold">{capsule.name}</p>
                      )}
                    </div>
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
                    className="relative rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all w-full aspect-[3/2]"
                    style={cardStyle}
                  >
                    <div className="absolute bottom-0 left-0 w-full bg-teal-600 bg-opacity-80 p-2">
                      <p className="text-white text-center text-lg font-semibold">{album.name}</p>
                    </div>
                    <div className="absolute bottom-2 right-2 space-x-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAcceptReceived(album.id, "album"); }}
                        className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRejectReceived(album.id, "album"); }}
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
                    className="relative rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-all w-full aspect-[3/2]"
                    style={cardStyle}
                  >
                    <CardMenu id={album.id} type="album" onDelete={() => handleDeleteAcceptedAlbum(album.id)} />
                    <div className="absolute bottom-0 left-0 w-full bg-teal-600 bg-opacity-80 p-2">
                      <p className="text-white text-center text-lg font-semibold">{album.name}</p>
                    </div>
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
        <AddContentModal type={modalType} onClose={handleCloseModal} onSubmit={handleSubmitContent} />
      )}

      {editModalOpen && editCapsule && (
        <EditCapsuleModal capsule={editCapsule} onClose={() => setEditModalOpen(false)} onSubmit={handleEditSubmit} />
      )}

      {editAlbumModalOpen && editAlbum && (
        <EditAlbumModal album={editAlbum} onClose={() => setEditAlbumModalOpen(false)} onSubmit={handleEditAlbumSubmit} />
      )}

      {shareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setShareModalOpen(false)}
        >
          <div className="bg-white p-6 rounded-lg relative" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Share {shareType === "album" ? "Album" : "Capsule"}</h2>
            <form onSubmit={handleShareSubmit}>
              <label className="block text-gray-700 mb-2">Recipient Email(s):</label>
              <input
                type="text"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                required
                placeholder="email1@example.com, email2@example.com"
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
