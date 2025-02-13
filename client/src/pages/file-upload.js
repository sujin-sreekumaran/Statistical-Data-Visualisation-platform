import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "../components/Navbar";
import FileInput from "../components/FileInput";
import GoogleSheetInput from "../components/GoogleSheetInput";
import UploadButton from "../components/UploadButton";

export default function UploadFile() {
  const [state, setState] = useState({
    file: null,
    googleSheetLink: "",
    uploadedImage: null,
    error: null,
    csvFile: null,
    isRefreshing: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [refreshTimer, setRefreshTimer] = useState(10);
  const refreshInterval = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (state.csvFile) {
      startRefreshTimer();
    } else {
      stopRefreshTimer();
    }
  }, [state.csvFile]);

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
    if (state.googleSheetLink) {
      setState({ ...state, isRefreshing: true });
      try {
        const fetchedCsvFile = await fetchGoogleSheetAsCSV(state.googleSheetLink);
        setState({ ...state, csvFile: fetchedCsvFile });
        await uploadFile(fetchedCsvFile);
      } catch (error) {
        setToastMessage(error.message);
      } finally {
        setState({ ...state, isRefreshing: false });
      }
    }
  };

  const handleFileChange = (e) => {
    setState({
      ...state,
      file: e.target.files[0],
      googleSheetLink: "",
      uploadedImage: null,
      error: null,
      csvFile: null,
    });
    stopRefreshTimer();
  };

  const handleGoogleSheetLinkChange = (e) => {
    setState({
      ...state,
      googleSheetLink: e.target.value,
      file: null,
      csvFile: null,
    });
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
    if (!state.file && !state.googleSheetLink) {
      setToastMessage("Please upload a file or provide a valid Google Sheet link.");
      return;
    }

    if (state.googleSheetLink && !state.csvFile) {
      try {
        const fetchedCsvFile = await fetchGoogleSheetAsCSV(state.googleSheetLink);
        setState({ ...state, csvFile: fetchedCsvFile });
        await uploadFile(fetchedCsvFile);
      } catch (error) {
        setToastMessage(error.message);
        return;
      }
    } else {
      await uploadFile(state.file || state.csvFile);
    }
  };

  const uploadFile = async (fileToUpload) => {
    setIsUploading(true);
    setState({ ...state, error: null });
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
      setState({ ...state, uploadedImage: imageUrl });

      console.log("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      setState({ ...state, error: "Failed to upload file. Please try again." });
      setToastMessage("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (state.uploadedImage) {
      const link = document.createElement("a");
      link.href = state.uploadedImage;
      link.download = "visualization.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setState({
      file: null,
      googleSheetLink: "",
      uploadedImage: null,
      error: null,
      csvFile: null,
      isRefreshing: false,
    });
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

            <FileInput
              handleFileChange={handleFileChange}
              googleSheetLink={state.googleSheetLink}
            />
            {state.file && (
              <p className="mt-4 text-sm text-gray-600">Uploaded file: {state.file.name}</p>
            )}

            <GoogleSheetInput
              googleSheetLink={state.googleSheetLink}
              handleGoogleSheetLinkChange={handleGoogleSheetLinkChange}
              file={state.file}
            />

            <UploadButton
              handleUpload={handleUpload}
              isUploading={isUploading}
              handleReset={handleReset}
              file={state.file}
              googleSheetLink={state.googleSheetLink}
              uploadedImage={state.uploadedImage}
            />
          </div>
        </div>

        {state.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}
      </div>

      {state.uploadedImage && (
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
            <img src={state.uploadedImage} alt="Uploaded Image" className="w-full h-auto" />
          </div>
        </div>
      )}

      {state.csvFile && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg">
          Refreshing in {refreshTimer} seconds...
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">
          {toastMessage}
          <button className="ml-4 text-white" onClick={() => setToastMessage(null)}>
            ✕
          </button>
        </div>
      )}

      {state.isRefreshing && (
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
