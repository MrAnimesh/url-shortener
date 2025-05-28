import React, { useEffect, useState } from "react";
import axiosInstance from "../utility/axiosInstance";
import ShortnerCard from "../components/ShortnerCard";
import ChangeSourceCard from "../components/ChangeSourceCard";
import DatePickerCard from "../components/ChooseDeactivation";
import Tooltip from "../components/Tooltip";

interface Url {
  id: number;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  active: boolean;
  userId: number;
  count: number;
  expiresAt: string;
  maxClicksAllowed: number | null;
  passwordProtected: boolean;
  password: string | null;
}

interface SortConfig {
  key: keyof Url;
  direction: "asc" | "desc";
}

const UserDashboard: React.FC = () => {
  const [urls, setUrls] = useState<Url[]>([]);

  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);

  const [isCustomDomainFocused, setIsCustomDomainFocused] =
    useState<boolean>(false);

  const [isSourceChangeFocused, setIsSourceChangeFocused] = useState(false);
  const [activeShortCode, setActiveShortCode] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [maxClicks, setMaxClicks] = useState("");
  const [clicksInputOpen, setClickInputOpen] = useState(false);

  // FOR PASSWORD
  const [urlPasswordVisible, setUrlPasswordVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [urlEditingPassword, setUrlEditingPassword] = useState<{
    [key: string]: boolean;
  }>({});
  const [urlPasswordInputs, setUrlPasswordInputs] = useState<{
    [key: string]: string;
  }>({});

  // Helper functions
  const toggleUrlPasswordVisibility = (shortUrl: string) => {
    setUrlPasswordVisible((prev: any) => ({
      ...prev,
      [shortUrl]: !prev[shortUrl],
    }));
  };

  const toggleUrlPasswordEdit = (shortUrl: string) => {
    setUrlEditingPassword((prev: any) => ({
      ...prev,
      [shortUrl]: !prev[shortUrl],
    }));
  };

  const updateUrlPasswordInput = (shortUrl: string, value: string) => {
    setUrlPasswordInputs((prev) => ({
      ...prev,
      [shortUrl]: value,
    }));
  };

  const handleUrlPasswordSubmit = (shortUrl: string) => {
    // Close the input
    setUrlEditingPassword((prev) => ({
      ...prev,
      [shortUrl]: false,
    }));

    // Call your existing function with the password for this specific URL
    handleSetPassword(shortUrl, urlPasswordInputs[shortUrl] || "");

    // Clear the password value for this URL
    setUrlPasswordInputs((prev) => ({
      ...prev,
      [shortUrl]: "",
    }));
  };

  // FOR PASSWORD

  const fetchAllUrl = async () => {
    const res = await axiosInstance.get(`/api/v1/urls`);
    const fetchedData = res.data;
    console.log(fetchedData);
    setUrls(fetchedData);
  };

  useEffect(() => {
    fetchAllUrl();
  }, [isCardOpen]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc",
  });

  const handleToggleActive = async (
    shortCode: string,
    active: boolean
  ): Promise<void> => {
    let isSuccess: boolean = true;
    try {
      if (active) {
        const res = await axiosInstance.post(
          `/api/v1/urls/deactivate/${shortCode}`
        );
        isSuccess = res.data;
        console.log(res.data);
      } else {
        const res = await axiosInstance.post(
          `/api/v1/urls/activate/${shortCode}`
        );
        isSuccess = res.data;
        console.log(res.data);
      }
    } catch (error) {
      console.log("err", error);

      isSuccess = false;
      // setIsErrorPanelVisible(true);
      // setTimeout(() => {
      //   setIsErrorPanelVisible(false);
      // }, 4000);
    }
    if (isSuccess)
      setUrls(
        urls.map((url) =>
          url.shortUrl === shortCode ? { ...url, active: !url.active } : url
        )
      );
  };

  const handleCopy = async (shortUrl: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText("localhost:8081/" + shortUrl);
      alert("URL copied to clipboard!");
    } catch (err) {
      alert("Failed to copy URL: " + err);
    }
  };

  const formatDate = (dateString: string, includeTime: boolean): string => {
    // console.log("datestring:", dateString);

    if (!dateString) return "Never";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "Invalid date";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      ...(includeTime && {
        hour: "2-digit",

        minute: "2-digit",
      }),
    };

    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateUrl = (url: string, maxLength: number = 40): string => {
    return url.length > maxLength ? url.substring(0, maxLength) + "..." : url;
  };

  const requestSort = (key: keyof Url): void => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUrls = [...urls].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    // Handle null values explicitly
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1; // Put nulls last
    if (bValue === null) return -1;

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;

    return 0;
  });

  const filteredUrls = sortedUrls.filter(
    (url) =>
      url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.shortUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIndicator = (key: keyof Url): string => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ↑" : " ↓";
    }
    return "";
  };

  const renderChildComponent = () => {
    setIsCardOpen(!isCardOpen);
  };

  const renderCustomDomainCard = () => {
    console.log("clicked");
    setIsCardOpen(!isCardOpen);
    setIsCustomDomainFocused(!isCustomDomainFocused);
  };

  const deleteShortedUrls = async (shortCode: string) => {
    if (
      confirm(
        "Are you sure you want to delete this URL? This action cannot be undone."
      )
    ) {
      const res = await axiosInstance.delete(`/api/v1/urls/delete/${shortCode}`);
      setUrls(urls.filter((url) => url.shortUrl !== shortCode));

      console.log(res.data);
    }
  };

  const handleEditSource = (shortCode: string) => {
    setIsSourceChangeFocused(true);
    setActiveShortCode(shortCode);
  };

  const dataFromChangedSourceCard = (
    originalUrl: string,
    shortCode: string
  ) => {
    if (originalUrl) {
      setUrls(
        urls.map((url) =>
          url.shortUrl === shortCode
            ? { ...url, originalUrl: originalUrl }
            : url
        )
      );
    }
  };

  const handleSetDate = (date: Date, shortCode: string) => {

    setSelectedDate(date);
    setShowDatePicker(false);
    if (date) {
      setUrls(
        urls.map((url) =>
          url.shortUrl === shortCode
            ? { ...url, expiresAt: date.toString() }
            : url
        )
      );
    }
  };

  const handleRemoveExpiration = async (shortCode: string) => {
    try {
      const res = await axiosInstance.put(
        `/api/v1/urls/resetExpires/${shortCode}`
      );
      setUrls(
        urls.map((url) =>
          url.shortUrl === shortCode ? { ...url, expiresAt: "" } : url
        )
      );
    } catch (error) {
      console.log("Some error occured");
    }
  };

  const handleSetClickLimit = async (shortCode: string) => {
    if (maxClicks && shortCode) {
      console.log(shortCode, " : ", maxClicks);
      const clicks = Number(maxClicks);
      console.log(clicks);
      const res = await axiosInstance.put(
        `/api/v1/urls/expires/${shortCode}/${clicks}`
      );
      console.log("res.data: ", res.data);

      setUrls(
        urls.map((url) =>
          url.shortUrl === shortCode
            ? { ...url, maxClicksAllowed: clicks }
            : url
        )
      );
    }

    setActiveShortCode("");
    setClickInputOpen(false);
    setMaxClicks("");
  };

  const handleResetClickLiit = async (shortCode: string) => {
    console.log("s: ", shortCode);

    if (shortCode) {
      const res = await axiosInstance.put(
        `/api/v1/urls/resetClicks/${shortCode}`
      );
      console.log(res.data);

      setUrls(
        urls.map((url) =>
          url.shortUrl === shortCode ? { ...url, maxClicksAllowed: null } : url
        )
      );
    }
  };

  const handleSetPassword = async (
    shortCode: string,
    passwordValue: string
  ) => {
    if (!shortCode || !passwordValue) return;
    console.log("url: ", shortCode);
    console.log("password value: ", passwordValue);
    try {
      const res = await axiosInstance.put("/api/v1/urls/password", {
        urlPassword: passwordValue,
        shortCode: shortCode,
      });
      console.log(res.data);
      setUrls(
        urls.map((url) =>
          url.shortUrl === shortCode
            ? { ...url, passwordProtected: true, password: passwordValue }
            : url
        )
      );
      setActiveShortCode("");
    } catch (err) {}
  };

  const handleResetPassword = async (shortCode: string) => {
    if(shortCode){
      const res = await axiosInstance.put(`/api/v1/urls/reset-password/${shortCode}`)
      console.log(res.data);

        setUrls(
        urls.map((url) =>
          url.shortUrl === shortCode ? { ...url, passwordProtected: false, password: null } : url
        )
      );
      
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-500 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold">URL Shortener Dashboard</h1>
          <p>Manage your shortened URLs</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Total URLs</h3>
            <p className="text-xl font-bold">{urls.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Active URLs</h3>
            <p className="text-xl font-bold">
              {urls.filter((url) => url.active).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">Total Clicks</h3>
            <p className="text-xl font-bold">
              {urls.reduce((sum, url) => sum + url.count, 0)}
            </p>
          </div>
        </div>

        {/* Search and Add New */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search URLs..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white font-bold p-2 rounded-lg hover:bg-blue-600 w-full sm:w-auto"
              onClick={renderChildComponent}
            >
              Short URL
            </button>
            <button
              className="bg-blue-500 text-white font-bold p-2 rounded-lg hover:bg-blue-600 w-full sm:w-auto"
              onClick={renderCustomDomainCard}
            >
              Generate Custome Link
            </button>
          </div>
          {isCardOpen && (
            <ShortnerCard
              isCardOpen={isCardOpen}
              setIsCardOpen={setIsCardOpen}
              isCustomDomainFocused={isCustomDomainFocused}
              setIsCustomDomainFocused={setIsCustomDomainFocused}
              setUrls={setUrls}
            />
          )}
        </div>

        {/* URLs Table */}
        <div className="bg-white  rounded-lg shadow overflow-x-auto border border-gray-200">
          <table className="w-full border-collapse mb-20">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <tr>
                <th
                  className="p-4 text-center font-semibold cursor-pointer border-b border-gray-300 hover:bg-blue-600 transition"
                  onClick={() => requestSort("originalUrl")}
                >
                  Original URL{getSortIndicator("originalUrl")}
                </th>
                <th
                  className="p-4 text-center font-semibold cursor-pointer border-b border-gray-300 hover:bg-blue-600 transition"
                  onClick={() => requestSort("shortUrl")}
                >
                  Short URL{getSortIndicator("shortUrl")}
                </th>
                <th
                  className="p-4 text-center font-semibold cursor-pointer border-b border-gray-300 hover:bg-blue-600 transition"
                  onClick={() => requestSort("createdAt")}
                >
                  Created{getSortIndicator("createdAt")}
                </th>
                <th
                  className="p-4 text-center font-semibold cursor-pointer border-b border-gray-300 hover:bg-blue-600 transition"
                  onClick={() => requestSort("count")}
                >
                  Clicks{getSortIndicator("count")}
                </th>
                <th
                  className="p-4 text-center font-semibold cursor-pointer border-b border-gray-300 hover:bg-blue-600 transition"
                  onClick={() => requestSort("active")}
                >
                  Status{getSortIndicator("active")}
                </th>
                <th className="p-4 text-center font-semibold border-b border-gray-300">
                  Max Clicks Allowed
                </th>
                <th className="p-4 text-center font-semibold border-b border-gray-300"
                    onClick={() => requestSort("expiresAt")}
                >
                  Expires {getSortIndicator("expiresAt")}
                </th>
                <th className="p-4 text-center font-semibold border-b border-gray-300">
                  Password
                </th>
                <th className="p-4 text-center font-semibold border-b border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredUrls.length > 0 ? (
                filteredUrls.map((url) => (
                  <tr
                    key={url.id}
                    className={`${
                      url.active
                        ? "hover:bg-blue-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    } transition duration-200`}
                  >
                    <td
                      className=" p-4 border-b border-gray-200"
                      title={url.originalUrl}
                    >
                      <div className="flex items-center">
                        <span className="truncate max-w-[200px] text-sm">
                          {truncateUrl(url.originalUrl)}
                        </span>
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <span className="material-icons md-18">
                            open_in_new
                          </span>
                        </a>
                      </div>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <a
                          href={`https://${url.shortUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          http://localhost:8081/{url.shortUrl}
                        </a>
                        <button
                          onClick={() => handleCopy(url.shortUrl)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <span className="material-icons md-18">
                            content_copy
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(url.createdAt, true)}
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      {url.count}
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      {url.active ? "Active" : "Inactive"}
                    </td>

                    {/* Number of clicks start */}

                    {/* Max Clicks Column */}
                    <td className="text-sm">
                      <div className="relative flex  text-center justify-center   ">
                        <span
                          className={`text-sm ${
                            url.maxClicksAllowed
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        >
                          {url.maxClicksAllowed || "None"}
                        </span>

                        {/* Remove click limit button (if set) */}
                        {url.maxClicksAllowed && (
                          <button
                            onClick={() => handleResetClickLiit(url.shortUrl)}
                            className="ml-2 text-gray-400 hover:text-red-600"
                            title="Remove click limit"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              ></path>
                            </svg>
                          </button>
                        )}

                        {/* Set/Edit click limit button */}
                        <button
                          onClick={() => {
                            setActiveShortCode(url.shortUrl);
                            setClickInputOpen(true);
                            setMaxClicks(
                              url.maxClicksAllowed
                                ? url.maxClicksAllowed.toString()
                                : ""
                            );
                          }}
                          className="ml-1 text-gray-400 hover:text-blue-600"
                          title={
                            url.maxClicksAllowed
                              ? "Change click limit"
                              : "Set click limit"
                          }
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            ></path>
                          </svg>
                        </button>

                        {/* Click limit input popup */}
                        {clicksInputOpen &&
                          url.shortUrl === activeShortCode && (
                            <div className="absolute left-0 mt-1 w-48 bg-white shadow-lg rounded-md border z-10 p-3">
                              <label className="block text-xs text-gray-700 mb-1">
                                Max number of clicks:
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={maxClicks}
                                onChange={(e) => setMaxClicks(e.target.value)}
                                className="w-full p-1 border rounded text-sm mb-2"
                                placeholder="Enter click limit"
                              />
                              <div className="flex justify-end space-x-2 pt-2">
                                <button
                                  onClick={() => {
                                    setActiveShortCode("");
                                    setClickInputOpen(false);
                                    setMaxClicks("");
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handleSetClickLimit(url.shortUrl)
                                  }
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                  disabled={maxClicks === ""}
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          )}
                      </div>
                    </td>

                    {/* Number of clicks end */}

                    {/* Expires at start*/}

                    <td className="px-4 py-3 text-sm" >
                      <div className="relative flex  text-center justify-center">
                        {/* Display current expiration status */}
                        <span
                          className={`text-sm ${
                            url.expiresAt ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {formatDate(url.expiresAt, false)}
                        </span>

                        {/* Remove expiration button (if expiration is set) */}
                        {url.expiresAt && (
                          <button
                            onClick={() => handleRemoveExpiration(url.shortUrl)}
                            className="ml-1 text-gray-400 hover:text-red-600"
                            title="Remove expiration"
                          >
                            <span className="material-icons md-18 ">close</span>
                          </button>
                        )}

                        {/* Set/Edit expiration button */}
                        <button
                          onClick={() => {
                            setShowDatePicker(true),
                              setActiveShortCode(url.shortUrl);
                          }}
                          className="ml-1 text-gray-400 hover:text-blue-600"
                          title={
                            url.expiresAt
                              ? "Change expiration"
                              : "Set expiration"
                          }
                        >
                          {url.expiresAt ? (
                            <span className="material-icons md-18">
                              edit_calendar
                            </span>
                          ) : (
                            <span className="material-icons md-18">
                              schedule
                            </span>
                          )}
                        </button>

                        {showDatePicker && activeShortCode === url.shortUrl && (
                          <DatePickerCard
                            onClose={() => setShowDatePicker(false)}
                            onSetDate={handleSetDate}
                            initialDate={selectedDate}
                            shortCode={activeShortCode}
                          />
                        )}
                      </div>
                    </td>

                    {/* expires at end */}

                    {/* password starts */}

                    <td className="px-4 py-3 text-sm">
                      <div className="flex justify-center">
                        {url.passwordProtected && (
                          <div className="flex items-center justify-center">
                            {/* Show password if visible for this URL */}
                            {urlPasswordVisible[url.shortUrl] && !urlEditingPassword[url.shortUrl]&&(
                              <span className="mr-2">{url.password}</span>
                            )}

                            {/* Toggle visibility icon - hide when input field is open */}
                            {!urlEditingPassword[url.shortUrl] && (
                              <div className="flex">
                              <span
                                className="material-icons w-5 md-18 cursor-pointer"
                                onClick={() =>
                                  toggleUrlPasswordVisibility(url.shortUrl)
                                }
                              >
                                {urlPasswordVisible[url.shortUrl]
                                  ? "visibility_off"
                                  : "visibility_on"}
                              </span>
                            <button 
                            className="items-center flex"
                              onClick={()=>handleResetPassword(url.shortUrl)}
                            >
                              <span className="material-icons w-7 md-18 cursor-pointer">
                                close
                              </span>
                            </button>       
                            </div>                       
                            )}

                              
                          </div>
                        )}

                        {/* Edit password icon - only show if not currently editing this URL */}
                        {!urlEditingPassword[url.shortUrl] && (
                          <span
                            className="material-icons cursor-pointer"
                            onClick={() => toggleUrlPasswordEdit(url.shortUrl)}
                          >
                            edit_note
                          </span>
                        )}

                        {/* Password input - only show for this specific URL when editing */}
                        {urlEditingPassword[url.shortUrl] && (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              className="w-24 bg-gray-300 text-xs p-2 rounded"
                              value={urlPasswordInputs[url.shortUrl] || ""}
                              onChange={(e) =>
                                updateUrlPasswordInput(
                                  url.shortUrl,
                                  e.target.value
                                )
                              }
                              placeholder="New Password"
                            />
                            <button
                            className="disabled:text-gray-400"
                              onClick={() =>
                                handleUrlPasswordSubmit(url.shortUrl)
                              }
                              disabled={!urlPasswordInputs[url.shortUrl]}
                            >
                              <span className="material-icons md-18 cursor-pointer">
                                check
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                toggleUrlPasswordEdit(url.shortUrl)
                              }
                            >
                              <span className="material-icons md-18 cursor-pointer">
                                close
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* password ends */}

                    {/* Actions start */}

                    <td className="p-4 border-b border-gray-200 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditSource(url.shortUrl)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Tooltip text="Edit source url">
                            <span className="material-icons">edit</span>
                          </Tooltip>

                          {/* Edit Source */}
                        </button>
                        <button
                          onClick={() =>
                            handleToggleActive(url.shortUrl, url.active)
                          }
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {url.active ? (
                            <Tooltip text="Deactivate">
                              <span className="material-icons text-green-600 hover:text-green-700">
                                toggle_on
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip text="Activate">
                              <span className="material-icons text-red-600 hover:text-red-700">
                                toggle_off
                              </span>
                            </Tooltip>
                          )}
                        </button>
                        <button
                          onClick={() => deleteShortedUrls(url.shortUrl)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <span className="material-icons">delete_forever</span>
                        </button>
                      </div>

                      {isSourceChangeFocused &&
                        activeShortCode === url.shortUrl && (
                          <ChangeSourceCard
                            shortCode={activeShortCode}
                            onClose={() => setIsSourceChangeFocused(false)}
                            dataFromChangedSourceCard={
                              dataFromChangedSourceCard
                            }
                          />
                        )}
                    </td>
                    {/* Actions start */}

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center border-b border-gray-200"
                  >
                    No URLs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 p-4">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          © 2025 URL Shortener Service. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
