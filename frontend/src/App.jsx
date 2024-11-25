import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound";
import ProfileView from "./pages/Profile/ProfileView";
import EditProfile from "./pages/Profile/EditProfile";
import Navbar from "./components/NavBar";
import { AuthProvider } from './context/AuthContext';


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
          <Route path="/profile/:id" element={<ProfileView />} />
          <Route path="/profile/edit/:id" element={<EditProfile />} />
          <Route path = "*" element = {<NotFound />}></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
