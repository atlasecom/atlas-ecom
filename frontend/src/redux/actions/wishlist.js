import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";

// add to wishlist
export const addToWishlist = (productId) => async (dispatch, getState) => {
  try {
    const token = getAuthToken();
    console.log('Add to wishlist - Token:', token ? 'Token exists' : 'No token');
    console.log('Add to wishlist - Product ID:', productId);
    console.log('Add to wishlist - Product ID type:', typeof productId);
    console.log('Add to wishlist - Server URL:', server);
    
    if (!token) {
      throw new Error("Please login to add items to wishlist");
    }

    // Basic validation
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const url = `${server}/auth/wishlist/${productId}`;
    console.log('Add to wishlist - Full URL:', url);

    const response = await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      // Fetch updated wishlist from server
      const wishlistResponse = await axios.get(`${server}/auth/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch({
        type: "setWishlist",
        payload: wishlistResponse.data.wishlist,
      });

      // Update localStorage as backup
      localStorage.setItem(
        "wishlistItems",
        JSON.stringify(wishlistResponse.data.wishlist)
      );
    }

    return response.data;
  } catch (error) {
    console.error("Add to wishlist error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error config:", error.config);
    throw error;
  }
};

// remove from wishlist
export const removeFromWishlist = (productId) => async (dispatch, getState) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Please login to remove items from wishlist");
    }

    const response = await axios.delete(
      `${server}/auth/wishlist/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      // Fetch updated wishlist from server
      const wishlistResponse = await axios.get(`${server}/auth/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch({
        type: "setWishlist",
        payload: wishlistResponse.data.wishlist,
      });

      // Update localStorage as backup
      localStorage.setItem(
        "wishlistItems",
        JSON.stringify(wishlistResponse.data.wishlist)
      );
    }

    return response.data;
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    throw error;
  }
};

// load wishlist from server
export const loadWishlist = () => async (dispatch, getState) => {
  try {
    const token = getAuthToken();
    if (!token) {
      // If not logged in, load from localStorage as fallback
      const localWishlist = localStorage.getItem("wishlistItems");
      if (localWishlist) {
        dispatch({
          type: "setWishlist",
          payload: JSON.parse(localWishlist),
        });
      }
      return;
    }

    const response = await axios.get(`${server}/auth/wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      dispatch({
        type: "setWishlist",
        payload: response.data.wishlist,
      });

      // Update localStorage as backup
      localStorage.setItem(
        "wishlistItems",
        JSON.stringify(response.data.wishlist)
      );
    }
  } catch (error) {
    console.error("Load wishlist error:", error);
    // Fallback to localStorage on error
    const localWishlist = localStorage.getItem("wishlistItems");
    if (localWishlist) {
      dispatch({
        type: "setWishlist",
        payload: JSON.parse(localWishlist),
      });
    }
  }
};

// check if product is in wishlist
export const checkWishlistStatus = (productId) => async (dispatch, getState) => {
  try {
    const token = getAuthToken();
    if (!token) {
      return false;
    }

    const response = await axios.get(`${server}/auth/wishlist/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.isInWishlist;
  } catch (error) {
    console.error("Check wishlist status error:", error);
    return false;
  }
};