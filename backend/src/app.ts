// backend/src/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import { Server as HttpServer } from 'http'; // Import HttpServer
import leadRoutes from './routes/leadRoutes';
import callRoutes from './routes/callRoutes';
import messageRoutes from './routes/messageRoutes';
import calendarRoutes from './routes/calendarRoutes';
import aiRoutes from './routes/aiRoutes';
import twimlRoutes from './routes/twimlRoutes'; // Import twimlRoutes
import { errorHandler } from './middleware/errorMiddleware';
import { authenticate } from './middleware/authMiddleware';
import { apiLimiter } from './middleware/rateLimitMiddleware';
import { setupWebSockets } from './middleware/websocketMiddleware';
import bodyParser from 'body-parser';

const createServer = (): HttpServer => {

    const app: Express = express();

     // Enable CORS for your frontend origin
    const corsOptions = {
      origin: 'https://statuesque-trifle-bc421e.netlify.app', // Your frontend URL
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true, // Allow cookies, if needed
    };
    app.use(cors(corsOptions));
    // Middleware
    app.use(express.json()); // Parse JSON request bodies
    app.use(bodyParser.urlencoded({ extended: true })); //For Twilio and mailgun webhook
    // Apply the rate limiting middleware to all requests
    app.use(apiLimiter);

    // Mount routes (all routes require authentication)

    app.use('/api/leads', authenticate, leadRoutes);
    app.use('/api/calls', authenticate, callRoutes);
    app.use('/api/messages', authenticate, messageRoutes);
    app.use('/api/calendar', authenticate, calendarRoutes);
    app.use('/api/ai', authenticate, aiRoutes);
    app.use('/twiml', twimlRoutes); // Mount the TwiML routes


    // Centralized error handling
    app.use(errorHandler);

    const server = new HttpServer(app); // Create an HttpServer
    const io = setupWebSockets(server); // Set up WebSockets
    app.set('io', io);  // Store the 'io' instance in the app object. VERY IMPORTANT



    return server;

}

export default createServer;
