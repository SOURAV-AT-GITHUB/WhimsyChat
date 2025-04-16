import {
  SOCKET_CONNECTION_REQUEST,
  SOCKET_CONNECTION_SUCCESS,
  SOCKET_CONNECTION_ERROR,
  SOCKET_CONNECTION_DISCONNECTED,
} from "../actionTypes";
const defaultState = {
  isSocketConncted: false,
  isSocketError: null,
  socket: null,
  isSocketConnecting: false,
};
export default function socketReducer(state = defaultState, { type, payload }) {
  switch (type) {
    case SOCKET_CONNECTION_REQUEST:
      return { ...defaultState, isSocketConnecting: true };
    case SOCKET_CONNECTION_SUCCESS:
      return { ...defaultState, isSocketConncted: true, socket: payload };
    case SOCKET_CONNECTION_ERROR:
      return { ...defaultState, isSocketError: payload };
    case SOCKET_CONNECTION_DISCONNECTED:
      return defaultState;
    default:
      return state;
  }
}
