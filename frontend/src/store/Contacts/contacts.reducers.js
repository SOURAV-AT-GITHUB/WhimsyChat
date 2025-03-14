import {
  FETCH_CONTACTS_REQUEST,
  FETCH_CONTACTS_SUCCESS,
  FETCH_CONTACTS_ERROR,
  SEARCH_USERS_REQUEST,
  SEARCH_USERS_SUCCESS,
  SEARCH_USERS_ERROR,
  RESET_SEARCH,
  ADD_NEW_CONTACT,
} from "../actionTypes";
const defaultContactsState = {
  contactsLoading: false,
  contacts: [],
  contactsError: null,
};
const defaultSearchusersState = {
  isSearching: false,
  searchResult: {newResult:[],existingResult:[]},
  isSearchError: null,
};
export function contactsReducer(
  state = defaultContactsState,
  { type, payload }
) {
  switch (type) {
    case FETCH_CONTACTS_REQUEST:
      return (state = {
        contactsLoading: true,
        contacts: [],
        contactsError: null,
      });
    case FETCH_CONTACTS_SUCCESS:
      return (state = {
        contactsLoading: false,
        contacts: payload,
        contactsError: null,
      });
    case FETCH_CONTACTS_ERROR:
      return (state = {
        contactsLoading: false,
        contacts: [],
        contactsError: payload,
      });
      case ADD_NEW_CONTACT:{
        const contacts = [...state.contacts]
        contacts.unshift(payload)
        return state ={...state,contacts}
      }
    default:
      return state;
  }
}

export function searchUsersReducer(
  state = defaultSearchusersState,
  { type, payload }
) {
  switch (type) {
    case RESET_SEARCH:
      return defaultSearchusersState;
    case SEARCH_USERS_REQUEST:
      return (state = {
        isSearching: true,
        searchResult: {newResult:[],existingResult:[]},
        isSearchError: null,
      });
    case SEARCH_USERS_SUCCESS:
      return (state = {
        isSearching: false,
        searchResult: payload,
        isSearchError: null,
      });
    case SEARCH_USERS_ERROR:
      return (state = {
        isSearching: false,
        searchResult: {newResult:[],existingResult:[]},
        isSearchError: payload,
      });
    default:
      return state;
  }
}
