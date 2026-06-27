import axios from "axios";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import axiosInstance from "../utility/axiosInstance";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DatePickerCardProps {
  shortCode: string;
  initialDate: Date | string;
  onClose: () => void;
  onSetDate: (date: Date, shortCode: string) => void;
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getInitialDate = (initialDate: Date | string) => {
  const date = new Date(initialDate);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
};

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Unable to update expiration date.";
  }

  return "Unable to update expiration date.";
};

export default function DatePickerCard({
  shortCode,
  initialDate,
  onClose,
  onSetDate,
}: DatePickerCardProps) {
  const defaultDate = getInitialDate(initialDate);

  const [selectedDay, setSelectedDay] = useState(defaultDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(defaultDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(defaultDate.getFullYear());
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);

  useEffect(() => {
    if (selectedDay > daysInSelectedMonth) {
      setSelectedDay(daysInSelectedMonth);
    }
  }, [daysInSelectedMonth, selectedDay]);

  const getSelectedDate = () => {
    const month = String(selectedMonth + 1).padStart(2, "0");
    const day = String(selectedDay).padStart(2, "0");

    return new Date(`${selectedYear}-${month}-${day}T00:00:00`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedDate = getSelectedDate();

    try {
      setIsSaving(true);
      setError("");

      await axiosInstance.put("/api/v1/urls/expires", {
        shortCode,
        expiresAt: selectedDate.toISOString(),
      });

      onSetDate(selectedDate, shortCode);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500/20 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm w-full"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Select Date</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Year
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {Array.from({ length: 21 }, (_, index) => selectedYear - 10 + index).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Month
              <select
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(Number(event.target.value))
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {monthNames.map((monthName, index) => (
                  <option key={monthName} value={index}>
                    {monthName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Day
              <select
                value={selectedDay}
                onChange={(event) => setSelectedDay(Number(event.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {Array.from(
                  { length: daysInSelectedMonth },
                  (_, index) => index + 1
                ).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="mt-5 text-sm text-gray-600">
            Selected: {monthNames[selectedMonth]} {selectedDay}, {selectedYear}
          </p>

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
              {isSaving ? "Saving..." : "Set Date"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
