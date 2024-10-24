import {Navigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import {useState, useEffect} from "react";

// we check if route is authorized, otherwise redirect to log in
function ProtectedRoute({children}) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        console.log("ProtectedRoute mounted");
        // auth().catch(() => setIsAuthorized(false))
        auth();
    }, []);

    // refresh the access token for us automatically 
    const refreshToken = async () => {
        console.log("Refreshing token...");
        const refreshToken = localStorage.getItem(REFRESH_TOKEN) // get the refresh token
        // try to send respond to root with refresh token which should give new access token
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            // successful, we did get back an access token, so set new access token as access token in local storage
            if (res.status === 200) {
                console.log("Token refreshed successfully");
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                console.log("Token refresh failed");
                setIsAuthorized(false); // error for some reason, no access token received
            }
        } catch (error) {
            // console.log(error);
            console.error("Token refresh error:", error);
            setIsAuthorized(false)
        }
    }

    // check if we need to refresh or good (is auth token expired or not, if so auto refresh token in background)
    const auth = async () => {
        console.log("Authenticating...");
        const token = localStorage.getItem(ACCESS_TOKEN)
        console.log("Access Token in ProtectedRoute:", token); // for debugging

        if (!token) {
            console.log("No token found, redirecting to login");
            setIsAuthorized(false);
            return;
        }

        try {
            const decoded = jwtDecode(token) // decode the token
            console.log("Decoded Token:", decoded); // for debugging
            const tokenExpiration = decoded.exp
            const now = Date.now() / 1000 // get date in seconds

            if (tokenExpiration < now) {
                console.log("Token expired, refreshing..."); // for debugging
                await refreshToken()
            } else {
                console.log("Token valid");
                setIsAuthorized(true);
            }
        } catch (error) {
            console.error("Token decoding error:", error);
            setIsAuthorized(false);
        } 
    } 

    if (isAuthorized === null) {
        console.log("Authorization status: Loading");
        return <div>Loading...</div>
    }

    console.log("Authorization status:", isAuthorized ? "Authorized" : "Unauthorized");
    return isAuthorized ? children : <Navigate to = "/login" /> // as soon as rendered we go to login page

}

export default ProtectedRoute
