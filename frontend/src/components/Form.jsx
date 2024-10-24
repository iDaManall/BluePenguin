import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form ({route, method}) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const name = method === "login" ? "Login" : "Register"

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault() // prevent us from actually submitting the form and prevent reloading the page 
        
        try {
            const res = await api.post(route, {username, password})
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                console.log("Access Token:", localStorage.getItem(ACCESS_TOKEN)); // Debugging
                console.log("Refresh Token:", localStorage.getItem(REFRESH_TOKEN)); // Debugging
                navigate("/")
            } else {
                navigate("/login")
            }
        } catch (error) {
            console.error("Error:", error); // Debugging log
            alert(error)
        } finally {
            setLoading(false)
        }
    }

    return <form onSubmit={handleSubmit} className="form-container">
        <h1>{name}</h1>
        <input 
            className="form-input" 
            type="text" 
            value={username} 
            onChange = {(e) => setUsername(e.target.value)}
            placeholder="Username"
        />
        <input 
            className="form-input" 
            type="password" 
            value={password} 
            onChange = {(e) => setPassword(e.target.value)}
            placeholder="Password"
        />
        {loading && <LoadingIndicator />}
        <button className="form-button" type="submit">{name}</button>
    </form>
}

export default Form