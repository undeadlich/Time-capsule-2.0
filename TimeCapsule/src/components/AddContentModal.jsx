import React, { useState, useRef, useEffect } from 'react';
import { useFirebase } from '../context/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddContentModal = ({ type, onClose, onSubmit }) => {
  const { addContent } = useFirebase();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([]);
  const [lockUntil, setLockUntil] = useState("");
  const [recipients, setRecipients] = useState("");
  const [albumType, setAlbumType] = useState("public");
  const [community, setCommunity] = useState(""); // For community input (albums)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref for the modal content container
  const modalRef = useRef(null);

  // Close modal if click happens outside modal content
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = { 
        type, 
        name, 
        note, 
        files,
        ...(type === "capsule" && {
          lockUntil,
          recipients: recipients
            ? recipients.split(",").map(email => email.trim())
            : []
        }),
        ...(type === "album" && { albumType, community })
      };
      
      await addContent(data);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="relative bg-stone-100 rounded-lg p-6 w-full max-w-lg shadow-xl border-t-4 border-t-[#048c7f] max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-lg"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#036c5f]">
          Add {type === "capsule" ? "Time Capsule" : "Album"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1 font-medium">
              {type === "capsule" ? "Capsule Title" : "Album Title"}
            </label>
            <input 
              type="text" 
              placeholder={`Enter ${type === "capsule" ? "capsule" : "album"} title`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              required
            />
          </div>

          {type === "capsule" && (
            <>
              <div className="mb-4">
                <label className="block text-[#036c5f] mb-1 font-medium">
                  Unlock Date & Time
                </label>
                <input 
                  type="datetime-local"
                  value={lockUntil}
                  onChange={(e) => setLockUntil(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-[#036c5f] mb-1 font-medium">
                  Recipients (comma separated emails)
                </label>
                <input 
                  type="email"
                  multiple
                  placeholder="example1@mail.com, example2@mail.com"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
                />
              </div>
            </>
          )}

          {type === "album" && (
            <>
              <div className="mb-4">
                <label className="block text-[#036c5f] mb-1 font-medium">
                  Privacy Settings
                </label>
                <select
                  value={albumType}
                  onChange={(e) => setAlbumType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
                >
                  <option value="public">Public - Visible to everyone</option>
                  <option value="private">Private - Only visible to you</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-[#036c5f] mb-1 font-medium">
                  Community
                </label>
                <input 
                  type="text"
                  placeholder="Enter community name"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
                  required
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1 font-medium">
              Media Upload
            </label>
            <div className="border-2 border-dashed border-[#048c7f] rounded-lg p-4 text-center">
              <input 
                id="fileInput"
                type="file" 
                accept="image/*,video/*"
                onChange={handleFileChange}
                multiple
                className="hidden"
                disabled={isSubmitting}
              />
              <label 
                htmlFor="fileInput" 
                className="cursor-pointer inline-block bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
              >
                {files.length > 0 ? 'Add More Files' : 'Choose Files'}
              </label>
              {files.length > 0 && (
                <div className="mt-2 text-sm text-gray-700">
                  <p>{files.length} file(s) selected</p>
                  <ul className="list-disc text-left inline-block mt-1">
                    {files.map((file, index) => (
                      <li key={index} className="truncate max-w-xs">{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1 font-medium">
              Notes
            </label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your message or description..."
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f] h-32"
              maxLength="500"
            ></textarea>
            <div className="text-right text-sm text-gray-600 mt-1">
              {note.length}/500 characters
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-[#048c7f] text-white px-6 py-2 rounded-lg hover:bg-[#036c5f] transition-colors disabled:opacity-50"
              disabled={isSubmitting}  // Media is not required now
            >
              {isSubmitting ? 'Creating...' : `Create ${type === "capsule" ? 'Capsule' : 'Album'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContentModal;
