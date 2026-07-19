import { io, Socket } from "socket.io-client";

// The API base is like "http://localhost:5000/api"; the socket server lives at
// the origin without the /api suffix.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

let socket: Socket | null = null;

// Single shared socket. `withCredentials` sends the auth cookie on the handshake
// so the server can identify the user.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { withCredentials: true });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
