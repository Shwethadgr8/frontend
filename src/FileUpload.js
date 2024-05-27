import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles([...selectedFiles, ...acceptedFiles]);
  }, [selectedFiles]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "application/pdf", // accept only PDF files
    multiple: true,
  });

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append(`files[]`, file);
    });

  const vector_store = "";  
    try {
      const response = await axios.post("http://localhost:5002/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      vector_store = response.request["response"]
      console.log("--", vector_store)

      console.log(response)
      setIsFileUploaded(true);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800">
      <h1 className="mb-5 text-5xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.fuchsia.400),theme(colors.fuchsia.400),theme(colors.indigo.400),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient">
        Pdf Bot
      </h1>
      <div className="p-4 bg-gray-800 rounded-md">
        <div
          {...getRootProps()}
          className="dropzone mb-4 border-2 border-dashed border-gray-700 rounded-md p-8 text-center text-gray-500"
        >
          <input {...getInputProps()} />
          <p>Drag 'n' drop some PDF files here, or click to select files</p>
        </div>
        <div className="file-info overflow-y-auto h-48 border rounded-md px-4 py-2 bg-gray-800 text-gray-300">
          <p className="text-lg font-semibold mb-2">Files Added:</p>
          {selectedFiles.map((file, index) => (
            <span key={index} className="flex items-center mb-2">
              <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-indigo-500" />
              <span className="text-gray-200">{file.name}</span>
            </span>
          ))}
          {selectedFiles.length === 0 && <p>No files added yet</p>}
        </div>
        <button
          onClick={handleUpload}
          className="file-upload-btn bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mt-4"
          disabled={selectedFiles.length === 0 || loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        {isFileUploaded && <p className="bot-msg mt-4 text-green-400">Files uploaded successfully!</p>}
        {loading && <div className="loader mt-4"></div>}
      </div>
    </div>
  );
};

export default FileUpload;
