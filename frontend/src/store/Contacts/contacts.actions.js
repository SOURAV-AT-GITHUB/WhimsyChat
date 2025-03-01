import {
    FETCH_CONTACTS_REQUEST,
    FETCH_CONTACTS_SUCCESS,
    FETCH_CONTACTS_ERROR,
    SEARCH_USERS_REQUEST,
    SEARCH_USERS_SUCCESS,
    SEARCH_USERS_ERROR,
    RESET_SEARCH,
    SIGNOUT,
    OPEN_SNACKBAR,
    ADD_EMPTY_MESSAGES_ARRAY,
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
            for (let contact of response.data.data) dispatch({type:ADD_EMPTY_MESSAGES_ARRAY,payload:contact._id})
        } catch (error) {
          if(error.status === 401){
            dispatch({type:SIGNOUT})
            dispatch({type:OPEN_SNACKBAR,payload:{message:error.response?.data.message ||error.message,severity:'error'}})
          }
            dispatch({type:FETCH_CONTACTS_ERROR,payload:error.response?.data.message || error.message})
        }
    }
  }
  export function searchUsers (token,query,existingContacts){
    return async(dispatch)=>{
      dispatch({type:SEARCH_USERS_REQUEST})
      try {
        const response = await axios.get(`${BACKEND_URL}/contacts/search?query=${query}`,{headers:{
          Authorization:`Bearer ${token}`
        }})
        const newResult = []
        const existingResult =[]
        response.data.data.forEach(user=>{
          for(let contact of existingContacts){
            if(contact.participants[0]._id === user._id) existingResult.push(contact)
            else newResult.push({isGroup:false,_id:null,isNew:true,participants:[user]})
          }
        })
        dispatch({type:SEARCH_USERS_SUCCESS,payload:{newResult,existingResult}})
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