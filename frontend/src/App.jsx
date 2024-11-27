import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound";
import Navbar from "./components/NavBar";
import { AuthProvider } from './context/AuthContext';
import AccountSettings from "./pages/Account/AccountSettings";

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
          <Route path = "*" element = {<NotFound />}></Route>
          <Route path="/account/settings" element={<AccountSettings />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
