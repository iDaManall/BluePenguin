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
import Filter from "./pages/Filter/Filter";
import ItemPage from './pages/ItemPage/ItemPage';
import ApplyUser from "./pages/Auth/ApplyUser";
import EditProfile from "./pages/Profile/EditProfile";
import PaymentsAndAddress from "./pages/PaymentsAndAddress/PaymentsAndAddress";
import Orders from "./pages/orders/orders";
import Requests from "./pages/Requests/Requests";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
          {/* <Route path="/profile" element={<Profile />} /> */}
          <Route path="/profile/:id?" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/items/new" element={<AddItem />} />
          <Route path="/category/:category" element={<Filter />} />
          <Route path="/items/:id" element={<ItemPage />} />
          <Route path="/apply-user" element={<ApplyUser />} />
          <Route path="/payments" element={<PaymentsAndAddress />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
