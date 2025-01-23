import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SingIn from "./pages/SignIn";
import VerifyMail from "./pages/VerifyMail";
import InvalidPath from "./pages/InvalidPath";
import { Alert, Snackbar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {OPEN_SNACKBAR,CLOSE_SNACKBAR} from './store/actionTypes'
import { useEffect } from "react";
function App() {
  const { open, severity, message } = useSelector((store) => store.snackbar);
  const {first_name} = useSelector(store=>store.authorization)
  const dispatch = useDispatch()
  const closeSnackbar = ()=>dispatch({type:CLOSE_SNACKBAR})
  useEffect(()=>{
    if(first_name) dispatch({type:OPEN_SNACKBAR,payload:{message:`Welcomeback ${first_name}`,severity:"success"}})
  },[])
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SingIn />} />
        <Route path="/verify-email/:token" element={<VerifyMail />} />
        <Route path="*" element={<InvalidPath />} />
      </Routes>
      
       <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar> 
      
    </>
  );
}

export default App;
