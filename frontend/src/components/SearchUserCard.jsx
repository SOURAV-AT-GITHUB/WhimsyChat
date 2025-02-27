import DefaultAvatar from "/default-avatar.jpeg";
/* eslint-disable react/prop-types*/
export default function SearchUserCard({ user, stateUpdaterFunction }) {
  return (
    <div

      onClick={() => stateUpdaterFunction(user)}
      className="flex gap-4 p-1 border-b cursor-pointer bg-white rounded-lg"
    >
      <div className="max-h-[60px]  w-[20%] rounded-full overflow-hidden ">
        <img
          src={user.image || DefaultAvatar}
          alt={"conversation.participants[0].username"}
          className="h-full w-full"
        />
      </div>

      <div className="w-[80%]">
        <div className="flex flex-col justify-between gap-1  w-full">
          <p>
            {user.first_name} {user.last_name}
          </p>
          {user.email && <p className="text-xs">Email : {user.email}</p>}
        </div>

        <div className="flex justify-between items-center"></div>
      </div>
    </div>
  );
}
