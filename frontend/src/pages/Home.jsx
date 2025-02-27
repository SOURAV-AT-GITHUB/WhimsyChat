import { useSelector, useDispatch } from "react-redux";
import DefaultAvatar from "/default-avatar.jpeg";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket, getSocket } from "../api/socket";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ErrorIcon from "@mui/icons-material/Error";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import {
  fetchContacts,
  searchUsers,
  resetSearch,
} from "../store/Contacts/contacts.action";
import SearchUserSkeleton from "../components/SearchUserSkeleton";
import CloseIcon from "@mui/icons-material/Close";
import SearchUserCard from "../components/SearchUserCard";


export default function Home() {
  /*____________Hooks and states_____________ */
  const { token, username, contactsId } = useSelector(
    (store) => store.authorization
  );
  const { contactsLoading, contacts, contactsError } = useSelector(
    (store) => store.contacts
  );
  const { isSearching, searchResult, isSearchError } = useSelector(
    (store) => store.search
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentOpenConversation, setCurrentOpenConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [openOptionMenu, setOptionMenu] = useState(false);
  const [openEmojis, setOpenEmojis] = useState(false);
  const conversationContainer = useRef(null);
  const [conversation, setConversations] = useState([
    {
      value: "Hi!",
      type: "text",
      sender: "Test user 2",
      receiver: username || "Text user 1",
      date_time: "2025-01-21T15:54:29.360Z",
      status: {
        isSent: true,
        isDelivered: true,
        isSeen: true,
        isError: false,
      },
    },
    {
      value: "Hello",
      type: "text",
      sender: username || "Text user 1",
      receiver: "Test user 2",
      date_time: "2025-01-21T15:55:29.360Z",
      status: {
        isSent: true,
        isDelivered: true,
        isSeen: true,
        isError: false,
      },
    },
    {
      value: "How are you?",
      type: "text",
      sender: "Test user 2",
      receiver: username || "Text user 1",
      date_time: "2025-01-21T15:56:29.360Z",
      status: {
        isSent: true,
        isDelivered: true,
        isSeen: true,
        isError: false,
      },
    },
    {
      value: "I'm Fine. \n What about you ?",
      type: "text",
      sender: username || "Text user 1",
      receiver: "Test user 2",
      date_time: "2025-01-21T15:57:29.360Z",
      status: {
        isSent: true,
        isDelivered: true,
        isSeen: false,
        isError: false,
      },
    },
    {
      value: "I'm also fine.",
      type: "text",
      sender: "Test user 2",
      receiver: username || "Text user 1",
      date_time: "2025-01-21T15:58:29.360Z",
      status: {
        isSent: true,
        isDelivered: true,
        isSeen: true,
        isError: false,
      },
    },
    {
      value: "Hi!",
      type: "text",
      sender: "Test user 2",
      receiver: username || "Text user 1",
      date_time: "2025-01-21T15:59:29.360Z",
      status: {
        isSent: true,
        isDelivered: true,
        isSeen: true,
        isError: false,
      },
    },
    {
      value: "Hello",
      type: "text",
      sender: username || "Text user 1",
      receiver: "Test user 2",
      date_time: "2025-01-21T16:00:29.360Z",
      status: {
        isSent: true,
        isDelivered: false,
        isSeen: false,
        isError: false,
      },
    },
    {
      value: "How are you?",
      type: "text",
      sender: "Test user 2",
      receiver: username || "Text user 1",
      date_time: "2025-01-21T16:01:29.360Z",
      status: {
        isSent: true,
        isDelivered: false,
        isSeen: false,
        isError: false,
      },
    },
    {
      value: "I'm Fine. \n What about you ?",
      type: "text",
      sender: username || "Text user 1",
      receiver: "Test user 2",
      date_time: "2025-01-21T16:02:29.360Z",
      status: {
        isSent: false,
        isDelivered: false,
        isSeen: false,
        isError: true,
      },
    },
    {
      value: "I'm also fine.",
      type: "text",
      sender: "Test user 2",
      receiver: username || "Text user 1",
      date_time: "2025-01-21T16:03:29.360Z",
      status: {
        isSent: false,
        isDelivered: false,
        isSeen: false,
        isError: false,
      },
    },
    {
      value: "Good ",
      type: "text",
      sender: username || "Text user 1",
      receiver: "Test user 2",
      date_time: "2025-01-21T16:04:29.360Z",
      status: {
        isSent: false,
        isDelivered: false,
        isSeen: false,
        isError: false,
      },
    },
  ]);
  /*_________Pure functions_____________*/
  function formatTime(dateString) {
    const date = new Date(dateString);
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const formattedTime = date.toLocaleString("en-US", options);
    return formattedTime;
  }
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
  /*_________dispatch functions */
  function handlesearchUsers(event) {
    event.preventDefault();
    dispatch(searchUsers(token, event.target[0].value));
    event.target[0].value = "";
  }

  /*__________useEffects_________ */
  useEffect(() => {
    if (!token) {
      return navigate("/signin");
    }
    dispatch(fetchContacts(token, contactsId));
    /*eslint-disable react-hooks/exhaustive-deps*/
  }, [token,contactsId]);
  const sendMessage = (event) => {
    event.preventDefault();
    const socket = getSocket();
    if (socket) {
      let newMessage = {
        value: message,
        type: "text",
        sender: username,
        receiver: currentOpenConversation.username,
        date_time: new Date().toISOString(),
        status: {
          isSent: false,
          isDelivered: false,
          isSeen: false,
          isError: false,
        },
      };
      // console.log(newMessage)
      socket.emit("message", newMessage, (response) => {
        if (response.status === "success") {
          console.log("message send");
          newMessage.status.isSent = true;
          setConversations((prev) => [...prev, response.message]);
        } else {
          console.log(response.error);
          setConversations((prev) => [...prev, newMessage]);
        }
      });
      setMessage("");
    }else{
      alert("You are not connected to server.")
    }

    // setTimeout(() => {
    //   const reply = {
    //     value: message,
    //     type: "text",
    //     sender: currentOpenConversation.username,
    //     receiver: username,
    //     date_time: new Date().toISOString(),
    //     status: {
    //       isSent: true,
    //       isDelivered: true,
    //       isSeen: true,
    //       isError: false,
    //     },
    //   };
    //   setConversations((prev) => [...prev, reply]);
    // }, 3500);
  };
  useEffect(() => {
    // Define a function to handle key press events
    const handleKeyPress = (event) => {
      if (event.key === "Escape") {
        setCurrentOpenConversation(null);
      }
    };

    // Add event listener when the component mounts
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);
  useEffect(() => {
    if (conversationContainer?.current) {
      conversationContainer.current.scrollTop =
        conversationContainer.current.scrollHeight;
    }
  }, [currentOpenConversation, conversation]);
  return (
    <main
      id="main-container"
      className="relative max-w-screen-xl m-auto   bg-opacity-20  rounded-t-xl overflow-hidden "
    >
      <h1 className="max-h-[10vh] font-medium font-serif tracking-wider py-2 pb-4  text-5xl text-center text-white bg-cyan-500 bg-opacity-35">
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
              className="w-10/12 pl-2 text-sm  focus:outline-none placeholder:text-slate-600"
            />
            <button type="submit">
              <SearchIcon />
            </button>
            {(isSearching || searchResult[0] || isSearchError) && (
              <div className="absolute  top-11 left-0 p-1 w-full  max-h-[300px] overflow-y-auto thin-scrollbar">
                {isSearching ? (
                  <div className="flex flex-col gap-1">
                    <SearchUserSkeleton />
                    <SearchUserSkeleton />
                  </div>
                ) : searchResult[0] ? (
                  <div className="flex flex-col gap-1">
                    {searchResult.map((user) => (
                      <SearchUserCard
                        key={user._id}
                        user={user}
                        stateUpdaterFunction={setCurrentOpenConversation}
                      />
                    ))}
                    
                  </div>
                ) : (
                  isSearchError && (
                    <p className="bg-white text-red-400 text-center p-2 text-lg rounded-md">
                      {isSearchError}
                    </p>
                  )
                )}
                <button
                      onClick={() => dispatch(resetSearch())}
                      type="button"
                      className="bg-primary text-white rounded-lg py-1 w-full mt-1 flex items-center justify-center gap-2"
                    >
                      <p>Close Search </p>
                      <CloseIcon />
                    </button>
              </div>
            )}
          </form>
          {contacts[0] ? (
            <div className="flex flex-col gap-2 px-1">
              {contacts.map(
                (conversation) =>
                  !conversation.isGroup && (
                    <div
                      // onClick={() => setCurrentOpenConversation({ ...user })}
                      className="flex gap-4 p-1 border-b cursor-pointer bg-white rounded-lg"
                      key={conversation.participants[0].username}
                    >
                      <div className="max-h-[60px]  w-[20%] rounded-full overflow-hidden ">
                        <img
                          src={
                            conversation.participants[0].image || DefaultAvatar
                          }
                          alt={conversation.participants[0].username}
                          className="h-full w-full"
                        />
                      </div>

                      <div className="w-[80%]">
                        <div className="flex justify-between items-center  w-full">
                          <p>
                            {conversation.participants[0].first_name}{" "}
                            {conversation.participants[0].last_name}
                          </p>
                          {/* <p className="text-xs">{formatTime(conversation[conversation.length - 1].date_time)}</p> */}
                        </div>

                        <div className="flex justify-between items-center"></div>
                      </div>
                    </div>
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
                    src={currentOpenConversation.image || DefaultAvatar}
                    alt={currentOpenConversation.username}
                    className="max-h-[50px] rounded-full"
                  />
                  <div>
                    <p>
                      {currentOpenConversation.first_name}{" "}
                      {currentOpenConversation.last_name}
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
                {conversation.map((message, index) => (
                  <div
                    className={`h-fit w-fit max-w-[90%] p-1 flex flex-col ${
                      username == message.sender
                        ? "self-end bg-teal-500 text-white"
                        : "border-2 bg-white"
                    }  rounded-lg shadow-xl`}
                    key={index}
                  >
                    <div className="min-w-[50px] text-lg mr-8 ml-2">
                      {message.value.split("\n").map((para, index) => (
                        <p key={index}>{para}</p>
                      ))}
                    </div>
                    <div className="flex gap-1 items-end self-end">
                      <p className="text-xs text-right">
                        {formatTime(message.date_time)}
                      </p>
                      {username === message.sender && (
                        <Fragment>
                          {message.status.isSeen ||
                          message.status.isDelivered ? (
                            <DoneAllIcon
                              sx={{ fontSize: "1rem" }}
                              className={`${
                                message.status.isSeen
                                  ? "text-orange-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ) : message.status.isSent ? (
                            <DoneIcon
                              sx={{ fontSize: "1rem" }}
                              className="text-slate-300"
                            />
                          ) : message.status.isError ? (
                            <ErrorIcon
                              sx={{ fontSize: "1rem" }}
                              className="text-red-500 bg-white rounded-full "
                            />
                          ) : (
                            <ScheduleIcon
                              sx={{ fontSize: "1rem" }}
                              className="text-slate-300"
                            />
                          )}
                        </Fragment>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={sendMessage}
                className="h-[10%] w-full relative  bg-white flex items-center justify-between px-4 gap-4"
              >
                <input
                  type="text"
                  placeholder="Enter message"
                  className="thin-scrollbar resize-none  bg-transparent max-h-full  w-full pl-2 text-black text-lg  placeholder:text-black  focus:outline-none"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
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
                    {openEmojis && (
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
                        message ? "scale-100" : "scale-0"
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
    </main>
  );
}
