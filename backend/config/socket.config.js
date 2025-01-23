require("dotenv").config()
const {Server } = require("socket.io")
const jwt = require("jsonwebtoken")

const connectedUsers = new Map()
const MessageModel = require("../models/message.model")
const getContacts = require("../controllers/contact.fetch")
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
                if(err.name === "TokenExpiredError"){
                    return next(new Error("Token Expired"))
                }else{
                    return next(new Error("Invalid"))
                }
            }else{
                socket.user = decoded
                next()
            }
        })
    })
    //on connection
    io.on('connection',async(socket)=>{
        const username = socket.user.username
        connectedUsers.set(username,socket.id)
        console.log(`${username} connected with id ${socket.id}`)
        try {
            const contacts = await getContacts(username)
            io.to(socket.id).emit('contacts',contacts)
        } catch (error) {
            console.log(error)
            io.to(socket.id).emit('contacts',{contacts:null})
        }
        socket.on("disconnect",()=>{
            connectedUsers.delete(username)
            console.log(`${username} disconnected`)
        }) 
        socket.on("sendMessage",async({receiver,message,date},callback)=>{
            try {
                
                const newMessage = new MessageModel({message,receiver,date,sender:username,status:{isSent:Date.now(),isDelivered:false,isSeen:false}})
                if(connectedUsers.has(receiver)){
                    newMessage.status.isDelivered = Date.now()
                    console.log(`message send to ${receiver} from ${username}`)
                    io.to(connectedUsers.get(receiver)).emit("sendMessage",data)
                }
                console.log(`message not send to ${receiver} from ${username}`)
                await newMessage.save()
                callback({status:'success',data})
            } catch (error) {
                callback({status:'error',message:error.message})
            }
        })
    })

    
    return io
}