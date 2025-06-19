import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import FileInput from "../components/FileInput";
import GoogleSheetInput from "../components/GoogleSheetInput";
import UploadButton from "../components/UploadButton";
import Modal from "../components/Modal";

interface State {
  file: File | null;
  googleSheetLink: string;
  uploadedImage: string | null;
  error: string | null;
  csvFile: File | null;
  isRefreshing: boolean;
}

export default function UploadFile() {
  const [state, setState] = useState<State>({
    file: null,
    googleSheetLink: "",
    uploadedImage: null,
    error: null,
    csvFile: null,
    isRefreshing: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshTimer, setRefreshTimer] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

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
        if (error instanceof Error) {
          setToastMessage(error.message);
        } else {
          setToastMessage("An unknown error occurred.");
        }
      } finally {
        setState({ ...state, isRefreshing: false });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      file: e.target.files ? e.target.files[0] : null,
      googleSheetLink: "",
      uploadedImage: null,
      error: null,
      csvFile: null,
    });
    stopRefreshTimer();
  };

  const handleGoogleSheetLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      googleSheetLink: e.target.value,
      file: null,
      csvFile: null,
    });
    stopRefreshTimer();
  };

  const fetchGoogleSheetAsCSV = async (link: string): Promise<File> => {
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
        if (error instanceof Error) {
          setToastMessage(error.message);
        } else {
          setToastMessage("An unknown error occurred.");
        }
        return;
      }
    } else {
      const fileToUpload = state.file || state.csvFile;
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const csvData = text.split("\n")[0].split(",");
        setColumns(csvData);
        setIsModalOpen(true);
      };
      reader.readAsText(fileToUpload as Blob);
    }
  };

  const handleColumnDelete = (col: string) => {
    setColumns(columns.filter((column) => column !== col));
  };

  const handleSubmit = async (editedColumns: string[]) => {
    setIsModalOpen(false);
    const fileToUpload = state.file || state.csvFile;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n");
      const header = rows[0].split(",");
      const columnMap = header.reduce((acc: { [key: number]: string }, col, index) => {
        const newCol = editedColumns[index];
        if (newCol) {
          acc[index] = newCol;
        }
        return acc;
      }, {});

      const filteredRows = rows
        .map((row, rowIndex) => {
          const cells = row.split(",");
          return cells
            .filter((_, index) => columnMap[index] !== undefined)
            .map((cell, index) => (rowIndex === 0 ? columnMap[index] : cell))
            .join(",");
        })
        .join("\n");

      console.log(filteredRows);

      const blob = new Blob([filteredRows], { type: fileToUpload?.type });
      const newFile = new File([blob], fileToUpload?.name || "file.csv", {
        type: fileToUpload?.type,
      });
      await uploadFile(newFile);
    };
    reader.readAsText(fileToUpload as Blob);
  };

  const uploadFile = async (fileToUpload: File) => {
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
      if (error instanceof Error) {
        setState({ ...state, error: error.message });
        setToastMessage(error.message);
      } else {
        setState({ ...state, error: "Failed to upload file. Please try again." });
        setToastMessage("Failed to upload file. Please try again.");
      }
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
    stopRefreshTimer(); // Stop the timer
    setRefreshTimer(10); // Reset the timer
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 relative">
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        columns={columns}
        handleColumnDelete={handleColumnDelete}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
