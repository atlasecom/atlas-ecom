// Local Testing Configuration
// This file contains configuration for local development with production database

const localConfig = {
  // Backend API URL (Local testing server)
  SERVER_URL: 'http://localhost:5000',
  BACKEND_URL: 'http://localhost:5000',
  SOCKET_ENDPOINT: 'http://localhost:5000',
  
  // Production API URL (for comparison/testing)
  PRODUCTION_SERVER_URL: 'https://atlas-ecom-1.onrender.com',
  PRODUCTION_BACKEND_URL: 'https://atlas-ecom-1.onrender.com',
  
  // Testing Configuration
  TESTING_MODE: true,
  ENVIRONMENT: 'local',
  
  // Feature Flags for Testing
  FEATURES: {
    NEW_FEATURE: true,
    BETA_FEATURE: false,
    DEBUG_MODE: true
  }
};

export default localConfig;
