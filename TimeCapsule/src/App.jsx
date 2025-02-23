import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import HomePage from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import AlbumPage from './pages/Albums.jsx';
import CapsulePage from './pages/Capsules.jsx';
import SearchImage from './pages/SearchImage.jsx';
function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/profile/album/:albumId' element={<AlbumPage />} />
        <Route path='/profile/capsule/:capsuleId' element={<CapsulePage />} />
        <Route path='/album/:albumId' element={<AlbumPage />} />
        <Route path='/search' element={<SearchImage />} />
      </Routes>
    </>
  );
}

export default App;
