import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
// load user (unified authentication)
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadUserRequest",
    });
    const token = getAuthToken();
    const { data } = await axios.get(`${server}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: "LoadUserSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "LoadUserFail",
      payload: error.response?.data?.message || "Failed to load user",
    });
  }
};

// load seller (legacy - for backward compatibility)
// TODO: Gradually migrate components to use loadUser instead
export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadSellerRequest",
    });
    const token = getAuthToken();
    const { data } = await axios.get(`${server}/shop/getSeller`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: "LoadSellerSuccess",
      payload: data.seller,
    });
  } catch (error) {
    dispatch({
      type: "LoadSellerFail",
      payload: error.response.data.message,
    });
  }
};

// User update information
export const updateUserInformation =
  (name, email, phoneNumber, address) => async (dispatch) => {
    try {
      dispatch({
        type: "updateUserInfoRequest",
      });
      const token = getAuthToken();
      const { data } = await axios.put(
        `${server}/users/profile`,
        {
          name,
          phoneNumber,
          address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch({
        type: "updateUserInfoSuccess",
        payload: data.user,
      });
    } catch (error) {
      dispatch({
        type: "updateUserInfoFailed",
        payload: error.response?.data?.message || "Failed to update user info",
      });
    }
  };

// update user address
export const updatUserAddress =
  (country, city, address1, address2, zipCode, addressType) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "updateUserAddressRequest",
      });

      const token = getAuthToken();
      const { data } = await axios.put(
        `${server}/user/update-user-addresses`,
        {
          country,
          city,
          address1,
          address2,
          zipCode,
          addressType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch({
        type: "updateUserAddressSuccess",
        payload: {
          successMessage: "User address updated succesfully!",
          user: data.user,
        },
      });
    } catch (error) {
      dispatch({
        type: "updateUserAddressFailed",
        payload: error.response.data.message,
      });
    }
  };

// delete user address
export const deleteUserAddress = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteUserAddressRequest",
    });

    const token = getAuthToken();
    const { data } = await axios.delete(
      `${server}/user/delete-user-address/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: "deleteUserAddressSuccess",
      payload: {
        successMessage: "Address deleted successfully!",
        user: data.user,
      },
    });
  } catch (error) {
    dispatch({
      type: "deleteUserAddressFailed",
      payload: error.response.data.message,
    });
  }
};

// get all users --- admin
export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllUsersRequest",
    });

    const token = getAuthToken();
    const { data } = await axios.get(`${server}/user/admin-all-users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: "getAllUsersSuccess",
      payload: data.users,
    });
  } catch (error) {
    dispatch({
      type: "getAllUsersFailed",
      payload: error.response.data.message,
    });
  }
};

// Change password
export const changePassword = (currentPassword, newPassword) => async (dispatch) => {
  try {
    dispatch({
      type: "changePasswordRequest",
    });
    const token = getAuthToken();
    const { data } = await axios.put(
      `${server}/users/change-password`,
      {
        currentPassword,
        newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({
      type: "changePasswordSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "changePasswordFailed",
      payload: error.response?.data?.message || "Failed to change password",
    });
  }
};

// logout user
export const logoutUser = () => (dispatch) => {
  dispatch({
    type: "logoutUser",
  });
};
