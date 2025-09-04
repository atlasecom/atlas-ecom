import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";

// create product
export const createProduct = (newForm, shopId) => async (dispatch) => {
  try {
    dispatch({
      type: "productCreateRequest",
    });

    const config = { headers: { "Content-Type": "multipart/form-data" } };

    const { data } = await axios.post(
      `${server}/products/${shopId}`,
      newForm,
      config
    );
    dispatch({
      type: "productCreateSuccess",
      payload: data.product,
    });
  } catch (error) {
    dispatch({
      type: "productCreateFail",
      payload: error.response?.data?.message || "Failed to create product",
    });
  }
};

// get All Products of a shop
export const getAllProductsShop = (shopId) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsShopRequest",
    });

    const token = getAuthToken();
    const { data } = await axios.get(`${server}/shops/${shopId}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({
      type: "getAllProductsShopSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllProductsShopFailed",
      payload: error.response.data.message,
    });
  }
};

// delete product of a shop
export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteProductRequest",
    });

    const token = getAuthToken();
    console.log('Deleting product with ID:', id);
    
    const { data } = await axios.delete(
      `${server}/api/products/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Delete response:', data);

    dispatch({
      type: "deleteProductSuccess",
      payload: data.message,
    });
  } catch (error) {
    console.error('Delete product error:', error);
    dispatch({
      type: "deleteProductFailed",
      payload: error.response?.data?.message || "Failed to delete product",
    });
  }
};

// get all products
export const getAllProducts = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsRequest",
    });

    const { data } = await axios.get(`${server}/products`);
    dispatch({
      type: "getAllProductsSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllProductsFailed",
      payload: error.response?.data?.message || "Failed to fetch products",
    });
  }
};

// clear errors
export const clearErrors = () => async (dispatch) => {
  dispatch({
    type: "clearErrors",
  });
};
