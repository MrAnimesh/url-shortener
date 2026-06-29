import React, { useEffect, useState } from "react";
import axiosInstance from "../utility/axiosInstance";
import ShortnerCard from "../components/ShortnerCard";
import ChangeSourceCard from "../components/ChangeSourceCard";
import DatePickerCard from "../components/ChooseDeactivation";
import Tooltip from "../components/Tooltip";
import HeaderDashboard from "../components/HeaderDashboard";
import PremiumOnly from "../components/PremiumOnly";
import QrCodeModal from "../components/QrCodeModal";
import { getPublicShortUrl } from "../utility/config";
import { UseGlobalContext } from "../context/GlobalContext";

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
  qrCodeAvailable: boolean;
}

interface QrDetail {
  id: number;
  urlId: number;
  grid: boolean[][];
}

type SortField =
  | "originalUrl"
  | "shortUrl"
  | "createdAt"
  | "count"
  | "active"
  | "expiresAt";

interface SortConfig {
  key: SortField;
  direction: "asc" | "desc";
}

const compareDates = (firstDate: string, secondDate: string) => {
  return new Date(firstDate).getTime() - new Date(secondDate).getTime();
};

const compareUrls = (firstUrl: Url, secondUrl: Url, field: SortField) => {
  switch (field) {
    case "originalUrl":
      return firstUrl.originalUrl.localeCompare(secondUrl.originalUrl);
    case "shortUrl":
      return firstUrl.shortUrl.localeCompare(secondUrl.shortUrl);
    case "createdAt":
      return compareDates(firstUrl.createdAt, secondUrl.createdAt);
    case "expiresAt":
      return compareDates(firstUrl.expiresAt, secondUrl.expiresAt);
    case "count":
      return firstUrl.count - secondUrl.count;
    case "active":
      return Number(firstUrl.active) - Number(secondUrl.active);
  }
};

const sortUrls = (urls: Url[], sortConfig: SortConfig) => {
  const sortedUrls = [...urls];

  sortedUrls.sort((firstUrl, secondUrl) => {
    if (sortConfig.key === "expiresAt") {
      if (!firstUrl.expiresAt && !secondUrl.expiresAt) return 0;
      if (!firstUrl.expiresAt) return 1;
      if (!secondUrl.expiresAt) return -1;
    }

    const comparison = compareUrls(firstUrl, secondUrl, sortConfig.key);
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });

  return sortedUrls;
};

const UserDashboard: React.FC = () => {
  const { isPremiumUser, isAdmin, hasPermission } = UseGlobalContext();
  const canUseQrCode =
    isPremiumUser && (isAdmin || hasPermission("QR_CODE"));
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
  const [qrLoadingUrlId, setQrLoadingUrlId] = useState<number | null>(null);
  const [selectedQr, setSelectedQr] = useState<{
    detail: QrDetail;
    shortCode: string;
  } | null>(null);

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
    setUrlPasswordVisible((prev) => ({
      ...prev,
      [shortUrl]: !prev[shortUrl],
    }));
  };

  const toggleUrlPasswordEdit = (shortUrl: string) => {
    setUrlEditingPassword((prev) => ({
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
        isSuccess = res?.data?.data;
        console.log(res.data);
      } else {
        const res = await axiosInstance.post(
          `/api/v1/urls/activate/${shortCode}`
        );
        isSuccess = res?.data?.data;
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
      await navigator.clipboard.writeText(getPublicShortUrl(shortUrl));
      alert("URL copied to clipboard!");
    } catch (err) {
      alert("Failed to copy URL: " + err);
    }
  };

  const handleQrCode = async (url: Url) => {
    if (!canUseQrCode) return;

    setQrLoadingUrlId(url.id);

    try {
      const response = url.qrCodeAvailable
        ? await axiosInstance.get<QrDetail>(`/api/v1/qr/${url.id}`)
        : await axiosInstance.post<QrDetail>("/api/v1/qr", { urlId: url.id });

      setUrls((currentUrls) =>
        currentUrls.map((currentUrl) =>
          currentUrl.id === url.id
            ? { ...currentUrl, qrCodeAvailable: true }
            : currentUrl
        )
      );
      setSelectedQr({ detail: response.data, shortCode: url.shortUrl });
    } catch {
      return;
    } finally {
      setQrLoadingUrlId(null);
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

  const requestSort = (key: SortField) => {
    const isCurrentField = sortConfig.key === key;
    const isAscending = sortConfig.direction === "asc";
    const direction = isCurrentField && isAscending ? "desc" : "asc";

    setSortConfig({ key, direction });
  };

  const sortedUrls = sortUrls(urls, sortConfig);

  const filteredUrls = sortedUrls.filter(
    (url) =>
      url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.shortUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIndicator = (key: SortField): string => {
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
      await axiosInstance.put(`/api/v1/urls/resetExpires/${shortCode}`);
      setUrls(
        urls.map((url) =>
          url.shortUrl === shortCode ? { ...url, expiresAt: "" } : url
        )
      );
    } catch {
      console.log("Some error occurred");
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
    } catch (err) {
      console.log("Unable to set password", err);
    }
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
    <div className="min-h-screen bg-white">
      <HeaderDashboard/>

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
            URL Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your shortened links, click limits, expiry settings, and passwords.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/95 p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Total URLs</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{urls.length}</p>
          </div>
          <div className="bg-white/95 p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Active URLs</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {urls.filter((url) => url.active).length}
            </p>
          </div>
          <div className="bg-white/95 p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Total Clicks</h3>
            <p className="mt-2 text-3xl font-bold text-cyan-600">
              {urls.reduce((sum, url) => sum + url.count, 0)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white/95 border border-gray-200 shadow-sm rounded-lg p-4">
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search URLs..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <PremiumOnly requiresPremium={false} requiredPermissions={["CREATE_SHORT_URL"]}>
            <button
              type="button"
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-semibold px-4 py-3 rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all w-full sm:w-auto"
              onClick={renderChildComponent}
            >
              Short URL
            </button>
            </PremiumOnly>
            <PremiumOnly requiredPermissions={["CREATE_SHORT_URL", "CUSTOM_ALIAS"]}>
            <button
              type="button"
              className="border border-indigo-200 text-indigo-700 font-semibold px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors w-full sm:w-auto"
              onClick={renderCustomDomainCard}
            >
              Generate Custom Link
            </button>
            </PremiumOnly>
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

        <div className="bg-white/95 rounded-lg shadow-sm overflow-x-auto border border-gray-200">
          <table className="w-full border-collapse mb-20">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th
                  className="p-4 text-center font-semibold cursor-pointer border-b border-gray-200 hover:bg-indigo-50 transition"
                  onClick={() => requestSort("originalUrl")}
                >
                  Original URL{getSortIndicator("originalUrl")}
                </th>
                <th
                  className="p-4 text-center font-semibold cursor-pointer border-b border-gray-200 hover:bg-indigo-50 transition"
                  onClick={() => requestSort("shortUrl")}
                >
                  Short URL{getSortIndicator("shortUrl")}
                </th>
                <th
                  className="p-4 text-center font-semibold cursor-pointer border-b border-gray-200 hover:bg-indigo-50 transition"
                  onClick={() => requestSort("createdAt")}
                >
                  Created{getSortIndicator("createdAt")}
                </th>
                <th
                  className="p-4 text-center font-semibold cursor-pointer border-b border-gray-200 hover:bg-indigo-50 transition"
                  onClick={() => requestSort("count")}
                >
                  Clicks{getSortIndicator("count")}
                </th>
                <th
                  className="p-4 text-center font-semibold cursor-pointer border-b border-gray-200 hover:bg-indigo-50 transition"
                  onClick={() => requestSort("active")}
                >
                  Status{getSortIndicator("active")}
                </th>
                <th className="p-4 text-center font-semibold border-b border-gray-200">
                  Max Clicks Allowed
                </th>
                <th className="p-4 text-center font-semibold border-b border-gray-200"
                    onClick={() => requestSort("expiresAt")}
                >
                  Expires {getSortIndicator("expiresAt")}
                </th>
                <th className="p-4 text-center font-semibold border-b border-gray-200">
                  Password
                </th>
                <th className="p-4 text-center font-semibold border-b border-gray-200">
                  QR Code
                </th>
                <th className="p-4 text-center font-semibold border-b border-gray-200">
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
                        ? "hover:bg-indigo-50/60"
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
                          className="ml-2 text-indigo-500 hover:text-indigo-700"
                        >
                          <span
                            className={`material-icons md-18 ${
                              qrLoadingUrlId === url.id ? "animate-spin" : ""
                            }`}
                          >
                            open_in_new
                          </span>
                        </a>
                      </div>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <a
                          href={getPublicShortUrl(url.shortUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          {getPublicShortUrl(url.shortUrl)}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(url.shortUrl)}
                          className="ml-2 text-indigo-500 hover:text-indigo-700"
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          url.active
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {url.active ? "Active" : "Inactive"}
                      </span>
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
                        <PremiumOnly requiredPermissions={["SET_MAX_CLICK"]}>
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
                          className="ml-1 text-gray-400 hover:text-indigo-600"
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
                        </PremiumOnly>

                        {/* Click limit input popup */}
                        {clicksInputOpen &&
                          url.shortUrl === activeShortCode && (
                            <div className="absolute left-0 mt-1 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-10 p-3">
                              <label className="block text-xs text-gray-700 mb-1">
                                Max number of clicks:
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={maxClicks}
                                onChange={(e) => setMaxClicks(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Enter click limit"
                              />
                              <div className="flex justify-end space-x-2 pt-2">
                                <button
                                  onClick={() => {
                                    setActiveShortCode("");
                                    setClickInputOpen(false);
                                    setMaxClicks("");
                                  }}
                                  className="px-2 py-1 text-xs border border-gray-200 text-gray-700 rounded hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handleSetClickLimit(url.shortUrl)
                                  }
                                  className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300"
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
                      <PremiumOnly requiredPermissions={["SET_EXPIRE_TIME"]}>
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
                            setShowDatePicker(true);
                            setActiveShortCode(url.shortUrl);
                          }}
                          className="ml-1 text-gray-400 hover:text-indigo-600"
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
                      </PremiumOnly>
                    </td>

                    {/* expires at end */}

                    {/* password starts */}
                    

                    <td className="px-4 py-3 text-sm">
                      <PremiumOnly requiredPermissions={["SET_PASSWORD"]}>
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
                              className="w-24 bg-white border border-gray-300 text-xs p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                      </PremiumOnly>
                    </td>

                    {/* password ends */}

                    <td className="p-4 text-center border-b border-gray-200">
                      <PremiumOnly
                        requiredPermissions={["QR_CODE"]}
                        fallbackMessage="QR code access is not enabled"
                      >
                        <button
                          type="button"
                          onClick={() => void handleQrCode(url)}
                          disabled={!canUseQrCode || qrLoadingUrlId === url.id}
                          className="inline-flex h-9 w-24 items-center justify-center gap-1.5 rounded-md border border-indigo-200 bg-white px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                          <span className="material-icons md-18">
                            {qrLoadingUrlId === url.id
                              ? "progress_activity"
                              : "qr_code_2"}
                          </span>
                          {qrLoadingUrlId === url.id
                            ? "Loading"
                            : url.qrCodeAvailable
                              ? "View"
                              : "Generate"}
                        </button>
                      </PremiumOnly>
                    </td>

                    {/* Actions start */}

                    <td className="p-4 border-b border-gray-200 text-right">
                      <div className="flex justify-end space-x-2">
                        <PremiumOnly requiredPermissions={["REPLACE"]}>
                        <button
                          onClick={() => handleEditSource(url.shortUrl)}
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          <Tooltip text="Edit source url">
                            <span className="material-icons">edit</span>
                          </Tooltip>

                          {/* Edit Source */}
                        </button>
                        </PremiumOnly>
                        <PremiumOnly requiredPermissions={["ACTIVATION"]}>
                        <button
                          onClick={() =>
                            handleToggleActive(url.shortUrl, url.active)
                          }
                          className="text-indigo-500 hover:text-indigo-700"
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
                        </PremiumOnly>
                        <PremiumOnly requiresPremium={false} requiredPermissions={["DELETE_URL"]}>
                        <button
                          onClick={() => deleteShortedUrls(url.shortUrl)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <span className="material-icons">delete_forever</span>
                        </button>
                        </PremiumOnly>
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
                    colSpan={10}
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

      {selectedQr && (
        <QrCodeModal
          grid={selectedQr.detail.grid}
          shortCode={selectedQr.shortCode}
          onClose={() => setSelectedQr(null)}
        />
      )}

      <footer className="bg-white/80 border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          © 2025 URL Shortener Service. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
