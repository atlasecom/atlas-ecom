// Production Configuration - Uses environment variables
const getBackendUrl = () => {
  const url = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  // Force HTTPS for production URLs
  if (url.includes('onrender.com') && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

export const server = getBackendUrl();
export const backend_url = getBackendUrl();
export const socket_endpoint = getBackendUrl();
