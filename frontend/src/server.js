// Local Development Configuration - Using new backendd server
//export const server = "http://localhost:5000";
//export const backend_url = "http://localhost:5000";
//export const socket_endpoint = "http://localhost:5000";

// Production Configuration (uncomment when ready)
// Production Configuration - Uses environment variables
export const server = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
export const backend_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
export const socket_endpoint = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
