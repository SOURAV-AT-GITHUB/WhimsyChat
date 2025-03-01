import { useSelector, useDispatch } from "react-redux";
import DefaultAvatar from "/default-avatar.jpeg";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import {
  forwardRef,
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import {
  fetchContacts,
  searchUsers,
  resetSearch,
} from "../store/Contacts/contacts.actions";
import SearchUserSkeleton from "../components/SearchUserSkeleton";
import CloseIcon from "@mui/icons-material/Close";
import UserContactCard from "../components/UserContactCard";
import axios from "axios";
import {
  OPEN_SNACKBAR,
  ADD_ONE_MESSAGE,
  UPDATE_ONE_MESSAGE,
  ADD_NEW_CONTACT,
} from "../store/actionTypes";
import MessageCard from "../components/MessageCard";
import { CircularProgress, DialogActions, DialogTitle } from "@mui/material";
import { getAllMessages } from "../store/Messages/messages.action";
import Dialog from "@mui/material/Dialog";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import Slide from "@mui/material/Slide";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { SocketContext } from "../context/socketContext";
import {
  SOCKET_DISCONNECTED,
  SOCKET_CONNECTING,
  SOCKET_CONNECTED,
  SOCKET_ERROR,
} from "../constants/socketStatus";
import RefreshIcon from '@mui/icons-material/Refresh';
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function Home() {
  /*____________Hooks and states_____________ */
  const { token, contactsId, mongoId } = useSelector(
    (store) => store.authorization
  );
  const { contactsLoading, contacts, contactsError } = useSelector(
    (store) => store.contacts
  );
  const { isSearching, searchResult, isSearchError } = useSelector(
    (store) => store.search
  );
  const { messagesLoading, allMessages, messagesError } = useSelector(
    (store) => store.allMessages
  );
  const { socket, socketStatus } = useContext(SocketContext);
  console.log(socketStatus);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentOpenConversation, setCurrentOpenConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [openOptionMenu, setOptionMenu] = useState(false);
  const [openEmojis, setOpenEmojis] = useState(false);
  const conversationContainer = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const messageQueue = useRef([]);
  const messageInputRef = useRef(null);
  const [createContactConfirmationDialog, setcreateContactConfirmationModal] =
    useState(false);
  const createContactQueue = useRef([]);
  const [isContactCreating, setIsContactCreating] = useState(false);

  /*_________Pure functions_____________*/

  function toggleOptionMenu() {
    setOptionMenu((prev) => !prev);
  }
  function toggleEmojiMenu() {
    setOpenEmojis((prev) => !prev);
  }
  function closeOptionMenu() {
    setOptionMenu(false);
  }
  function closeEmojiMenu() {
    setOpenEmojis(false);
  }
  function addEmoji(emoji) {
    setMessage((prev) => (prev += emoji));
  }
  function closeConversationonEsc(event) {
    if (isSending) return;
    if (event.key === "Escape") {
      setCurrentOpenConversation(null);
    }
  }
  function opencreateContactConfirmationDialog(event) {
    event.preventDefault();
    setcreateContactConfirmationModal(true);
  }
  function closecreateContactConfirmationDialog() {
    setcreateContactConfirmationModal(false);
  }

  /*_________dispatch functions */
  function handlesearchUsers(event) {
    event.preventDefault();
    dispatch(searchUsers(token, event.target[0].value, contacts));
    event.target[0].value = "";
  }
  function openSnackbar(message, severity) {
    dispatch({ type: OPEN_SNACKBAR, payload: { message, severity } });
  }
  /*_______async functions */

  function sendMessage(event) {
    event.preventDefault();
    const newMessage = {
      value: message,
      type: "text",
      sender: mongoId,
      receiver: currentOpenConversation.participants[0]._id, //needed only for first messsage
      status: {
        isSent: null,
        isDelivered: null,
        isSeen: null,
        isError: null,
      },
      createdAt: Date(),
      conversationId: currentOpenConversation._id || null,
    };
    if (!currentOpenConversation._id) {
      createContactQueue.current.push(newMessage);
      setIsContactCreating(true);
      setMessage("");
      if (messageInputRef.current) messageInputRef.current.focus();
      if (!isSending) createContactAndSendMessage();
      return;
    }
    newMessage._id = Date.now();
    messageQueue.current.push(newMessage);
    dispatch({
      type: ADD_ONE_MESSAGE,
      payload: newMessage,
    });
    setMessage("");
    if (messageInputRef.current) messageInputRef.current.focus();
    if (!isSending) sendNextMessage();
  }
  async function sendNextMessage() {
    if (messageQueue.current.length === 0) return;

    setIsSending(true);
    const currentMessage = messageQueue.current[0];
    const messageAfter_idRemove = { ...currentMessage };
    delete messageAfter_idRemove._id;
    try {
      const response = await axios.post(
        `${BACKEND_URL}/messages`,
        messageAfter_idRemove,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch({
        type: UPDATE_ONE_MESSAGE,
        payload: { message: response.data.data, oldId: currentMessage._id },
      });
      messageQueue.current.shift();
    } catch (error) {
      console.log(error);
      dispatch(
        openSnackbar(error.response?.data.message || error.message, "error")
      );
      dispatch({ type: ADD_ONE_MESSAGE, payload: currentMessage });
      messageQueue.current.shift();
    } finally {
      setIsSending(false);

      if (createContactQueue.current.length > 0) createContactAndSendMessage();
      else sendNextMessage();
    }
  }
  async function createContactAndSendMessage() {
    try {
      setIsContactCreating(true);
      const newMessage = createContactQueue.current[0];
      const messageAfter_idRemove = { ...newMessage };
      delete messageAfter_idRemove._id;
      const response = await axios.post(
        `${BACKEND_URL}/messages`,
        messageAfter_idRemove,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch({
        type: ADD_NEW_CONTACT,
        payload: response.data.data.newConversation,
      });
      dispatch({
        type: ADD_ONE_MESSAGE,
        payload: response.data.data.newMessage,
      });
      dispatch(resetSearch());
      setcreateContactConfirmationModal(false);
      console.log(response.data.data.newConversation);
      setCurrentOpenConversation(response.data.data.newConversation);
      openSnackbar(response.data.message || "Success", "success");
    } catch (error) {
      console.log(error);
      openSnackbar(error.response?.data.message || error.message, "error");
    } finally {
      createContactQueue.current.shift();
      setIsContactCreating(false);
      sendNextMessage();
    }
  }
  /*__________useEffects_________ */
  useEffect(() => {
    //fetch contacts or navigate to signin
    if (!token) {
      return navigate("/signin");
    }
    dispatch(fetchContacts(token, contactsId));
    /*eslint-disable react-hooks/exhaustive-deps*/
  }, [token, contactsId]);
  useEffect(
    //fetch messages
    function getMessage() {
      if (!contacts[0]) return;
      console.log("messages fetched");
      contacts.forEach((contact) =>
        dispatch(getAllMessages(token, contact._id))
      );
    },
    [contactsLoading]
  );
  useEffect(() => {
    //close conversation on Esc
    window.addEventListener("keydown", closeConversationonEsc);
    return () => {
      window.removeEventListener("keydown", closeConversationonEsc);
    };
  }, []);
  useEffect(
    //scroll to bottom chats
    function scrollToBottomChat() {
      if (conversationContainer?.current) {
        conversationContainer.current.scrollTop =
          conversationContainer.current.scrollHeight;
      }
      if (messageInputRef.current) messageInputRef.current.focus();
    },
    [currentOpenConversation, allMessages]
  );
  return (
    <main
      id="main-container"
      className="relative max-w-screen-xl m-auto   bg-opacity-20  rounded-t-xl overflow-hidden "
    >
      <h1 className="max-h-[10vh] font-medium font-serif tracking-wider py-2 pb-4 select-none text-5xl text-center text-white bg-cyan-500 bg-opacity-35">
        Whimsy Chat
      </h1>

      <div className="flex  h-[80vh] ">
        <section
          id="home-left"
          className="w-1/4 relative  overflow-y-auto thin-scrollbar transparent-blur-background  flex flex-col gap-2 border-2"
        >
          <form
            onSubmit={handlesearchUsers}
            className="relative flex items-center justify-between   border border-t-0 bg-white p-2"
          >
            <input
              type="text"
              placeholder="Search using username or email"
              required
              minLength={2}
              className="w-10/12 pl-2 text-[10px] sm:text-xs  focus:outline-none placeholder:text-slate-600"
            />
            <button type="submit">
              <SearchIcon />
            </button>
          </form>
          {isSearching ||
          searchResult.existingResult[0] ||
          searchResult.newResult[0] ||
          isSearchError ? (
            <div className="w-full overflow-y-auto thin-scrollbar">
              <button
                onClick={() => dispatch(resetSearch())}
                type="button"
                className="mb-2 bg-primary text-white rounded-lg py-1 w-full flex items-center justify-center gap-2"
              >
                <p>Close Search </p>
                <CloseIcon />
              </button>
              {isSearching ? (
                <div className="flex flex-col gap-1">
                  <SearchUserSkeleton />
                  <SearchUserSkeleton />
                </div>
              ) : searchResult.existingResult[0] ||
                searchResult.newResult[0] ? (
                <div className="flex flex-col gap-1 px-1">
                  {searchResult.existingResult[0] && (
                    <div className="flex flex-col gap-1">
                      <p className="bg-white p-1 rounded-md text-center text-primary text-sm">
                        Esixting contacts
                      </p>
                      {searchResult.existingResult.map((conversation) => (
                        <UserContactCard
                          key={conversation._id}
                          conversation={conversation}
                          lastMessage={
                            allMessages[conversation._id]?.[
                              allMessages[conversation._id].length - 1
                            ]
                          }
                          mongoId={mongoId}
                          stateUpdaterFunction={setCurrentOpenConversation}
                        />
                      ))}
                    </div>
                  )}
                  {searchResult.newResult[0] && (
                    <div className="flex flex-col gap-1">
                      <p className="bg-white p-1 rounded-md text-center text-primary text-sm">
                        Not in contacts
                      </p>
                      {searchResult.newResult.map((conversation) => (
                        <UserContactCard
                          key={conversation.participants[0]._id}
                          conversation={conversation}
                          stateUpdaterFunction={setCurrentOpenConversation}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                isSearchError && (
                  <p className="bg-white text-red-400 text-center p-2 text-lg rounded-md">
                    {isSearchError}
                  </p>
                )
              )}
            </div>
          ) : contacts[0] ? (
            <div className="flex flex-col gap-2 px-1">
              {contacts.map(
                (conversation) =>
                  !conversation.isGroup && (
                    <UserContactCard
                      key={conversation._id}
                      conversation={conversation}
                      lastMessage={
                        allMessages[conversation._id]?.[
                          allMessages[conversation._id].length - 1
                        ]
                      }
                      mongoId={mongoId}
                      stateUpdaterFunction={setCurrentOpenConversation}
                    />
                  )
              )}
            </div>
          ) : (
            <div className="text-center p-2">
              <p className="text-2xl">
                👆🏻 Search and message users to add them{" "}
              </p>
            </div>
          )}
        </section>

        <section id="home-right" className="w-3/4 transparent-blur-background ">
          {currentOpenConversation ? (
            <Fragment>
              <div className="flex justify-between items-center h-[10%]  border-2 p-2 bg-white">
                <div className="flex gap-2 items-center">
                  <img
                    src={
                      currentOpenConversation.participants[0].image ||
                      DefaultAvatar
                    }
                    alt={currentOpenConversation.participants[0].username}
                    className="max-h-[50px] rounded-full"
                  />
                  <div>
                    <p>
                      {currentOpenConversation.participants[0].first_name}{" "}
                      {currentOpenConversation.participants[0].last_name}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    className="cursor-pointer hover:bg-slate-200 rounded-full p-1"
                    onClick={toggleOptionMenu}
                  >
                    <MoreVertIcon />
                  </button>
                  {
                    <div
                      className={`${
                        openOptionMenu ? "block border-2" : "hidden"
                      }  absolute bg-white right-0 top-12   flex flex-col`}
                    >
                      <p
                        onClick={closeOptionMenu}
                        className={` p-2 text-nowrap hover:bg-slate-100 cursor-pointer`}
                      >
                        View Contact
                      </p>
                      <p
                        onClick={closeOptionMenu}
                        className={` p-2 text-nowrap hover:bg-slate-100 cursor-pointer`}
                      >
                        Search
                      </p>
                      <p
                        onClick={closeOptionMenu}
                        className={` p-2 text-nowrap hover:bg-slate-100 cursor-pointer`}
                      >
                        {}Mute Notifications
                      </p>
                      <p
                        onClick={closeOptionMenu}
                        className={` p-2 text-nowrap hover:bg-slate-100 cursor-pointer`}
                      >
                        Block
                      </p>
                    </div>
                  }
                </div>
              </div>

              <div
                onClick={() => {
                  closeOptionMenu();
                  closeEmojiMenu();
                }}
                className="h-[80%]  overflow-y-auto thin-scrollbar flex flex-col gap-4  p-2"
                ref={conversationContainer}
              >
                {allMessages[currentOpenConversation._id] &&
                allMessages[currentOpenConversation._id][0] ? (
                  allMessages[currentOpenConversation._id].map(
                    (message, index) => (
                      <MessageCard
                        message={message}
                        mongoId={mongoId}
                        key={index}
                      />
                    )
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center ">
                    <p className="text-4xl text-white shadow-md p-2 rounded-md select-none">
                      {allMessages[currentOpenConversation._id]
                        ? "No Messages"
                        : "Message user to add them"}
                    </p>
                  </div>
                )}
              </div>

              <form
                onSubmit={
                  currentOpenConversation && currentOpenConversation._id
                    ? sendMessage
                    : opencreateContactConfirmationDialog
                }
                className="h-[10%] w-full relative  bg-white flex items-center justify-between px-4 gap-4"
              >
                <input
                  type="text"
                  placeholder="Enter message"
                  className="thin-scrollbar resize-none  bg-transparent max-h-full  w-full pl-2 text-black text-lg  placeholder:text-black  focus:outline-none"
                  required
                  maxLength={1000}
                  value={message}
                  ref={messageInputRef}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {message.length > 500 && (
                  <p
                    className={`text-sm ${
                      message.length > 500 && "text-red-500"
                    }`}
                  >
                    {message.length}/1000
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="relative "
                    onClick={toggleEmojiMenu}
                  >
                    <EmojiEmotionsIcon
                      fontSize="large"
                      className="text-white bg-teal-500 rounded-full"
                    />
                    {openEmojis && currentOpenConversation && (
                      <div className="absolute bottom-0 right-16  ">
                        <EmojiPicker
                          // open={openEmojis}
                          onEmojiClick={(e) => addEmoji(e.emoji)}
                          allowExpandReactions={true}
                          height={"400px"}
                          width={"300px"}
                          className="absolute"
                          emojiStyle="twitter"
                        />
                      </div>
                    )}
                  </button>

                  {
                    <button
                      type="submit"
                      className={`${
                        message.trim() ? "scale-100" : "scale-0"
                      } transition-transform duration-200 ease-in-out bg-teal-500 p-2 pl-3 shadow-2xl  rounded-full flex items-center justify-center`}
                    >
                      <SendIcon className="text-white" />
                    </button>
                  }
                </div>
              </form>
            </Fragment>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-6xl text-teal-400">Whimsy Chat</h2>
                <p className="text-teal-500 text-2xl mt-2 ">
                  Contact - whimsychatofficial@gmail.com
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
      {/*New conversation confirmation dialog */}
      <Dialog
        open={Boolean(
          currentOpenConversation &&
            !currentOpenConversation._id &&
            createContactConfirmationDialog
        )}
        // fullScreen
        TransitionComponent={Transition}
        sx={{
          "& .css-10d30g3-MuiPaper-root-MuiDialog-paper": {
            backgroundColor: "transparent",
            // boxShadow: 'none',
          },
          "& .css-l09ud3-MuiPaper-root-MuiDialog-paper": {
            backgroundColor: "transparent",
            // boxShadow: 'none',
          },
          // '& .MuiBackdrop-root': {
          //   backgroundColor: 'transparent',
          // }
        }}
      >
        <DialogTitle className="bg-primary text-white">
          Add {currentOpenConversation?.participants[0].first_name}{" "}
          {currentOpenConversation?.participants[0].last_name} in your contacts
          ?
        </DialogTitle>
        <div className="min-h-[100px] p-2 flex items-start justify-center transparent-blur-background">
          <p className="text-white text-lg">
            By sending first message to{" "}
            {currentOpenConversation?.participants[0].first_name}{" "}
            {currentOpenConversation?.participants[0].last_name}, you will add
            Him/Her into your contacts.
          </p>
        </div>
        <DialogActions>
          {isContactCreating ? (
            <button className="flex items-center justify-center gap-2 text-xl p-2 rounded-md bg-primary text-white min-w-[150px]">
              <p>Adding...</p> <CircularProgress sx={{ color: "white" }} />
            </button>
          ) : (
            <Fragment>
              <button
                className="w-[100px] h-[40px] text-lg bg-red-500 text-white rounded-md disabled:opacity-50"
                onClick={closecreateContactConfirmationDialog}
              >
                Cancle
              </button>
              <button
                onClick={sendMessage}
                className="w-[100px] h-[40px] text-lg bg-primary text-white rounded-md disabled:opacity-50"
              >
                <p>Confirm</p>
              </button>
            </Fragment>
          )}
        </DialogActions>
      </Dialog>
      {/*Initial loading or error dialog */}
      <Dialog
        open={Boolean(
          contactsLoading ||
            contactsError ||
            messagesLoading ||
            messagesError ||
            socketStatus !== SOCKET_CONNECTED
        )}
        fullScreen
        sx={{
          "& .css-10d30g3-MuiPaper-root-MuiDialog-paper": {
            backgroundColor: "transparent",
          },
          "& .css-l09ud3-MuiPaper-root-MuiDialog-paper": {
            backgroundColor: "transparent",
          },
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 transparent-blur-background ">
          <h1 className="text-7xl font-semibold text-teal-500">Whimsy Chat</h1>
          {contactsError || messagesError || socketStatus === SOCKET_ERROR ? (
            <div className="flex items-center justify-center gap-4 text-white">
              {contactsError === "Network Error" ||
              messagesError === "Network Error" ||
              socketStatus !== SOCKET_ERROR ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">

                  <p className="text-4xl">You are offline</p>
                  <WifiOffIcon sx={{ height: "75px", width: "75px" }} />
                  </div>
                  <button className="flex items-center gap-2 text-4xl bg-primary p-1 px-2 rounded-lg" onClick={()=>location.reload()}><p>Refresh</p>  <RefreshIcon sx={{ height: "50px", width: "50px" }} /></button>
                </div>
              ) : (
                <Fragment>
                  <p className="text-4xl">
                    {contactsError || messagesError || (SOCKET_ERROR && "Unable to connect to server.")}
                  </p>
                  <ErrorOutlineIcon sx={{ height: "75px", width: "75px" }} />
                </Fragment>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 text-white">
              <p className="text-5xl">Loading...</p>
              <CircularProgress size="4rem" sx={{ color: "white" }} />
            </div>
          )}
        </div>
      </Dialog>
    </main>
  );
}
