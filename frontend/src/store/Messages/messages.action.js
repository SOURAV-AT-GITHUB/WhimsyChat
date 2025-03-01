import axios from "axios";
import {
  GET_MESSAGES_REQUEST,
  GET_MESSAGES_SUCCESS,
  GET_MESSAGES_ERROR,
} from "../actionTypes";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export function getAllMessages(token, conversationId) {
  return async (dispatch) => {
    dispatch({ type: GET_MESSAGES_REQUEST });
    try {
      const response = await axios.get(
        `${BACKEND_URL}/messages/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch({
        type: GET_MESSAGES_SUCCESS,
        payload: { conversationId, data: response.data.data },
      });
    } catch (error) {
      console.log(error)
      dispatch({
        type: GET_MESSAGES_ERROR,
        payload: error.rresponse?.data.message || error.message,
      });
    }
  };
}
