import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export type LiveUpdatePayload = {
  activeUsers: number;
  pages: Array<{ page: string; count: number }>;
};

let io: SocketIOServer | null = null;

export function initSocketServer(server: HttpServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  return io;
}

export function emitLiveUpdate(data: LiveUpdatePayload): void {
  if (!io) {
    return;
  }

  io.emit("live:update", data);
}
