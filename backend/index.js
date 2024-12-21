const express = require("express")
require("dotenv").config()
const PORT = process.env.PORT || 3000
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

app.get("/",(req,res)=>{
      res.send({message:"Server running fine!!"})
})


app.listen(PORT,()=>{
      console.log(`Server running on port ${PORT}`)
})