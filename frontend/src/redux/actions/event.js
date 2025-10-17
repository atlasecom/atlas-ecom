import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";

// create event
export const createevent = (newForm) => async (dispatch) => {
  try {
    dispatch({
      type: "eventCreateRequest",
    });

    const token = getAuthToken();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    console.log('Creating event with form data');
    const { data } = await axios.post(`${server}/api/events`, newForm, config);
    
    console.log('Create event response:', data);
    
    dispatch({
      type: "eventCreateSuccess",
      payload: data,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    dispatch({
      type: "eventCreateFail",
      payload: error.response?.data?.message || "Failed to create event",
    });
  }
};

// get all events of a shop
export const getAllEventsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAlleventsShopRequest",
    });

    const token = getAuthToken();
    console.log('Fetching events for shop:', id);
    
    const { data } = await axios.get(`${server}/api/shops/${id}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('Events response:', data);
    
    dispatch({
      type: "getAlleventsShopSuccess",
      payload: data.events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    dispatch({
      type: "getAlleventsShopFailed",
      payload: error.response?.data?.message || "Failed to fetch events",
    });
  }
};

// delete event of a shop
export const deleteEvent = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteeventRequest",
    });

    const token = getAuthToken();
    console.log('Deleting event with ID:', id);
    
    const { data } = await axios.delete(`${server}/api/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('Delete event response:', data);
    
    dispatch({
      type: "deleteeventSuccess",
      payload: data.message,
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    dispatch({
      type: "deleteeventFailed",
      payload: error.response?.data?.message || "Failed to delete event",
    });
  }
};

// get all events
export const getAllEvents = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAlleventsRequest",
    });

    const { data } = await axios.get(`${server}/events?limit=50`);
    dispatch({
      type: "getAlleventsSuccess",
      payload: data.events,
    });
  } catch (error) {
    dispatch({
      type: "getAlleventsFailed",
      payload: error.response?.data?.message || "Failed to fetch events",
    });
  }
};

// clear errors
export const clearErrors = () => async (dispatch) => {
  dispatch({
    type: "clearErrors",
  });
};
