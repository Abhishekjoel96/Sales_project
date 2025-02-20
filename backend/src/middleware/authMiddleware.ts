// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import config from '../config/config';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('X-API-Key');

    if (apiKey === config.apiKey) {
        next();
    }
     else if(!apiKey){
        logger.error('API key is missing')
        return res.status(400).json({ error: 'API key is required.' });
    }

    else {
        logger.warn('Unauthorized access attempt');
        res.status(401).json({ error: 'Unauthorized' });
    }
};