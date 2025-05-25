import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import VerificationPage from './pages/VerificationPage'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import { GlobalProvider } from './context/GlobalContext'
import PrivateRoute from './components/PrivateRoute'
import { GlobalErrorPanel } from './components/ErrorPannel'

function App() {

  return (

    <GlobalProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <PrivateRoute> <Home/></PrivateRoute>}/> 
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/verification' element={<VerificationPage/>}/>
        {/* <Route path='/home' element={<Home/>}/> */}
        {/* <Route path='/dashboard' element={token ? <UserDashboard/> : <Login/>} /> */}
        <Route path="/dashboard" element={ <PrivateRoute> <UserDashboard /> </PrivateRoute>}/>
      </Routes>
    </BrowserRouter>
    <GlobalErrorPanel/>
    </GlobalProvider>
  )
}

export default App
