import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [googleSheetLink, setGoogleSheetLink] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [refreshTimer, setRefreshTimer] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshInterval = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (csvFile) {
      startRefreshTimer();
    } else {
      stopRefreshTimer();
    }
  }, [csvFile]);

  useEffect(() => {
    if (refreshTimer === 0) {
      refetchGoogleSheetData();
      setRefreshTimer(10);
    }
  }, [refreshTimer]);

  const startRefreshTimer = () => {
    if (refreshInterval.current) return;
    refreshInterval.current = setInterval(() => {
      setRefreshTimer((prev) => prev - 1);
    }, 1000);
  };

  const stopRefreshTimer = () => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }
  };

  const refetchGoogleSheetData = async () => {
    if (googleSheetLink) {
      setIsRefreshing(true);
      try {
        const fetchedCsvFile = await fetchGoogleSheetAsCSV(googleSheetLink);
        setCsvFile(fetchedCsvFile);
        await uploadFile(fetchedCsvFile);
      } catch (error) {
        setToastMessage(error.message);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setGoogleSheetLink("");
    setUploadedImage(null);
    setError(null);
    setCsvFile(null);
    stopRefreshTimer();
  };

  const handleGoogleSheetLinkChange = (e) => {
    setGoogleSheetLink(e.target.value);
    setFile(null);
    setCsvFile(null);
    stopRefreshTimer();
  };

  const fetchGoogleSheetAsCSV = async (link) => {
    try {
      const sheetIdMatch = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error("Invalid Google Sheet link format.");
      }
      const sheetId = sheetIdMatch[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
      const response = await axios.get(csvUrl);
      const blob = new Blob([response.data], { type: "text/csv" });
      return new File([blob], "sheet.csv", { type: "text/csv" });
    } catch (error) {
      console.error("Error fetching Google Sheet:", error);
      throw new Error("Failed to fetch Google Sheet. Please check the link and try again.");
    }
  };

  const handleUpload = async () => {
    if (!file && !googleSheetLink) {
      setToastMessage("Please upload a file or provide a valid Google Sheet link.");
      return;
    }

    if (googleSheetLink && !csvFile) {
      try {
        const fetchedCsvFile = await fetchGoogleSheetAsCSV(googleSheetLink);
        setCsvFile(fetchedCsvFile);
        await uploadFile(fetchedCsvFile);
      } catch (error) {
        setToastMessage(error.message);
        return;
      }
    } else {
      await uploadFile(file || csvFile);
    }
  };

  const uploadFile = async (fileToUpload) => {
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      console.log("Uploading file...");

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_LOCAL_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      // Create a blob URL from the response data
      const blob = new Blob([response.data], { type: "image/png" });
      const imageUrl = URL.createObjectURL(blob);
      setUploadedImage(imageUrl);

      console.log("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again.");
      setToastMessage("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (uploadedImage) {
      const link = document.createElement("a");
      link.href = uploadedImage;
      link.download = "visualization.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setFile(null);
    setGoogleSheetLink("");
    setUploadedImage(null);
    setError(null);
    setToastMessage(null);
    setCsvFile(null);
    stopRefreshTimer(); // Stop the refresh timer
    setRefreshTimer(10); // Reset the timer
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 relative">
      <Navbar onLogout={handleLogout} />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Your Data</h1>

            {/* File Upload Section */}
            <div className="flex items-center justify-center w-full mb-6">
              <label
                htmlFor="dropzone-file"
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                  googleSheetLink ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-10 h-10 mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">CSV or Excel file</p>
                  <p className="text-sm text-gray-500">
                    Please make sure the data is already cleaned and preprocessed, Otherwise you
                    will encounter some issues.
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx"
                  disabled={!!googleSheetLink}
                />
              </label>
            </div>
            {file && <p className="mt-4 text-sm text-gray-600">Uploaded file: {file.name}</p>}

            {/* Google Sheet Link Section */}
            <div className="flex flex-col items-center justify-center w-full mb-6">
              <label
                htmlFor="google-sheet-link"
                className="w-full text-lg text-gray-500 mb-2 font-semibold"
              >
                Paste Google Sheet Link
                <br />
                <p className="text-sm text-gray-500">
                  Please make sure the sheet is shared with the public link.
                </p>
              </label>

              <input
                id="google-sheet-link"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Eg: https://docs.google.com/spreadsheets/d/..."
                value={googleSheetLink}
                onChange={handleGoogleSheetLinkChange}
                disabled={!!file}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleUpload}
                disabled={isUploading || (!file && !googleSheetLink)}
                className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  "Upload"
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={!file && !googleSheetLink && !uploadedImage}
                className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>

      {uploadedImage && (
        <div className="mt-0 w-full bg-white shadow-lg">
          <div className="max-w-screen-2xl mx-auto relative">
            <div className=" right-0 z-10">
              <button
                onClick={handleDownload}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Download Image
              </button>
            </div>
            <img src={uploadedImage} alt="Uploaded Image" className="w-full h-auto" />
          </div>
        </div>
      )}

      {/* Timer */}
      {csvFile && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg">
          Refreshing in {refreshTimer} seconds...
        </div>
      )}

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">
          {toastMessage}
          <button className="ml-4 text-white" onClick={() => setToastMessage(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Full-Screen Loader */}
      {isRefreshing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          <div className="flex flex-col items-center">
            <div className="animate-spin border-8 border-t-8 border-white rounded-full h-24 w-24"></div>
            <p className="mt-6 text-xl text-white font-bold text-shadow-md">Refetching...</p>
          </div>
        </div>
      )}
    </div>
  );
}
