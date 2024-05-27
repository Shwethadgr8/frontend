import React, { useState } from 'react';
import axios from 'axios';

const PDFUploadComponent = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // State for loader

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    setLoading(true); // Set loading to true when uploading starts
    try {
      const formData = new FormData();
      formData.append('pdf_file', file);
      await axios.post('http://localhost:5002/pdf_to_vector', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('PDF uploaded successfully!');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); // Set loading to false when upload completes
    }
  };

  return (
    <div className="mt-4">
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
        Upload
      </button>
      {loading && <div className="ml-2 border border-blue-500 rounded-full h-6 w-6 border-t-0 border-4 animate-spin"></div>} {/* Show CSS spinner if loading */}
    </div>
  );
};

export default PDFUploadComponent;