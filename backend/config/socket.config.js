require("dotenv").config()
const {Server } = require("socket.io")
const jwt = require("jsonwebtoken")

const connectedUsers = new Map()

module.exports = function setupSocket(server){
    const io = new Server (server,{
        cors:{
            origin:process.env.FRONTEND_URL
        }
    })
    //for authentication
    io.use((socket,next)=>{
        const token = socket.handshake.auth.token
        if(!token){
            return next(new Error ('Authentication error'))
        }
        jwt.verify(token,process.env.JWT_SECRET_SIGN_IN,(err,decoded)=>{
            if(err){
                return next(new Error("Token Error"))
            }else{
                socket.user = decoded
                next()
            }
        })
    })
    //on connection
    io.on('connection',async(socket)=>{
        const {username} = socket.user
        const {mongoId} = socket.user
        connectedUsers.set(username,socket.id)
        console.log(`${username} connected with id ${socket.id}`)

        socket.on("disconnect",()=>{
            connectedUsers.delete(username)
            console.log(`${username} disconnected`)
        }) 

    })

    
    return io
}