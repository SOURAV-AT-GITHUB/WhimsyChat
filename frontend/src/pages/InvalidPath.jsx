import { useEffect, useState } from "react";
import brokenLink from "/broken-link.webp";
import { useNavigate } from "react-router-dom";
export default function InvalidPath() {
  const [timer, setTimer] = useState(6);
  const navigate = useNavigate();
  if (timer <= 0) navigate("/");
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [timer]);
  return (
    <main>
      <div className="min-w-full min-h-full lg:min-w-[30vw] lg:min-h-[30vh] absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 rounded-lg overflow-hidden p-8 flex flex-col items-center bg-teal-100">
        <h1 className="text-2xl md:text-5xl text-center">
          Looks like you have followed a broken or expired link
        </h1>
        <img src={brokenLink} alt="broken-link" className="m-auto " />

        <p className="text-xl">Redirecting to homepage in {timer} seconds</p>
      </div>
    </main>
  );
}
