 import express from "express"
 import cors from "cors"
 import dotenv from "dotenv"
 dotenv.config();
 import connectDB from "./config/mongoDb.js"
 import connectCloudinary from "./config/cloudinary.js"





 // app config  

 const app= express()
 const port= process.env.PORT
 connectDB()
 connectCloudinary()


 //middleware
 app.use(express.json())
 app.use(cors())


 //  API endpoints

 app.get("/",(req,res)=>{
    res.send("api is working");
 })




 app.listen(port,()=>{

    console.log(`sever is start listening on a port ${port}`);
 })
  