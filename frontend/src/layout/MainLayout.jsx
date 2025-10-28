import Navbar from '@/components/Navbar'
import React from 'react'
import { Outlet } from 'react-router-dom'
// import { useLoadUserQuery } from '@/features/api/authApi'
const MainLayout = () => {
    // useLoadUserQuery();
  return (
    <div>
        <Navbar />
        <div className="pt-16">
            <Outlet />
        </div>
    </div>
  )
}

export default MainLayout