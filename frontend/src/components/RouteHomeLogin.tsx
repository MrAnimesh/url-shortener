import React from 'react'
import Home from '../pages/Home'
import Login from '../pages/Login'

const RouteHomeLogin = () => {

    const token = localStorage.getItem("accessToken")

  return token ? <Home/> : <Login/>
}

export default RouteHomeLogin