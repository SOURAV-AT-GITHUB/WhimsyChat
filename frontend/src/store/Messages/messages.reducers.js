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
      const messages = state.allMessages[payload.conversationId] || [];
      messages.push(payload);
      return (state = {
        ...state,
        allMessages: {
          ...state.allMessages,
          [payload.conversationId]: messages,
        },
      });
    }
    case UPDATE_ONE_MESSAGE: {
      let chats = state.allMessages[payload.conversationId];
      if (payload._id && !payload.tempId) {
        const Id = chats.findIndex((message) => message._id === payload._id);
        if (Id !== -1) chats[Id] = payload;
      } else if (payload.tempId) {
        const tempId = chats.findIndex(
          (message) => payload.tempId === message.tempId
        );
        if (tempId !== -1) chats[tempId] = payload;
      }
      state = {
        ...state,
        allMessages: { ...state.allMessages, [payload.conversationId]: chats },
      };
      return state;
    }
    default:
      return state;
  }
}
