import { legacy_createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "./authReducer";
import snackbarReducer from './snackbar.reducer'
import {contactsReducer,searchUsersReducer} from "./Contacts/contacts.reducers";
import { allMessagesReducer } from "./Messages/messages.reducers";
import socketReducer from "./Socket/socket.reducer";

const rootReducer = combineReducers({
      authorization :authReducer,
      snackbar:snackbarReducer,
      contacts:contactsReducer,
      search:searchUsersReducer,
      allMessages : allMessagesReducer,
      socket:socketReducer
})

export const store = legacy_createStore(rootReducer,applyMiddleware(thunk))