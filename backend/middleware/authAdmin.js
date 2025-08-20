import jwt from "jsonwebtoken"


//admin authentication middleware

const authAdmin=async (req,res,next)=>{
    try{

     const {atoken}=req.headers

     if(!atoken){
        return res.json({success:false,message:"Not Authorize Login Again" })
     }

     const token_decode=jwt.verify(atoken,process.env.JWT_SECRET)

     if(token_decode!==process.env.ADMIN_EMAIL + process.env.ADMIN_PASS){
        
        return res.json({success:false,message:"Not Authorize Login Again" })
     }
    

     next()
 



    }catch(error){

         console.log(error);
        res.json({success:false,message:"Error"})

    }
}


export default authAdmin    