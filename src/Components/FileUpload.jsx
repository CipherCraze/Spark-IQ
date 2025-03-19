import React, { useState } from 'react';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from "firebase/storage";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  ClipboardDocumentIcon,
  CalendarIcon,
  DocumentTextIcon,
  PaperClipIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { FolderIcon } from '@heroicons/react/24/outline';


const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser; // Get the current logged-in user
    if (!user) {
      alert("You must be logged in to upload a file.");
      return;
    }

    // Initialize storage and firestore
    const storage = getStorage();
    const db = getFirestore();

    // Create a storage reference
    const storageRef = ref(storage, `assignments/${file.name}`);

    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Monitor the upload progress
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progressPercentage = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progressPercentage);  // Update progress bar
      },
      (error) => {
        console.error("Upload failed:", error);
        setErrorMessage("Upload failed, please try again later.");
      },
      () => {
        // Once the upload is complete, get the download URL
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => {
            // Save the file metadata to Firestore
            addDoc(collection(db, "assignments"), {
              name: file.name,
              url: url,
              uploadedBy: user.uid,  // Store the user ID who uploaded
              createdAt: serverTimestamp(),
            });
            alert("File uploaded successfully!");
            setFile(null); // Clear the file input after upload
            setProgress(0); // Reset progress bar
          })
          .catch((error) => {
            console.error("Error saving file URL:", error);
            setErrorMessage("Error saving file data.");
          });
      }
    );
  };

  return (
    <div>
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <PaperClipIcon className="w-7 h-7 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Submit Assignment</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
            >
              <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-400">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {progress > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-indigo-500 h-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          <button
            onClick={handleUpload}
            className="w-full py-3 bg-indigo-500/90 rounded-xl text-white hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Submit Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export { FileUpload };
