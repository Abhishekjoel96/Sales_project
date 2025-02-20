import { Request, Response, NextFunction } from 'express';
import * as messageService from '../services/messageService';
import logger from '../utils/logger';
import  masterAgentService  from '../services/masterAgentService'
import { getLeadByPhoneNumber, getLeadByEmail } from '../services/leadService'; // Correct import
import * as leadService from '../services/leadService';


export const send = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { leadId, channel, messageContent } = req.body;
        const message = await messageService.sendMessage(leadId, channel, messageContent);

          // Notify the frontend via WebSockets
        req.app.get('io').emit('message_sent', message);
          // Notify Master Agent for Dashboard update, if needed
        const dashboardData = await masterAgentService.getDashboardData();
        req.app.get('io').emit('dashboard_updated', dashboardData);

        res.status(201).json(message);
    } catch (error: any) {
        logger.error(`Error sending message: ${error}`);
        next(error);
    }
};

//For Incoming messages from Twilio and Mailgun
export const receive = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract information based on the source (Twilio or Mailgun)
        let leadId: string;
        let channel: 'WhatsApp' | 'SMS' | 'Email';
        let messageContent: string;
        //For Twilio
        if (req.body.MessageSid) { // Twilio
            channel = req.body.To.startsWith('whatsapp') ? 'WhatsApp' : 'SMS';

            const from = req.body.From.replace('whatsapp:', '').replace('+', '');
            let lead = await getLeadByPhoneNumber(from); // Corrected function call

            if(!lead){
                // Create a new lead
              lead =   await leadService.createNewLead({
                    name: from, // Use the phone number as a placeholder for the name
                    phone_number: from,
                    source: channel, // Source is the channel
                    status: 'New', // New lead
                    email: null, // No email yet
                    region: null, // No region for now
                    company: null,
                    industry:null
                });
            }
            leadId = lead.id
            messageContent = req.body.Body;

        } else if (req.body.sender) { // Mailgun
            channel = 'Email';
            const email = req.body.sender;
            const lead = await getLeadByEmail(email); // Corrected function call
             if (!lead) {
                logger.warn(`Received email from unknown sender: ${email}`);
                return res.status(400).send('Unknown sender');
              }
            leadId = lead.id;

            messageContent = req.body.text || req.body['stripped-text'] || '';

        } else {
            return res.status(400).send('Invalid request');
        }

        const message = await messageService.receiveMessage(leadId, channel, messageContent);

        // Notify the frontend via WebSockets
        req.app.get('io').emit('message_received', message);

        // Respond to the webhook provider (Twilio/Mailgun)
        res.status(200).send('Message received');

    } catch (error: any) {
        logger.error(`Error receiving message: ${error}`);
        next(error);
    }
};

export const getAllMessages = async (req:Request, res: Response, next: NextFunction) => {
    try{
        const messages = await messageService.getAllMessages();
        res.status(200).json(messages);

    }catch(error: any){
        logger.error(`Error fetching messages: ${error}`);
        next(error)
    }
}

export const getMessage = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const {id} = req.params;
    const message = await messageService.getMessage(id);
    res.status(200).json(message)
  }catch(error: any){
    logger.error(`Error fetching messages by id: ${error}`);
        next(error)
  }
}
