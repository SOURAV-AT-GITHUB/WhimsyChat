import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ErrorIcon from "@mui/icons-material/Error";
import { Fragment } from "react";

/*eslint-disable react/prop-types*/
export default function MessageCard({ message, mongoId }) {
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
  return (
    <div
      className={`h-fit w-fit max-w-[90%] sm:max-w-[70%] p-1 pt-2 flex flex-col ${
        mongoId == message.sender
          ? "self-end bg-teal-500 text-white"
          : "border-2 bg-white"
      }  rounded-lg shadow-xl`}
    >
      <div className="min-w-[50px] text-lg mr-8 ml-2">
        {message.value.split("\n").map((para, index) => (
          <p key={index}>{para}</p>
        ))}
      </div>
      <div className="flex gap-1 items-end self-end">
        <p className="text-xs text-right">{formatTime(message.createdAt)}</p>
        {mongoId === message.sender && (
          <Fragment>
            {message.status.isSeen || message.status.isDelivered ? (
              <DoneAllIcon
                sx={{ fontSize: "1rem" }}
                className={`${
                  message.status.isSeen ? "text-orange-400" : "text-slate-300"
                }`}
              />
            ) : message.status.isSent ? (
              <DoneIcon sx={{ fontSize: "1rem" }} className="text-slate-300" />
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
  );
}
