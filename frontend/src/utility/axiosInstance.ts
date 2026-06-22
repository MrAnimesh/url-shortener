import axios from "axios";
import { addError } from "../exception_handling/useErrorStore";
const axiosInstance = axios.create({
  baseURL: "http://localhost:8081",
});

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("Refresh token not found");

  const response = await axios.post(
    "http://localhost:8081/api/v1/auth/public/refreshtoken",
    { refreshToken }
  );
  const accessToken = response.data.accessToken;
  localStorage.setItem("accessToken", accessToken);
  window.dispatchEvent(new Event("auth-token-updated"));
  return accessToken;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    } else {
      console.log("response: ", error.response);
      // Show error using global function (no need to import anything!)
      addError(error?.response?.status+": "+error?.response?.data?.message);
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
