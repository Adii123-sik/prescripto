
import validator from 'validator'
import bycrypt from  'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'



//API for registering a user user


const registerUser= async (req,res)=>{

    try{
        const {name,email,password}=req.body

        // checking for empty fields
        if(!name || !email || !password){
            return res.json({success:false,message:'Please fill all the fields'})
        }

        // email validation

        if(!validator.isEmail(email)){
            return res.json({success:false,message:'Please enter a valid email address'})
        }
 

        // password validation
        if(password.length<8){
            return res.json({success:false,message:'Password must be at least 8 characters long'})
        }


        // hashing user password 

        const salt = await bycrypt.genSalt(10)
        const hashedPassword = await bycrypt.hash(password, salt)

        // creating user in database
        const userData ={
            name,
            email,
            password: hashedPassword
        }

       const newUser = await userModel(userData)
       const user= await newUser.save()

       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET )

       return res.json({ success: true, message: 'User registered successfully', token })

    }catch(error){

        console.log(error);
        res.json({ success: false, message: 'User registration failed', error: error.message })

    } 
}


// API for user login

   const loginUser= async(req,res)=>{   

     try{

        const {email,password}=req.body
        const user= await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message:'Invalid email or password'})
        }

        const isMatch = await bycrypt.compare(password, user.password)

        if(isMatch){
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET )

            res.json({ success: true, message: 'User logged in successfully', token })
        }else{
             res.json({success:false,message:'Invalid email or password'})
        }

 
     }catch(error){
        console.log(error);
        res.json({ success: false, message: 'User login failed', error: error.message })
     }

   }


export {registerUser,loginUser}   