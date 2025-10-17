import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";

// get all sellers --- admin
export const getAllSellers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllSellersRequest",
    });

    const token = getAuthToken();
    const { data } = await axios.get(`${server}/api/admin/sellers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: "getAllSellersSuccess",
      payload: data.sellers,
    });
  } catch (error) {
    dispatch({
      type: "getAllSellerFailed",
      payload: error.response?.data?.message || "Failed to fetch sellers",
    });
  }
};
