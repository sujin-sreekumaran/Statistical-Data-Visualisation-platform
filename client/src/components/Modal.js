import React, { useState, useEffect } from "react";

const Modal = ({ isOpen, onClose, columns, handleColumnDelete, handleSubmit }) => {
  const [editedColumns, setEditedColumns] = useState(columns);

  useEffect(() => {
    setEditedColumns(columns);
  }, [columns]);

  const handleColumnEdit = (index, newName) => {
    const updatedColumns = [...editedColumns];
    updatedColumns[index] = newName;
    setEditedColumns(updatedColumns);
  };

  const handleSave = () => {
    handleSubmit(editedColumns);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Edit Columns</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Column Name</th>
              <th className="py-2 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {editedColumns.map((col, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">
                  <input
                    type="text"
                    value={col}
                    onChange={(e) => handleColumnEdit(index, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleColumnDelete(col)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
