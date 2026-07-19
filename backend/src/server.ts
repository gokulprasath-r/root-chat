import http from "http";
import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { initSocket } from "./socket";
import dns from "dns";
// Entry point: connect to the database, then start listening. We wrap the Express
// app in a raw HTTP server so Socket.io can share the same port.
async function start(): Promise<void> {
  try {
dns.setServers(["8.8.8.8", "8.8.4.4"]);
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection failed:", (err as Error).message);
  }

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

start();
