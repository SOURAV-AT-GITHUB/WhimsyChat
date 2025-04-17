import DefaultAvatar from "/default-avatar.jpeg";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ErrorIcon from "@mui/icons-material/Error";
import { Fragment } from "react";
/* eslint-disable react/prop-types*/
export default function UserContactCard({
  conversation,
  lastMessage = null,
  mongoId = null,
  stateUpdaterFunction,
  unreads = 0,
}) {
  function formatTime(updatedAt) {
    const now = new Date();
    const updateTime = new Date(updatedAt);
    const timeDifference = now - updateTime; // Difference in milliseconds

    // Convert time difference to hours
    const hoursDifference = timeDifference / (1000 * 3600);

    // If within past 24 hours, show the time in "hh:mm AM/PM" format
    if (hoursDifference < 24) {
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      return updateTime.toLocaleTimeString("en-US", options);
    }

    // If within past 48 hours, show "Yesterday"
    if (hoursDifference < 24) {
      return "Yesterday";
    }

    // Otherwise, return the date in "MM/DD/YYYY" format
    const month = String(updateTime.getMonth() + 1).padStart(2, "0");
    const day = String(updateTime.getDate()).padStart(2, "0");
    const year = updateTime.getFullYear();

    return `${day}/${month}/${year}`;
  }
  return (
    <div
      onClick={() => stateUpdaterFunction(conversation)}
      className="flex gap-4 p-1 border-b cursor-pointer bg-white rounded-lg"
    >
      <div className="max-h-[60px]  w-[20%] rounded-full overflow-hidden ">
        <img
          src={conversation.participants[0].image || DefaultAvatar}
          alt={"conversation.participants[0].username"}
          className="h-full w-full"
        />
      </div>

      <div className="w-[80%] flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <p>
            {conversation.participants[0].first_name}{" "}
            {conversation.participants[0].last_name}
          </p>
          {conversation.updatedAt && (
            <p className="text-xs text-slate-500">
              {" "}
              {formatTime(lastMessage?.updatedAt || conversation.updatedAt)}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center">
          {!conversation._id && conversation.participants[0].email ? (
            <p className="text-xs">
              Email : {conversation.participants[0].email}
            </p>
          ) : (
            <div className="flex items-center justify-between gap-1 w-full">
              {lastMessage?.type === "text" && (
                <div className="flex items-center gap-1">
                  {mongoId && mongoId === lastMessage.sender && (
                    <Fragment>
                      {lastMessage.status.isSeen ||
                      lastMessage.status.isDelivered ? (
                        <DoneAllIcon
                          sx={{ fontSize: "1.25rem" }}
                          className={`${
                            lastMessage.status.isSeen
                              ? "text-orange-400"
                              : "text-slate-300"
                          }`}
                        />
                      ) : lastMessage.status.isSent ? (
                        <DoneIcon
                          sx={{ fontSize: "1.25rem" }}
                          className="text-slate-300"
                        />
                      ) : lastMessage.status.isError ? (
                        <ErrorIcon
                          sx={{ fontSize: "1.25rem" }}
                          className="text-red-500 bg-white rounded-full "
                        />
                      ) : (
                        <ScheduleIcon
                          sx={{ fontSize: "1.25rem" }}
                          className="text-slate-300"
                        />
                      )}
                    </Fragment>
                  )}
                  <p className="line-clamp-1 text-sm">{lastMessage.value}</p>
                </div>
              )}
              {unreads>0 && <p className="bg-teal-500 px-1.5 text-sm text-white rounded-full">{unreads}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
