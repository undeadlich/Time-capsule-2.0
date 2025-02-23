import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SearchImage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const searchImages = async (query) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      console.log("Search Results:", data.results);
      setResults(data.results);
    } catch (error) {
      console.error("Error searching images:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchImages(query);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header similar to HomePage */}
      <header className="bg-gradient-to-r from-[#048c7f] to-[#036c5f]">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-stone-300">Time Capsule 2.0</h1>
          <nav>
            <Link to="/" className="text-stone-300 hover:underline">Home</Link>
          </nav>
        </div>
      </header>

      {/* Search Section */}
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold text-center mb-4">Search Images</h2>
        <form onSubmit={handleSubmit} className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search for images..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-l"
          />
          <button
            type="submit"
            className="p-2 bg-teal-600 text-white rounded-r hover:bg-teal-700"
          >
            Search
          </button>
        </form>

        {/* Results Section: Only display the image */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded shadow p-2 cursor-pointer"
                onClick={() => setSelectedImageIndex(index)}
              >
                <img
                  src={item.url}
                  alt={`Result ${index}`}
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No results found.</p>
        )}
      </div>

      {/* Enlarged Image Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-0 right-0 m-4 bg-black bg-opacity-50 rounded-full p-1 text-white text-3xl"
            >
              &times;
            </button>
            <img
              src={results[selectedImageIndex].url}
              alt={`Result ${selectedImageIndex}`}
              className="max-w-full max-h-screen"
            />
            {selectedImageIndex > 0 && (
              <button
                onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white text-3xl px-2"
              >
                &#8249;
              </button>
            )}
            {selectedImageIndex < results.length - 1 && (
              <button
                onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white text-3xl px-2"
              >
                &#8250;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchImage;
