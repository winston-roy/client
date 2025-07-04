import { io } from "socket.io-client";

export const createSocketConnection = () => {
    if (location.hostname === "localhost")
        return io('http://localhost:7777');
    else
        return io("/api/v2", {path:"/api/socket.io"})
}