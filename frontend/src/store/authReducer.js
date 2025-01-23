import {
  SIGNIN,
  SIGNOUT
} from "./actionTypes";

const defaultAuthState = {
  username: "Test user 1",
  first_name:"",
  last_name:"",
  token: null,
  email: null,
  gender:null,
};

export const authReducer = (state = JSON.parse(localStorage.getItem('auth')) || defaultAuthState, { type, payload }) => {
  switch (type) {
    case SIGNIN:
      localStorage.setItem('auth',JSON.stringify(payload))
      return state = {...payload}
    case SIGNOUT :
      localStorage.removeItem('auth')
      return state  = defaultAuthState
    default:
      return state;
  }
};
