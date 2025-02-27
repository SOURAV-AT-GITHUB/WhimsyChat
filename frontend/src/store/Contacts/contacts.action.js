import {
    FETCH_CONTACTS_REQUEST,
    FETCH_CONTACTS_SUCCESS,
    FETCH_CONTACTS_ERROR,
    SEARCH_USERS_REQUEST,
    SEARCH_USERS_SUCCESS,
    SEARCH_USERS_ERROR,
    RESET_SEARCH,
    SIGNOUT,
    OPEN_SNACKBAR
  } from "../actionTypes";
import axios from "axios"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  export function fetchContacts(token,contactsId){
    return async(dispatch)=>{
        dispatch({type:FETCH_CONTACTS_REQUEST})
        try {
            const response = await axios.get(`${BACKEND_URL}/contacts/fetch-contacts/${contactsId}`,{headers:{
                Authorization:`Bearer ${token}`
            }})
            dispatch({type:FETCH_CONTACTS_SUCCESS,payload:response.data.data})
        } catch (error) {
          if(error.status === 401){
            dispatch({type:SIGNOUT})
            dispatch({type:OPEN_SNACKBAR,payload:{message:error.response?.data.message ||error.message,severity:'error'}})
          }
            dispatch({type:FETCH_CONTACTS_ERROR,payload:error.response?.data.message || error.message})
        }
    }
  }
  export function searchUsers (token,query){
    return async(dispatch)=>{
      dispatch({type:SEARCH_USERS_REQUEST})
      try {
        const response = await axios.get(`${BACKEND_URL}/contacts/search?query=${query}`,{headers:{
          Authorization:`Bearer ${token}`
        }})
        dispatch({type:SEARCH_USERS_SUCCESS,payload:response.data.data})
      } catch (error) {
        if(error.status === 401){
          dispatch({type:SIGNOUT})
          dispatch({type:OPEN_SNACKBAR,payload:{message:error.response?.data.message ||error.message,severity:'error'}})
          dispatch(resetSearch())
        }else{
          dispatch({type:SEARCH_USERS_ERROR,payload:error.response?.data.message||error.message})
        }
      }
    }
  }

  export function resetSearch(){
    return (dispatch)=>{
      dispatch({type:RESET_SEARCH})
    }
  }