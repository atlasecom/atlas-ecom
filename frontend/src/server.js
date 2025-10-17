// Production Configuration - Uses environment variables
const getBackendUrl = () => {
  // Check if we're in production (deployed on Render)
  if (window.location.hostname === 'atlas-ecom-frontend.onrender.com') {
    const url = "https://atlas-ecom-1.onrender.com";
    console.log('Production Backend URL configured as:', url);
    return url;
  }
  
  // Local development
  const url = "http://localhost:5000";

  console.log('Local Backend URL configured as:', url);
  console.log('Current hostname:', window.location.hostname);
  
  return url;
};

export const server = getBackendUrl();
export const backend_url = getBackendUrl();
export const socket_endpoint = getBackendUrl();
