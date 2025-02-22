// backend/src/controllers/callController.ts
import { Request, Response, NextFunction } from 'express';
import * as callService from '../services/callService';
import logger from '../utils/logger';
import  masterAgentService  from '../services/masterAgentService'

export const makeCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { to, leadId, language } = req.body;
    const callLog = await callService.makeCall(to, leadId, language);

    // Notify the frontend via WebSockets
    req.app.get('io').emit('call_initiated', callLog);
     // Notify Master Agent for Dashboard update
      const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);

    res.status(201).json(callLog); // Return the call log
  } catch (error: any) {
    logger.error(`Error making call: ${error}`);
    next(error);
  }
};

export const receiveCall = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const {From, To} = req.body;
        const twiml = await callService.handleIncomingCall(From, To);
        res.type('text/xml');
        res.status(200).send(twiml)

    } catch(error:any) {
        logger.error(`Error receiving calls ${error}`)
        next(error)
    }
}

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;
      await callService.handleCallWebhook(CallSid, CallStatus, CallDuration, RecordingUrl);
       // Notify the frontend via WebSockets
        req.app.get('io').emit('call_updated', { sid: CallSid, status: CallStatus });
         // Notify Master Agent for Dashboard Update, if needed
        const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);

    res.status(200).send('Webhook received'); // Twilio expects a 200 OK
  } catch (error: any) {
    logger.error(`Error handling call webhook: ${error}`);
    next(error);
  }
};

export const getAllCallLogs = async (req: Request, res:Response, next: NextFunction) => {
  try{
     const callLogs = await callService.getAllCallLogs();
     res.status(200).json(callLogs)
  } catch(error: any){
    logger.error(`Error fetching call logs: ${error}`);
    next(error)
  }
}

export const getCallLog = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const {id} = req.params;
    const callLog = await callService.getCallLog(id);
    res.status(200).json(callLog);
  } catch(error:any){
    logger.error(`Error fetching the call log: ${error}`);
    next(error);
  }
}
export const transcribeCallLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updatedCallLog = await callService.transcribeCall(id);

        // Notify the frontend via WebSockets
        req.app.get('io').emit('call_transcribed', updatedCallLog);
          // Notify Master Agent for Dashboard update, if needed
        const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);

        res.status(200).json(updatedCallLog);
    } catch (error: any) {
        logger.error(`Error transcribing call: ${error}`);
        next(error);
    }
};
