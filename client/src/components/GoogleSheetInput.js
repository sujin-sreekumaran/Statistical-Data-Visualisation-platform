import React from "react";

const GoogleSheetInput = ({ googleSheetLink, handleGoogleSheetLinkChange, file }) => {
  return (
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
  );
};

export default GoogleSheetInput;
