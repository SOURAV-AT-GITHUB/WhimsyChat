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
      <div className="min-h-[80px] min-w-[80px] max-h-[80px] max-w-[80px] lg:min-h-[65px] lg:min-w-[65px] lg:max-h-[65px] lg:max-w-[65px] rounded-full overflow-hidden ">
        <img
          src={conversation.participants[0].image || DefaultAvatar}
          alt={"conversation.participants[0].username"}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="w-full flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <p className="line-clamp-1 text-lg lg:text-base">
            {conversation.participants[0].first_name}{" "}
            {conversation.participants[0].last_name}
          </p>
          {conversation.updatedAt && (
            <p className="text-sm lg:text-[10px] text-slate-500">
              {" "}
              {formatTime(lastMessage?.createdAt || conversation.updatedAt)}
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
                          className={`${
                            lastMessage.status.isSeen
                              ? "text-orange-400"
                              : "text-slate-300"
                          } !text-3xl lg:!text-xl`}
                        />
                      ) : lastMessage.status.isSent ? (
                        <DoneIcon
                          className="text-slate-300 !text-3xl lg:!text-xl"
                        />
                      ) : lastMessage.status.isError ? (
                        <ErrorIcon
                          className="text-red-500 bg-white rounded-full !text-3xl lg:!text-xl"
                        />
                      ) : (
                        <ScheduleIcon
                          className="text-slate-300 !text-3xl lg:!text-xl"
                        />
                      )}
                    </Fragment>
                  )}
                  <p className="line-clamp-1 text-lg lg:text-sm">{lastMessage.value}</p>
                </div>
              )}
              {unreads>0 && <p className="bg-secondary px-1.5 text-sm text-white rounded-full">{unreads}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
