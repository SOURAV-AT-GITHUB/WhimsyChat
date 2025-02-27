const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
      username:{type:String,required:true,unique:true},
      email:{type:String,required:true,unique:true},
      password:{type:String,required:true,},
      first_name:{type:String,required:true,},
      last_name:{type:String,required:true,},
      image:{type:String,default:null},
      contacts:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"contact"},
      findByEmail:{type:Boolean,default:true},
      verified:{type:Boolean,default:false}
},{versionKey:false})
const UserModel = mongoose.model("user",userSchema)
module.exports = UserModel