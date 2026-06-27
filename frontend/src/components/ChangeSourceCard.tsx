import axios from "axios";
import type { FormEvent } from "react";
import { useState } from "react";
import axiosInstance from "../utility/axiosInstance";

interface ChangeSourceCardProps {
  shortCode: string;
  onClose: () => void;
  dataFromChangedSourceCard: (originalUrl: string, shortCode: string) => void;
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Unable to update URL.";
  }

  return "Unable to update URL.";
};

export default function ChangeSourceCard({
  shortCode,
  onClose,
  dataFromChangedSourceCard,
}: ChangeSourceCardProps) {
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newUrl.trim()) {
      setError("Please enter a new URL.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const response = await axiosInstance.put("/api/v1/urls/replace", {
        shortCode,
        newUrl: newUrl.trim(),
      });

      dataFromChangedSourceCard(response.data.data, shortCode);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Update URL</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            x
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short code
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
              onChange={(event) => setNewUrl(event.target.value)}
              placeholder="Enter new URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-md shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Done"}
          </button>
        </div>
      </form>
    </div>
  );
}
