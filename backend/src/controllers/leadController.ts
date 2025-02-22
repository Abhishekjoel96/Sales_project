// backend/src/controllers/leadController.ts
import { Request, Response, NextFunction } from 'express';
import * as leadService from '../services/leadService';
import { Lead } from '../models/Lead';
import logger from '../utils/logger';
import  masterAgentService  from '../services/masterAgentService'
import multer from 'multer';
const upload = multer(); //Handles the file.

export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'> = req.body;
    const newLead = await leadService.createNewLead(leadData);

        // Notify the frontend via WebSockets
        req.app.get('io').emit('lead_added', newLead);
          // Notify Master Agent for Dashboard Update, if needed
        const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);

    res.status(201).json(newLead);
  } catch (error: any) {
    logger.error(`Error creating lead: ${error}`);
    next(error);
  }
};
export const getAllLeads = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const leads = await leadService.getAllLeads();
        res.status(200).json(leads);

    } catch(error:any){
        logger.error(`Error fetching leads: ${error}`);
        next(error)
    }
}

export const getLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const {id} = req.params;
    const lead = await leadService.getLead(id);
    res.status(200).json(lead)
  } catch(error:any){
    logger.error(`Error fetching lead by id: ${error}`)
    next(error)
  }
}

export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: Partial<Omit<Lead, 'id' | 'created_at'>> = req.body;
    const updatedLead = await leadService.updateExistingLead(id, updateData);

     // Notify the frontend via WebSockets
        req.app.get('io').emit('lead_updated', updatedLead);
    // Notify Master Agent for Dashboard Update, if needed
        const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);

    res.status(200).json(updatedLead);
  } catch (error: any) {
    logger.error(`Error updating lead: ${error}`);
    next(error);
  }
};

export const deleteLead = async(req: Request, res:Response, next: NextFunction) => {
  try{
    const {id} = req.params;
    await leadService.deleteExistingLead(id);
     // Notify Master Agent for Dashboard Update (if needed)
     const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);
    res.status(204).send(); // No content
  } catch(error:any){
    logger.error(`Error in deleting lead: ${error}`);
    next(error);
  }
}

export const importLeads = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try{
        const importedLeads = await leadService.importLeads(req.file);
         // Notify Master Agent for Dashboard Update (if needed)
        const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);
        res.status(201).json({ message: 'Leads imported successfully', count: importedLeads });

    } catch(error: any){
        logger.error(`Error importing leads from the file`, error);
        next(error);
    }
}
