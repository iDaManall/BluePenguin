import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound";
import Navbar from "./components/NavBar";
import { AuthProvider } from './context/AuthContext';
import AccountSettings from "./pages/Account/AccountSettings";
import Profile from "./pages/Profile/Profile";
import AddItem from './pages/Items/AddItem';

// clear refresh and access token when we log out, navigate to login page
function Logout(){
  localStorage.clear()
  return <Navigate to = "/login" />
}

// first clear the local storage to get rid of old access tokens lingering when first registering 
function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  useEffect(() => {
    // Check if token exists and is expired
    const TOKEN_EXPIRY_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const tokenTimestamp = localStorage.getItem('token_timestamp');
    if (tokenTimestamp) {
      const currentTime = new Date().getTime();
      if (currentTime - parseInt(tokenTimestamp) > TOKEN_EXPIRY_TIME) {
        localStorage.clear();
        // Optionally redirect to login
        window.location.href = '/login';
      }
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/*all of the different routes we want to navigate between*/}
        <Navbar /> {/* Navbar is placed here to appear on every page */}
        <Routes>
          <Route path = "/" element = {<Home />} />
          <Route path = "/login" element = {<Login />} />
          <Route path = "/logout" element = {<Logout />} />
          <Route path = "/register" element = {<RegisterAndLogout />} />
          <Route path = "/home" element = {<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path = "*" element = {<NotFound />}></Route>
          <Route path="/account/settings" element={<AccountSettings />} />
          <Route path="/items/new" element={<AddItem />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
