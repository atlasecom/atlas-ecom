// Role-based utility functions

export const USER_ROLES = {
  USER: "user",
  SELLER: "seller",
  ADMIN: "admin",
};

// Check if user has a specific role
export const hasRole = (user, role) => {
  return user && user.role === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (user, roles) => {
  return user && roles.includes(user.role);
};

// Check if user is seller
export const isSeller = (user) => {
  return hasRole(user, USER_ROLES.SELLER);
};

// Check if user is admin
export const isAdmin = (user) => {
  return hasRole(user, USER_ROLES.ADMIN);
};

// Check if user is regular user
export const isUser = (user) => {
  return hasRole(user, USER_ROLES.USER);
};

// Check if user can access seller dashboard
export const canAccessSellerDashboard = (user) => {
  return hasAnyRole(user, [USER_ROLES.SELLER, USER_ROLES.ADMIN]);
};

// Check if user can access admin dashboard
export const canAccessAdminDashboard = (user) => {
  return hasRole(user, USER_ROLES.ADMIN);
};

// Get dashboard route based on user role
export const getDashboardRoute = (user) => {
  if (isAdmin(user)) return "/admin/dashboard";
  if (isSeller(user)) return "/dashboard";
  return "/profile";
};

// Get user display name based on role
export const getUserRoleDisplay = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return "Administrator";
    case USER_ROLES.SELLER:
      return "Seller";
    case USER_ROLES.USER:
      return "Customer";
    default:
      return "User";
  }
};
