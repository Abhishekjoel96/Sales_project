// backend/src/middleware/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack); // Log the full error stack

  // Set a default status code (Internal Server Error)
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Customize the error response based on the type of error
  if (err.message.startsWith('Validation error')) {
    statusCode = 400; // Bad Request
    message = err.message;
  } else if (err.message.startsWith('Lead not found') || err.message.startsWith('Call log not found') || err.message.startsWith('Appointment not found') || err.message.startsWith('Message Not found')) {
    statusCode = 404; // Not Found
    message = err.message;
  } else if(err.message.startsWith('Failed to send WhatsApp message') || err.message.startsWith("Failed to send SMS") || err.message.startsWith('Failed to send email') || err.message.startsWith("Failed to make call") || err.message.startsWith("Failed to transcribe call") || err.message.startsWith("Failed to generate AI response") ){
    statusCode = 502; //Bad Gateway
    message = err.message;
  }
   else if(err.message.startsWith("Appointment overlaps")){
    statusCode = 409; //Conflict
    message = err.message
   }

  res.status(statusCode).json({ error: message });
};