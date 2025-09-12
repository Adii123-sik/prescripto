import React from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'






const AllApointment = () => {

  const { aToken, getAllApointments, appointments,cancelAppointment } = useContext(AdminContext)
  const { calculateAge, slotDateFormate , currency} = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getAllApointments()
    }
  }, [aToken])

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border border-gray-300 rounded text-sm max-h-[80vh] min-h-[60vh] overflow-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b'>

          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>

        </div>

        {appointments.length === 0 ? (
          <div className='text-center text-gray-500 py-10'>No appointments found.</div>
        ) : (
          appointments.map((item,index)=>(
            <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-100' key={index}>
              <p className='max-sm:hidden'>{index+1}</p>

              <div className='flex items-center gap-2'>
                <img className='w-10 h-10 rounded-full' src={item.userData.image} alt="" /> <p>{item.userData.name}</p>
              </div>
              <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
              <p>{slotDateFormate(item.slotDate)},{item.slotTime}</p>
              <div className='flex items-center gap-2'>
                <img className='w-10 h-10 rounded-full bg-gray-200' src={item.docData.image} alt="" /> <p>{item.docData.name}</p>
              </div>
              <p>{currency}{item.amount}</p>
              {item.cancelled ? <p className='text-red-500 text-xs font-medium'>Cancelled</p> : <img onClick={()=>cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />}
            </div>
          ))
        )}
      </div>

    </div>
  )
}

export default AllApointment
