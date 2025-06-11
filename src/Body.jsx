import React from 'react'
import NavBar from './NavBar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'

function Body() {
  return (
      <div>
          <NavBar />
          <Outlet />
          <Footer/>
    </div>
  )
}

export default Body