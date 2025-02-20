// backend/src/controllers/twimlController.ts
import { Request, Response, NextFunction } from 'express';
import openaiService from '../services/openaiService';

export const getTwiml = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { language } = req.query;

        // Input validation: Ensure language is a string and one of the supported languages
        if (typeof language !== 'string' || !['en-US', 'fr-FR', 'de-DE', 'es-ES', 'it-IT'].includes(language)) {
          res.type('text/xml');
          return res.status(400).send('<Response><Say>Invalid language selection.</Say></Response>');
        }

        const twimlResponse = await openaiService.generateContextForTwilio(language);

        // Check if the response is valid TwiML (basic check)
        if(!twimlResponse?.includes("<Response>")){
          throw