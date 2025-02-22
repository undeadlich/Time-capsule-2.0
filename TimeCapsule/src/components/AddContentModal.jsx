import React, { useState } from 'react';
import { useFirebase } from '../context/firebase';

const AddContentModal = ({ type, onClose }) => {
  const { addContent } = useFirebase();

  // Common fields
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([]);
  
  // Capsule-specific fields
  const [lockUntil, setLockUntil] = useState("");
  const [recipients, setRecipients] = useState("");
  
  // Album-specific field
  const [albumType, setAlbumType] = useState("public"); // public or private

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { type, name, note, files };
    if (type === "capsule") {
      data.lockUntil = lockUntil;
      data.recipients = recipients ? recipients.split(",").map(email => email.trim()) : [];
    } else if (type === "album") {
      data.albumType = albumType;
    }
    
    await addContent(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative bg-stone-100 rounded-lg p-6 w-full max-w-lg shadow-xl border-t-4 border-t-[#048c7f]">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          X
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#036c5f]">
          Add {type === "capsule" ? "Capsule" : "Album"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1">
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
                <label className="block text-[#036c5f] mb-1">Lock Until</label>
                <input 
                  type="datetime-local"
                  value={lockUntil}
                  onChange={(e) => setLockUntil(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-[#036c5f] mb-1">Recipients (comma separated emails)</label>
                <input 
                  type="text"
                  placeholder="example1@mail.com, example2@mail.com"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
                />
              </div>
            </>
          )}
          {type === "album" && (
            <div className="mb-4">
              <label className="block text-[#036c5f] mb-1">Album Type</label>
              <select
                value={albumType}
                onChange={(e) => setAlbumType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1">Upload Images/Videos</label>
            <input 
              id="fileInput"
              type="file" 
              accept="image/*,video/*"
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer inline-block bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
              Choose Files
            </label>
            {files.length > 0 && (
              <p className="mt-2 text-sm text-gray-700">
                {files.length} file(s) selected
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-[#036c5f] mb-1">Note (optional)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-[#b3e0dc] focus:ring-[#036c5f]"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="mr-4 text-gray-600 hover:underline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-[#048c7f] text-white py-2 px-4 rounded-lg hover:bg-[#036c5f] transition-colors"
            >
              Add {type === "capsule" ? "Capsule" : "Album"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContentModal;
