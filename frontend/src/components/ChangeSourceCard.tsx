import { p } from "framer-motion/client";
import { useState } from "react";
import axiosInstance from "../utility/axiosInstance";
// import ErrorPannel from "./ErrorPannel";

export default function ChangeSourceCard({
  shortCode,
  onClose,
  dataFromChangedSourceCard,
}: any) {
  console.log("short code: ", shortCode);

  const [newUrl, setNewUrl] = useState("");
  const [onDone, setOnDone] = useState(true);
  const [isErrorPanelVisible, setIsErrorPanelVisible] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put("/api/v1/urls/replace", {
        shortCode: shortCode,
        newUrl: newUrl,
      });
      console.log(res.data);

      dataFromChangedSourceCard(res.data, shortCode);
      console.log("Successfully updated");
    } catch (error) {
      // setIsErrorPanelVisible(true);
      // setTimeout(() => {
      //   setIsErrorPanelVisible(false);
      // }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center z-50">
      {/* {isErrorPanelVisible && <ErrorPannel/>} */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Update URL</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              For short code
            </label>
            <input
              type="text"
              value={shortCode}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New URL
            </label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter new URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end flex-col">
          <button
            onClick={handleSubmit}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
