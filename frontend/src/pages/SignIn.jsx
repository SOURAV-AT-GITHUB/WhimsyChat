import { CircularProgress } from "@mui/material";
import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {SIGNIN} from '../store/actionTypes'
import { useNavigate } from "react-router-dom";
import { OPEN_SNACKBAR } from "../store/actionTypes";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
export default function SignIn() {
  /*___________Hooks and states______________ */
  const authorization = useSelector((store) => store.authorization);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const defaultFormData = {
    email: "",
    username: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    findByEmail: true,
    isRegistered: false,
    isChecked: false,
    verified: false,
  };
  const defaultValiditions = {
    //if typeof any value is string then it's a error elseif typeof is object(null) means no error
    email: null,
    password: null,
    confirm_password: null,
    username: null,
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [validation, setValidation] = useState(defaultValiditions);

  /*___________Pure functions________________ */
  const openSnackbar = (message, severity) => {
    dispatch({ type: OPEN_SNACKBAR, payload: { message, severity } });
  };
  function validateUsername(str) {
    const regex = /^[a-zA-Z_.][a-zA-Z0-9_.]*$/;
    return regex.test(str);
  }
  
  function validateEmail(email) {
    // Regular expression to validate an email address
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Test the email against the regex and return the result
    return regex.test(email);
  }
  function validatePassword(password) {
    // Check for the minimum length of 8 characters
    const minLength = password.length >= 8;
    // Regex to check for at least one uppercase letter, one lowercase letter, one number, and one special character
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

    // Return true if the password satisfies all conditions, otherwise return false
    return minLength && regex.test(password);
  }
  function matchPasswords(confirm_password) {
    if (confirm_password === formData.password) return true;
    else return false;
  }
  const checkAllValidation = (field, value) => {
    if (field === "email") {
      if (!value) {

        setValidation((prev) => ({ ...prev, email: "Email is required" }));
      } else if (validateEmail(value)) {

        setValidation((prev) => ({ ...prev, email: null }));
      } else {
        setValidation((prev) => ({
          ...prev,
          email: "Please enter a valid email",
        }));
        return;
      }
    } else if (field === "username") {
      if (!value) {
        setValidation((prev) => ({
          ...prev,
          username: "username is required",
        }));
      } else if (validateUsername(formData.username)) {
        setValidation((prev) => ({ ...prev, username: null }));
        return;
      } else {
        setValidation((prev) => ({
          ...prev,
          username:
            "user name must be at least 2 character long, username can only contain alphabets, underscores(_), dots/fullstops(.) and should not start with a number.",
        }));
        return;
      }
    } else if (field === "password") {
      if (!value) {
        setValidation((prev) => ({
          ...prev,
          password: "password is required",
        }));
      } else if (value.length < 8) {
        setValidation((prev) => ({
          ...prev,
          password: "password should be 8 characters long",
        }));
      } else if (validatePassword(value)) {
        setValidation((prev) => ({
          ...prev,
          password: null,
        }));
      } else {
        setValidation((prev) => ({
          ...prev,
          password:
            "password must contain : \nuppercase alphabet \n1 lowercase alphabet\n1 number \n1 special character",
        }));
      }
    } else if (field === "confirm_password") {
      if (matchPasswords(value)) {
        setValidation((prev) => ({
          ...prev,
          confirm_password: null,
        }));
      } else {
        setValidation((prev) => ({
          ...prev,
          confirm_password: "password mismatched",
        }));
      }
    }
  };
  /*___________async functions______________ */
  const handleCheckMail = async (event) => {
    event.preventDefault();
    const { email } = formData;
    if (email === "whimsychatofficial@gmail.com") return alert("Invalid email");
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/user/find-user`, {
        email,
      });
      if (response.data.exist && response.data.verified) {
        setFormData((prev) => ({
          ...prev,
          isChecked: true,
          isRegistered: true,
          verified: true,
        }));
        openSnackbar("Welcome back!", "info");
      } else if (response.data.exist && !response.data.verified) {
        setFormData((prev) => ({
          ...prev,
          isChecked: true,
          isRegistered: true,
          verified: false,
        }));
        openSnackbar("Check your mail and verify your mail", "warning");
      } else {
        setFormData((prev) => ({
          ...prev,
          isChecked: true,
          isRegistered: false,
        }));
        // setValidation(prev=>({...prev,username:null}))
        openSnackbar(
          "Welcome to WhimsyChat, please register yourself!",
          "info"
        );
      }
    } catch (error) {
      openSnackbar(error.response?.data.message || error.message,'error')
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignIn = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const { email, password } = formData;
    try {
      const response = await axios.post(`${BACKEND_URL}/user/signin`, {
        email,
        password,
      });
      dispatch({type:SIGNIN,payload:{...response.data.data}})
      openSnackbar(`Welcomeback ${response.data.data.first_name}`,'success')
      navigate("/")
    } catch (error) {
      openSnackbar(error.response?.data.message || error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };
  const checkUsernameAvailability = async () => {
    if(formData.username.length<2) return alert("username should be atleat 2 character log")
    setIsChecking(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/user/find-username`, {
        username: formData.username,
      });
      if (response.data.available){
        setValidation((prev) => ({ ...prev, username: true }));
      return true
    }
      else
        setValidation((prev) => ({
          ...prev,
          username: "username already taken",
        }));
        
    } catch (error) {
      openSnackbar(error.response?.data.message || error.message, "error");
    } finally {
      setIsChecking(false);
    }
  };
  const handleSignup = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    if(!validation.isUsernameAvailable){
     const isUsernameAvailable= await checkUsernameAvailability() 
     if(!isUsernameAvailable) {
      setIsLoading(false)
      return 
    }
  }
  try {
      await axios.post(`${BACKEND_URL}/user/signup`, formData);
      openSnackbar(`Verification mail sent to ${formData.email}`, "success");
      setFormData(defaultFormData);
    } catch (error) {
      openSnackbar(error.response?.data.message || error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };
  /*____________useEffects_____________ */
  useEffect(() => {
    if (authorization.token) navigate("/");
  }, []);
  return (
    <main className="min-w-full min-h-full lg:min-w-[30vw] lg:min-h-[30vh]  absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4  bg-light rounded-lg overflow-hidden">
      <h1 className="max-h-[10vh] py-2  text-5xl text-center text-white bg-primary">
        Whimsy Chat
      </h1>
      <div className="p-4 py-8 relative ">
        <form
          onSubmit={
            (formData.isChecked && formData.isRegistered)
              ? handleSignIn
              : (formData.isChecked && !formData.isRegistered)
              ? handleSignup
              : handleCheckMail
          }
          id="auth-form"
          className="flex flex-col items-center justify-center  gap-4 "
        >
          {/*email */}
          <div className="error-wrapper w-[85%]">
            <div className="relative flex gap-2">
              <input
                type="email"
                name="email"
                maxLength={320}
                placeholder=" "
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value.toLocaleLowerCase(),
                  }));
                  //only if a error is present
                  if (typeof validation.email === "string")
                    checkAllValidation("email", e.target.value);
                }}
                onBlur={(e) => checkAllValidation("email", e.target.value)}
                required
                disabled={formData.isChecked}
                className={`border ${
                  typeof validation.email === "string"
                    ? " border-red-400"
                    : "border-slate-400"
                } `}
              />
              <label htmlFor="email">
                {formData.isChecked ? "Your email" : "Enter Email ID"}
              </label>
              {formData.isChecked && (
                <button
                  type="button"
                  onClick={() =>{
                    setFormData((prev) => ({
                      ...prev,
                      password:"",
                      confirm_password:"",
                      isChecked: false,
                      isRegistered: false,
                      verified: false,
                    }))
                    setValidation({...defaultValiditions,email:null})
                  }
                  }
                  className="border border-primary min-w-10 rounded-lg"
                >
                  Edit
                </button>
              )}
            </div>
            {validation.email && (
              <p className="text-red-400 text-xs text-left px-1">
                *{validation.email}
              </p>
            )}
          </div>
          {formData.isChecked && (
            <Fragment>
              {formData.isRegistered && !formData.verified && (
                <div className="flex items-start  flex-col gap-2 w-[85%]">
                  <p className=" text-sm text-yellow-600">
                    Check your mail and click on verify email address button to
                    verify your email address
                  </p>
                  <button
                    type="button"
                    onClick={() => alert("Feature is not live yet")}
                    className="bg-primary text-white px-2 rounded-lg disabled:opacity-60"
                  >
                    Resend verification mail
                  </button>
                </div>
              )}
              {/*password */}
              {((formData.isRegistered && formData.verified) ||
                (!formData.isRegistered && !formData.verified)) && (
                  <div className="error-wrapper w-[85%]">
                    <div className="relative ">
                      <input
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        type="password"
                        name="password"
                        placeholder=" "
                        required
                        minLength={8}
                        maxLength={128}
                      />
                      <label htmlFor="password">Enter Password</label>
                    </div>
                    {validation.confirm_password && (
              <p className="text-red-400 text-xs text-left px-1">
                *{validation.confirm_password}
              </p>
            )}
                  </div>
                )}
              {!formData.isRegistered && (
                <Fragment>
                  {/*confirm_password */}
                  <div className="error-wrapper w-[85%]">
                    <div className="relative">
                      <input
                        value={formData.confirm_password}
                        onChange={(e) =>{
                          setFormData((prev) => ({
                            ...prev,
                            confirm_password: e.target.value,
                          }))
                        checkAllValidation("confirm_password",e.target.value)}
                        }
                        onBlur={(e)=>checkAllValidation("confirm_password",e.target.value)}
                        type="password"
                        name="confirm_password"
                        placeholder=" "
                        required
                        minLength={8}
                        maxLength={128}
                      />
                      <label htmlFor="confirm_password">Confirm Password</label>
                    </div>
                  </div>
                  {/*username*/}
                  <div className="error-wrapper w-[85%]">
                    <div className="relative flex gap-2">
                      <input
                        value={formData.username}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            username: e.target.value.toLocaleLowerCase(),
                          }));
                          // if (typeof validation.username === "string")
                            checkAllValidation("username", e.target.value);
                        }}
                        onBlur={(e) =>
                          checkAllValidation("username", e.target.value)
                        }
                        minLength={2}
                        maxLength={25}
                        type="text"
                        name="username"
                        placeholder=" "
                        required
                      />
                      <label htmlFor="username">Username</label>
                      <button
                        type="button"
                        className="border p-2 bg-primary text-white min-w-14 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={checkUsernameAvailability}
                        disabled={isChecking || !formData.username || formData.username.length<2 || typeof validation.username === "string"}
                      >
                        {isChecking ? (
                          <CircularProgress color="white" className="mr-2" />
                        ) : (
                          <p>Check availability</p>
                        )}
                      </button>
                    </div>
                    {typeof validation.username !== "object" && !isChecking && (
                      <div
                        className={`mt-1 flex text-left ${
                          typeof validation.username === "string"
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {typeof validation.username === "string" ? (
                          <Fragment>
                            <CancelIcon color="error" />
                            <p className="text-xs w-[85%] max-w-[300px] ">{validation.username}</p>
                            {/* {validation.username.split(',').map(item=>(<p key={item} >{item}</p>))} */}
                            
                          </Fragment>
                        ) : (
                          <Fragment>
                            <CheckCircleIcon color="success" />
                            <p>username available</p>
                          </Fragment>
                        )}
                      </div>
                    )}
                  </div>
                  {/*first_name*/}
                  <div className="relative w-[85%]">
                    <input
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                        }))
                      }
                      type="text"
                      name="first_name"
                      placeholder=" "
                      required
                      minLength={2}
                      maxLength={50}
                    />
                    <label htmlFor="first_name">First Name</label>
                  </div>
                  {/*last_name*/}
                  <div className="relative w-[85%]">
                    <input
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      type="text"
                      name="last_name"
                      placeholder=" "
                      required
                      minLength={2}
                      maxLength={50}
                    />
                    <label htmlFor="last_name">Last Name</label>
                  </div>
                  {/*findByEmail*/}
                  <div className="relative flex justify-between gap-6">
                    <p>Allow others to find you by email</p>
                    <input
                      type="checkbox"
                      checked={formData.findByEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          findByEmail: e.target.checked,
                        }))
                      }
                      className="w-5"
                    />
                  </div>
                </Fragment>
              )}
            </Fragment>
          )}
          <button
            type="submit"
            className="bg-primary text-white text-lg font-semibold  py-1 px-5 w-[85%] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={
              isLoading ||
              (!formData.isChecked &&  (typeof validation.email === "string" || !formData.email)) ||
              (formData.isChecked && !formData.isRegistered &&  Object.values(formData).some((value) => value === "")) ||
              Object.values(validation).some((value) => typeof value === "string" ) ||
              (formData.isRegistered && !formData.verified)
            }
          >
            {isLoading ? (
              <CircularProgress color=""/>
            ) : formData.isChecked && formData.isRegistered ? (
              "Sign In"
            ) : formData.isChecked && !formData.isRegistered ? (
              "Sign Up"
            ) : (
              "Next"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
