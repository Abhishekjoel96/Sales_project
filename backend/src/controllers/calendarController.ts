// backend/src/controllers/calendarController.ts
import { Request, Response, NextFunction } from 'express';
import * as calendarService from '../services/calendarService';
import logger from '../utils/logger';
import  masterAgentService  from '../services/masterAgentService'

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointmentData = req.body;
    const newAppointment = await calendarService.createNewAppointment(appointmentData);

    // Notify the frontend via WebSockets
    req.app.get('io').emit('appointment_created', newAppointment);
      // Notify Master Agent for Dashboard Update, if needed
      const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);

    res.status(201).json(newAppointment);
  } catch (error: any) {
    logger.error(`Error creating appointment: ${error}`);
    next(error);
  }
};

export const getAllAppointments = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const appointments = await calendarService.getAllAppointments();
    res.status(200).json(appointments);
  }catch(error: any){
    logger.error(`Error getting all appointments: ${error}`);
    next(error);
  }
}

export const getAppointment = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const {id} = req.params;
    const appointment = await calendarService.getAppointment(id);
    res.status(200).json(appointment);

  } catch(error: any){
    logger.error(`Error fetching the appointments: ${error}`);
    next(error)
  }
}

export const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedAppointment = await calendarService.updateExistingAppointment(id, updateData);

    // Notify the frontend via WebSockets
    req.app.get('io').emit('appointment_updated', updatedAppointment);
      // Notify Master Agent for Dashboard Update, if needed
      const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);


    res.status(200).json(updatedAppointment);
  } catch (error: any) {
    logger.error(`Error updating appointment: ${error}`);
    next(error);
  }
};

export const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await calendarService.deleteExistingAppointment(id);

    // Notify the frontend via WebSockets
    req.app.get('io').emit('appointment_deleted', { id });
      // Notify Master Agent for Dashboard Update, if needed
      const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);

    res.status(204).send(); // No Content
  } catch (error: any) {
    logger.error(`Error deleting appointment: ${error}`);
    next(error);
  }
};
