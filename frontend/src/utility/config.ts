export const API_BASE_URL =
  import.meta.env.API_BASE_URL || "http://localhost:8081";

export const PUBLIC_SHORT_URL_BASE =
  import.meta.env.PUBLIC_SHORT_URL_BASE || "http://localhost:8081";

export const getApiUrl = (path: string) => {
  return `${API_BASE_URL}${path}`;
};

export const getPublicShortUrl = (shortCode: string) => {
  return `${PUBLIC_SHORT_URL_BASE}/${shortCode}`;
};
