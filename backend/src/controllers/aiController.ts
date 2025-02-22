// backend/src/controllers/aiController.ts
import { Request, Response, NextFunction } from 'express';
import masterAgentService from '../services/masterAgentService';
import logger from '../utils/logger';

export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dashboardData = await masterAgentService.getDashboardData();
        res.status(200).json(dashboardData);
    } catch (error: any) {
        logger.error(`Error fetching dashboard data: ${error}`);
        next(error);
    }
};

export const askAiAssistant = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {query} = req.body;
        const response = await masterAgentService.getRagData(query);
        res.status(200).json({response});
    } catch(error: any) {
        logger.error(`Error fetching AI assistant: ${error}`);
        next(error)
    }
};
