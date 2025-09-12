
import validator from "validator"
import bcrypt from "bcrypt"
import {v2 as cloudinary} from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js"


//API for adding doctors


const addDoctor=async (req,res)=>{

    try{

        const {name,email,password,speciality,degree,experience,about,fees,address}=req.body;
        const imageFile=req.file
        
        
        //checking for all data to add doctor

        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address){
             return res.json({success:false,message:"missing details"})
        }
        
        //validating email format

        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Invalid email"})
        }
    
        //validating strong password 


        if(password.length <8){
            return res.json({success:false,message:"please enter a strong password"})
        }


         // hashing doctor password


         const salt= await  bcrypt.genSalt(10)
         const hashedPassword=await bcrypt.hash(password,salt)

         // upload image to cloudinary

         const imageUpload=await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
         const imageUrl=imageUpload.secure_url


         const doctorData={
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now()
         }

         const newDoctor= new doctorModel(doctorData);
         await newDoctor.save()


         res.json({success:true,message:"doctor added"})



    }catch(error){

        console.log(error)
        res.json({success:false,message:"Error"})
        
    }
}


// API for  the  admin login

const loginAdmin=async (req,res)=>{

    try{

        const {email,password}=req.body

        if(email===process.env.ADMIN_EMAIL &&  password===process.env.ADMIN_PASS){

            const token=jwt.sign(email+password,process.env.JWT_SECRET)  

            res.json({success:true,token})

        }
        else{
            res.json({success:false,message:"Invalid credentials"})
        }



    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

// Api  to get all doctors for admin panel

const allDoctors=async (req,res)=>{

    try{

        const doctors=await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})

    }catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//API TO get all appointments for admin panel

const appointmentsAdmin=async (req,res)=>{

    try{

        const appointments=await appointmentModel.find({})
        res.json({success:true,appointments})

    }catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


export {addDoctor,loginAdmin,allDoctors,appointmentsAdmin}