import { io } from "socket.io-client";

// Helper to extract cookie value by name
const getCookie = (name) => {
    const cookieArr = document.cookie.split(';');
    for (let cookie of cookieArr) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
};

export const createSocketConnection = () => {
    const token = getCookie("token"); // 🍪 Get token from cookie
   if (location.hostname === "localhost") {
        return io('http://localhost:7777', {
            auth: { token },
        });
    } else {
        return io("/", {
            path: "/socket.io",
            auth: { token }, 
        });
    }
};
