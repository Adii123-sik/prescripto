import axios from "axios";
import { useState } from "react";
import { createContext } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext()


const AdminContextProvider =(props)=>{

    const [aToken,setAToken]=useState(localStorage.getItem('aToken')?localStorage.getItem('aToken'):'')
    const [doctors,setDoctors]=useState([])
    const [appointments,setAppointments]=useState([])

    const backendUrl=import.meta.env.VITE_BACKEND_URL

    const  getAllDoctors=async()=>{

        try{

       const {data} =await axios.post(backendUrl + '/api/admin/all-doctors' , {}, {headers :{aToken}})

       if(data.success){
           setDoctors(data.doctors)
           console.log(data.doctors);
       }else{
        toast.error(data.message)
       }

        }catch(error){
            console.log(error);
            toast.error(error.message)

        }
    }


    const changeAvailability= async(docId)=>{

        try{

            const {data} =await axios.post(backendUrl + '/api/admin/change-availability' , {docId}, {headers :{aToken}})

            if(data.success){

                toast.success(data.message)
                getAllDoctors()
            }else{
                toast.error(data.message)
            }

        }catch(error){
            console.log(error);
            toast.error(error.message)
        }
    }

    const getAllApointments=async()=>{

        try{
            const {data} =await axios.get(backendUrl + '/api/admin/appointments' , {headers :{aToken}})

            if(data.success){
                setAppointments(data.appointments)
                
                
            }else{
                toast.error(data.message)
            } 

        }catch(error){
            console.log(error);
            toast.error(error.message)
        }


    }


    const cancelAppointment=async(appointmentId)=>{

        try{
            const {data} =await axios.post(backendUrl + '/api/admin/cancel-appointment' , {appointmentId}, {headers :{aToken}})

            if(data.success){
                toast.success(data.message)
                getAllApointments()
            }else{
                toast.error(data.message)
            }

        }catch(error){
            console.log(error);
            toast.error(error.message)
        }

    }

    const value ={

        aToken,setAToken,
        backendUrl,doctors,
        getAllDoctors,
        changeAvailability,
        appointments,setAppointments,
        getAllApointments,
        cancelAppointment




    }

    return (

        <AdminContext.Provider value={value}>
            {
                props.children
            }
        </AdminContext.Provider>
    )

}


export default AdminContextProvider