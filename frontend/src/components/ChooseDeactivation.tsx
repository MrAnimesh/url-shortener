import { useState } from "react";
import axiosInstance from "../utility/axiosInstance";

function DatePickerCard({ onClose, onSetDate, shortCode, initialDate }: any) {
  const parsedDate = new Date(initialDate);

  const [selectedDay, setSelectedDay] = useState(parsedDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(parsedDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(parsedDate.getFullYear());

  console.log(
    "Inside Date Picker card: ",
    shortCode,
    " Initial Date: ",
    initialDate
  );

  // Month names for dropdown
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

  // Generate days based on selected month and year
  const getDaysInMonth = (year: any, month: any) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);

  const getFormattedDate = () => {
    const mm = String(selectedMonth + 1).padStart(2, "0");
    const dd = String(selectedDay).padStart(2, "0");
    return `${selectedYear}-${mm}-${dd}T00:00:00`;
  };

  // Handle set date
  const handleSetDate = async () => {
    const formattedDate = getFormattedDate();
    console.log("Formatted date type: ", typeof new Date(formattedDate));

    console.log("Selected date:", formattedDate);

    try {
      const res = await axiosInstance.put("/api/v1/urls/expires", {
        shortCode: shortCode,
        expiresAt: formattedDate,
      });
      console.log(res.data);
      onSetDate(formattedDate, shortCode);
      onClose();
    } catch (error) {
      console.log(
        "Something went wrong: in ChooseDeactivation component",
        error
      );
    }
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50 bg-gray-500/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 max-w-sm w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Select Date</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Year Selector */}
            <label>
              Year:
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from(
                  { length: 21 },
                  (_, i) => selectedYear - 10 + i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>

            {/* Month Selector */}
            <label>
              Month:
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {monthNames.map((mName, idx) => (
                  <option key={mName} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>
            </label>

            {/* Day Selector */}
            <label>
              Day:
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
              >
                {Array.from(
                  { length: daysInSelectedMonth },
                  (_, i) => i + 1
                ).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Selected: {monthNames[selectedMonth]} {selectedDay},{" "}
                {selectedYear}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSetDate}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Set Date
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatePickerCard;
