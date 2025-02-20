// backend/src/middleware/websocketMiddleware.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';

export const setupWebSockets = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
        origin: "https://statuesque-trifle-bc421e.netlify.app", // Your frontend URL
        methods: ["GET", "POST"]
      }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    // You can add more WebSocket event handlers here as needed.
  });
  return io;

};