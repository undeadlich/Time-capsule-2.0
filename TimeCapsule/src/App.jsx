
import { Route, Router, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import HomePage from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'


function App() {


  return (
    <>
    
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/profile' element={<Profile />} />

      </Routes>
    
    </>
  )
}

export default App
