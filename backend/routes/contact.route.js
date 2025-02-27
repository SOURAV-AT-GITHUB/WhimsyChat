const express = require("express");
const mongoose = require("mongoose");
const UserModel = require("../models/user.model");
const ContactsModel = require("../models/contacts.model");
const ConversationModel = require("../models/conversation.model")
const verifyToken = require("../middlewares/verifyToken")
const ContactsRouter = express.Router()

ContactsRouter.get("/fetch-contacts/:contact_id",verifyToken,async(req,res)=>{
    const {contact_id} = req.params
    try {
        const user = await UserModel.findById(req.user.mongoId)
        if(!user) return res.status(404).json({message:"User not found"})
        if(user.contacts.toString() !== contact_id) return res.status(401).json({message:"You are not authorized to access this contacts"})
        const contactList = await ContactsModel.findById(contact_id).populate("contacts")

        if(contactList){
        await   Promise.all(
         contactList.contacts.map(async(eachConversation)=>{
             await eachConversation.populate("participants")
            eachConversation.participants = eachConversation.participants.filter(user=>user._id.toString() !== req.user.mongoId)
        }) )  
        
        return res.json({data:contactList.contacts})
        }
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
})

ContactsRouter.get("/search",verifyToken,async(req,res)=>{
    const {query} = req.query || null
    if(!query) return res.status(400).json({message:"Invalid query"})
        try {
            const response = await UserModel.find({
                verified:true,
                _id: { $ne: req.user.mongoId },
                $or:[
                    {
                        findByEmail:true,
                        $or:[
                            {email:{$regex:query,$options:"i"}},
                            {username:{$regex:query,$options:"i"}},
                        ]
                    },
                    {
                        findByEmail:false,
                        username:{$regex:query,$options:"i"}
                    }
                ]
            }).select("first_name last_name email image findByEmail");
            if(!response[0]) return res.status(404).json({message:`No user associated with "${query}", or they may have excluded their email from search.`})
            const users = response.map(user => {
                if (!user.findByEmail) {
                  user.email = null;  
                }
                return user;
              });
                res.json({message:"Success",data:users})
        } catch (error) {
            res.status(500).json({message:error.message})
        }
})
module.exports = ContactsRouter