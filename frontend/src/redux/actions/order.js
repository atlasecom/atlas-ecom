import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";

// get all orders of user - NOT IMPLEMENTED IN BACKEND YET
export const getAllOrdersOfUser = (userId) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersUserRequest",
    });

    // TODO: Backend doesn't have order endpoints yet
    throw new Error("Order functionality not implemented in backend yet");
  } catch (error) {
    dispatch({
      type: "getAllOrdersUserFailed",
      payload: error.message || "Orders not available",
    });
  }
};

// Get all orders of seller - NOT IMPLEMENTED IN BACKEND YET
export const getAllOrdersOfShop = (shopId) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersShopRequest",
    });

    // TODO: Backend doesn't have order endpoints yet
    throw new Error("Order functionality not implemented in backend yet");
  } catch (error) {
    dispatch({
      type: "getAllOrdersShopFailed",
      payload: error.message || "Orders not available",
    });
  }
};

// get all orders of Admin - NOT IMPLEMENTED IN BACKEND YET
export const getAllOrdersOfAdmin = () => async (dispatch) => {
  try {
    dispatch({
      type: "adminAllOrdersRequest",
    });

    // TODO: Backend doesn't have order endpoints yet
    throw new Error("Order functionality not implemented in backend yet");
  } catch (error) {
    dispatch({
      type: "adminAllOrdersFailed",
      payload: error.message || "Orders not available",
    });
  }
};
