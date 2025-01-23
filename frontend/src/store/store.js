import { legacy_createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "./authReducer";
import snackbarReducer from './snackbar.reducer'

const rootReducer = combineReducers({
      authorization :authReducer,
      snackbar:snackbarReducer,
})

export const store = legacy_createStore(rootReducer,applyMiddleware(thunk))