import {
  ADD_EMPTY_MESSAGES_ARRAY,
  GET_MESSAGES_REQUEST,
  GET_MESSAGES_SUCCESS,
  GET_MESSAGES_ERROR,
  ADD_ONE_MESSAGE,
  UPDATE_ONE_MESSAGE,
} from "../actionTypes";
const defaultMessagesState = {
  messagesLoading: false,
  allMessages: {},
  messagesError: null,
};

export function allMessagesReducer(
  state = defaultMessagesState,
  { type, payload }
) {
  switch (type) {
    case ADD_EMPTY_MESSAGES_ARRAY:
      return (state = {
        ...state,
        allMessages: { ...state.allMessages, [payload]: [] },
      });
    case GET_MESSAGES_REQUEST:
      return (state = {
        messagesLoading: true,
        allMessages: {},
        messagesError: null,
      });
    case GET_MESSAGES_SUCCESS:
      return (state = {
        messagesLoading: false,
        allMessages: {
          ...state.allMessages,
          [payload.conversationId]: payload.data,
        },
        messagesError: null,
      });
    case GET_MESSAGES_ERROR:
      return (state = {
        messagesLoading: false,
        allMessages: {},
        messagesError: payload,
      });
    case ADD_ONE_MESSAGE: {
      const messages = state.allMessages[payload.conversationId]||[];
      messages.push(payload);
      return (state = {
        ...state,
        allMessages: {
          ...state.allMessages,
          [payload.conversationId]: messages,
        },
      });
    }
    case UPDATE_ONE_MESSAGE:{
      let chats = state.allMessages[payload.message.conversationId]
      const result = chats.map(message=> message._id === payload.oldId ? payload.message : message)
      state = {...state,allMessages:{...state.allMessages,[payload.message.conversationId]:result}}
      return state
    }
    default:
      return state;
  }
}
