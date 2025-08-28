
import validator from 'validator'
import bycrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'



//API for registering a user user


const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body

        // checking for empty fields
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Please fill all the fields' })
        }

        // email validation

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email address' })
        }


        // password validation
        if (password.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters long' })
        }


        // hashing user password 

        const salt = await bycrypt.genSalt(10)
        const hashedPassword = await bycrypt.hash(password, salt)

        // creating user in database
        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = await userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        return res.json({ success: true, message: 'User registered successfully', token })

    } catch (error) {

        console.log(error);
        res.json({ success: false, message: 'User registration failed', error: error.message })

    }
}


// API for user login

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: 'Invalid email or password' })
        }

        const isMatch = await bycrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

            res.json({ success: true, message: 'User logged in successfully', token })
        } else {
            res.json({ success: false, message: 'Invalid email or password' })
        }


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'User login failed', error: error.message })
    }

}

// API for getting user profile data

const getProfile = async (req, res) => {
    try {
        const userId = req.userId; 
        const userData = await userModel.findById(userId).select('-password')

        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }

        res.json({ success: true, userData })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Failed to get user profile', error: error.message })
    }
}


//Api to update user profile

const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;
        const userId = req.userId;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: 'Please fill all the fields' });
        }

        await userModel.findByIdAndUpdate(userId, {
            name,
            phone,
            address: JSON.parse(address),
            dob,
            gender
        });

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                resource_type: 'image'
            });
            const imageURL = imageUpload.secure_url;
            await userModel.findByIdAndUpdate(userId, {
                image: imageURL
            });
        }
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Failed to update profile', error: error.message });
    }
}




// API to book appointment



const bookAppointment = async (req,res)=>{

    

    try {

        const {docId,slotDate,slotTime } = req.body;
        const userId = req.userId;


        const docData=await doctorModel.findById(docId).select('-password');
        


        if(!docData){
            return res.json({ success: false, message: 'Doctor not Available' });
        }

        let slots_booked = docData.slots_booked || {};


        // checking for slot availability
        if(slots_booked[slotDate]){

            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({ success: false, message: 'Slot not available' });
            }else{
                slots_booked[slotDate].push(slotTime);
            }
        }else{
            slots_booked[slotDate]=[slotTime];

        }

       const userData= await userModel.findById(userId).select('-password');
      

       let docObj = docData.toObject();
       delete docObj.slots_booked;

       const appointmentData={
        userId,
        docId,
        slotDate,
        slotTime,
        userData,
        docData:docObj,
        amount:docData.fees,
        date:Date.now(),
        
        
       }

       const newAppointment= new appointmentModel(appointmentData);
       await newAppointment.save();

       


       //save new slots data in docData
       await doctorModel.findByIdAndUpdate(docId, { slots_booked });

       res.json({ success: true, message: 'Appointment booked successfully', appointment: newAppointment });
        

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Failed to book appointment', error: error.message });

    }
}


//API to get appoiments  for frontend  my-appointment

const listAppointments = async (req, res) => {
    try {
        const userId = req.userId;
        const appointments = await appointmentModel.find({ userId }).populate('docId', '-password');

        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Failed to get appointments', error: error.message });
    }
}

//API to cancel appointment

const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.userId;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData.userId !== userId ) {
            return res.json({ success: false, message: 'Unauthorized access' });
        }

        
        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true});

        // releasing doctor slot

        const {docId, slotDate, slotTime} = appointmentData;

        const doctorData= await doctorModel.findById(docId);

        let slots_booked = doctorData.slots_booked;

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Failed to cancel appointment', error: error.message });
    }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment , listAppointments , cancelAppointment}