import axios from "axios";
import axiosInstance from "./axiosInstance";

export const checkAuth = async () => {
  axiosInstance.get("/api/verifytoken");
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  const response = await axios.post(
    `http://localhost:8081/api/auth/public/logout`,
    { refreshToken }
  );

  localStorage.clear();

  if (window.location.pathname === "/") window.location.reload();
  else window.location.href = "/";
};


let showErrorGlobal: ((msg: string) => void) | null = null;

export const registerErrorFn = (fn: (msg: string) => void) => {
  showErrorGlobal = fn;
};

export const showGlobalError = (msg: string) => {
  if (showErrorGlobal) showErrorGlobal(msg);
};
