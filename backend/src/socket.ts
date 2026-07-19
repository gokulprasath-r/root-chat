import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "./utils/token";
import { AUTH_COOKIE } from "./utils/cookie";
import { env } from "./config/env";

let io: Server | null = null;

// How many live sockets each user has (they may have several tabs open). A user
// is "online" while this count is > 0.
const onlineCounts = new Map<string, number>();

function onlineUserIds(): string[] {
  return [...onlineCounts.keys()];
}

// Pull the JWT out of the raw Cookie header on the socket handshake.
function tokenFromCookieHeader(header?: string): string | null {
  if (!header) return null;
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: [env.clientUrl, "http://localhost:3000", "http://localhost:3001"],
      credentials: true,
    },
  });

  // Authenticate every socket using the same cookie the REST API uses.
  io.use((socket, next) => {
    try {
      const token = tokenFromCookieHeader(socket.handshake.headers.cookie);
      if (!token) return next(new Error("Not authorized"));
      const payload = verifyToken(token);
      socket.data.userId = payload.id;
      next();
    } catch {
      next(new Error("Not authorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    socket.join(userId);

    // Track presence; announce when a user first comes online.
    const prev = onlineCounts.get(userId) ?? 0;
    onlineCounts.set(userId, prev + 1);
    if (prev === 0) io?.emit("presence:update", { userId, online: true });

    // Tell the newcomer who is currently online.
    socket.emit("presence:state", onlineUserIds());

    socket.on("disconnect", () => {
      const count = (onlineCounts.get(userId) ?? 1) - 1;
      if (count <= 0) {
        onlineCounts.delete(userId);
        io?.emit("presence:update", { userId, online: false });
      } else {
        onlineCounts.set(userId, count);
      }
    });
  });
}

// Emit an event to a specific user's room (all their connected sockets).
export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(userId).emit(event, payload);
}
