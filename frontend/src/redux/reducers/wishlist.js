import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  wishlist: [],
  loading: false,
  error: null,
};

export const wishlistReducer = createReducer(initialState, {
  setWishlist: (state, action) => {
    state.wishlist = action.payload;
    state.loading = false;
    state.error = null;
  },

  addToWishlist: (state, action) => {
    const item = action.payload;
    const isItemExist = state.wishlist.find((i) => i._id === item._id);
    if (!isItemExist) {
      state.wishlist.push(item);
    }
  },

  removeFromWishlist: (state, action) => {
    state.wishlist = state.wishlist.filter((i) => i._id !== action.payload);
  },

  setWishlistLoading: (state, action) => {
    state.loading = action.payload;
  },

  setWishlistError: (state, action) => {
    state.error = action.payload;
    state.loading = false;
  },

  clearWishlist: (state) => {
    state.wishlist = [];
    state.loading = false;
    state.error = null;
  },
});
