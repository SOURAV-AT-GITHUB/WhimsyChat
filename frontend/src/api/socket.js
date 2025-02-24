import {io} from 'socket.io-client'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
var socket 

const connectSocket = (token)=>{
    socket = io(BACKEND_URL,{
        auth:{
            token
        }
    })
    socket.on('connect',()=>{
        console.log("Websocket connection stablished")
    })
    socket.on("disconnect",()=>{

        console.log("Websocket disconnected")
    })
    socket.on("connect_error",(err)=>{
        console.log("Socket connection error",err)
        if(err.message === "Token Error"){
            localStorage.removeItem('auth')
            location.reload()
        }
    })
}

const getSocket = ()=>{
    if(!socket) console.log("Socket is not connected")
        return socket
}
export {connectSocket,getSocket}