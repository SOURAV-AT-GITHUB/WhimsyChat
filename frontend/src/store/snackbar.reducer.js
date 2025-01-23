import { OPEN_SNACKBAR, CLOSE_SNACKBAR } from "./actionTypes";
const defaultState = {
  open: false,
  severity: "",
  message: "",
};
export default function snackbarReducer  (state = defaultState, { type, payload }) {
  switch (type) {
    case OPEN_SNACKBAR: {
      return (state = {
        open: true,
        severity: payload.severity,
        message: payload.message,
      });
    }
    case CLOSE_SNACKBAR: {
      return state = {...defaultState,open:false};
    }
    default:
      return state;
  }
};
