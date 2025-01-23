import axios from "axios";
import { Fragment, useState } from "react";
import {  useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import WarningIcon from '@mui/icons-material/Warning';
import ErrorOutlineSharpIcon from '@mui/icons-material/ErrorOutlineSharp';
import QuestionMarkSharpIcon from '@mui/icons-material/QuestionMarkSharp';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export default function VerifyMail() {
  /*___________Hooks and states___________ */
  const { token } = useParams();
  const defaultState = {
    isLoading: false,
    isError: false,
    isExpired: false,
    isVerified: false,
  }
  const [state, setState] = useState(defaultState);
  /*_____________Pure functions_____________ */
  const verifyToken = async () => {
    setState({...defaultState,isLoading:true})
    try {
      const response = await axios.post(
        `${BACKEND_URL}/user/verify-email/${token}`
      );
      setState({...defaultState,...response.data.state})
      // navigate("/signin");
    } catch (error) {
      console.log(error)
      setState(defaultState)
    }
  };
  useState(()=>{
    verifyToken()
  },[token])
  return (
    <main className="text-4xl text-center  min-w-full min-h-[350px] lg:min-w-[30vw] lg:min-h-[30vh] p-6 absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4  bg-light rounded-lg overflow-hidden">
      {state.isLoading ? (
        <Fragment>
          <CircularProgress size="6rem" />
          <p className="mt-4 text-primary">Verifying...</p>
        </Fragment>
      ) : state.isVerified ? (
        <Fragment>
          <div id="tick-animation" className="w-40 m-auto">
            <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
              <g
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                fillRule="evenodd"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  className="circle"
                  d="M13 1C6.372583 1 1 6.372583 1 13s5.372583 12 12 12 12-5.372583 12-12S19.627417 1 13 1z"
                />
                <path className="tick" d="M6.5 13.5L10 17 l8.808621-8.308621" />
              </g>
            </svg>
          </div>
          <p className="text-green-500">Email verified</p>
          <a
            href="/signin"
            >
            <p
            className="mt-2 text-xl bg-primary text-white p-2 rounded-lg"
            
            >Go to sing in</p>
          </a>
        </Fragment>
      ) : state.isError ? (
        <Fragment>
          <ErrorOutlineSharpIcon sx={{fontSize:"8rem"}} color="error"/>
          <p className="text-red-500">Invalid link</p>
          <a
            href="/signin"
            >
            <p
            className="mt-4 text-xl bg-red-500 text-white p-2   rounded-lg"
            
            >Go to sing in</p>
          </a>
          </Fragment>
      ) : state.isExpired ? (
        <Fragment>
          <WarningIcon sx={{fontSize:"8rem"}} color="warning"/>
          <p className="text-yellow-600">Link expired</p>
          <button onClick={()=>alert("Feature will be live soon")} className="mt-4 text-xl bg-primary text-white rounded-lg p-2 px-4">Request new link</button>
          </Fragment>
      ) : (
        <Fragment> 
          <QuestionMarkSharpIcon sx={{fontSize:"8rem"}} color="info"/>
          <p className="text-primary">Something went wrong</p>
          <a
            href="/signin"
            >
            <p
            className="mt-4 text-xl bg-primary text-white p-2   rounded-lg"
            
            >Go back to sing in</p>
          </a>
          </Fragment>
      )}
    </main>
  );
}
