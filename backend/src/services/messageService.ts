// backend/src/services/messageService.ts
import twilioService from './twilioService';
import mailgunService from './mailgunService';
import { createMessage, getMessages, getMessageById, updateMessage, getMessagesByLeadId, getMessagesByChannelAndLeadId, Message } from '../models/Message';
import openaiService from './openaiService';
import { getLeadById, updateLead } from '../models/Lead';
import { createAppointment, Appointment } from '../models/Appointment';
import logger from '../utils/logger';
import { getAISettingsByChannel } from '../models/AISettings';
import { isOutOfOffice } from '../utils/helpers';
import { getLeadByPhoneNumber, getLeadByEmail} from '../models/Lead'
import OpenAI from 'openai';

export const sendMessage = async (leadId: string, channel: 'WhatsApp' | 'SMS' | 'Email', messageContent: string): Promise<Message> => {
    const lead = await getLeadById(leadId);
    if (!lead) {
        throw new Error('Lead not found');
    }

    let message;
    try {
        switch (channel) {
            case 'WhatsApp':
                message = await twilioService.sendWhatsAppMessage(lead.phone_number, messageContent, leadId);
                break;
            case 'SMS':
                message = await twilioService.sendSMS(lead.phone_number, messageContent, leadId);
                break;
            case 'Email':
                // Assuming you have a subject for the email.
                const subject = "Regarding your inquiry with BusinessOn.ai";
                message = await mailgunService.sendEmail(lead.email!, subject, messageContent);
                break;
            default:
                throw new Error('Invalid channel');
        }
        const messageData: Omit<Message, 'id' | 'timestamp'> = { // Explicit type
          lead_id: leadId,
          channel: channel,
          direction: 'Outbound', // Since we're sending the message
          content: messageContent,
        }

        const createdMessage = await createMessage(messageData);
        return createdMessage;

    } catch (error: any) {
        logger.error(`Error sending ${channel} message:`, error);
        throw new Error(`Failed to send ${channel} message: ${error.message}`);
    }
};

export const receiveMessage = async (leadId: string, channel: 'WhatsApp' | 'SMS' | 'Email', messageContent: string): Promise<Message> => {

      if (isOutOfOffice()) {
        // Handle out-of-office scenario.
        const outOfOfficeMessage = "Thank you for your message.  We are currently out of the office and will respond to you as soon as possible.";
        await sendMessage(leadId, channel, outOfOfficeMessage);
        const messageData: Omit<Message, 'id' | 'timestamp'> = { //Explicit type
          lead_id: leadId,
          channel: channel,
          direction: 'Inbound',
          content: messageContent,
        }
          const createdMessage = await createMessage(messageData)
        return createdMessage;

    }
  // 1. Log the received message
      const messageData: Omit<Message, 'id' | 'timestamp'> = { // Explicit type
          lead_id: leadId,
          channel: channel,
          direction: 'Inbound',
          content: messageContent,
        }
    const createdMessage = await createMessage(messageData);
    const lead = await getLeadById(leadId);
    if(!lead){
      throw new Error("Lead Not found");
    }
    // 2. Get AI settings for the channel
    const aiSettings = await getAISettingsByChannel(channel);

    // 3. Generate AI response
    const prompt = `Lead ID: ${leadId}\nChannel: ${channel}\nMessage: ${messageContent}\n`;
    const systemMessage = aiSettings.context || `You are a helpful assistant for BusinessOn.ai.  Your goal is to help qualify leads and schedule appointments. Be ${aiSettings.tone} and ${aiSettings.style}.`;

      // Create conversation history for RAG
      const conversationHistory = await getMessagesByChannelAndLeadId(leadId, channel);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {role: "system", content: systemMessage},
        ...conversationHistory.map(msg => ({
          role: msg.direction === 'Inbound' ? "user" : "assistant",
          content: msg.content,
        })),
          {role: "user", content: messageContent} // The new incoming message
      ];

    const aiResponse = await openaiService.generateChatResponse(messages, 'gpt-3.5-turbo');

    // 4. Send AI response (using the `sendMessage` function)
    await sendMessage(leadId, channel, aiResponse);

     // 5. Check if the response indicates an appointment request
    if (aiResponse.toLowerCase().includes('book an appointment')) { // Add more robust checks here
        // Extract appointment details
        const appointmentRegex = /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/; // Example: 2024-03-15 10:30
        const match = aiResponse.match(appointmentRegex);

        if (match) {
            const dateStr = match[1];
            const timeStr = match[2];
            const dateTimeStr = `${dateStr}T${timeStr}:00`; //

            const appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'> = { // Explicit type
                lead_id: leadId,
                date_time: dateTimeStr,
                source: channel, // Source is the channel
                status: 'Scheduled',
            };

        try{
             await createAppointment(appointmentData);
             await updateLead(leadId, {status: 'Hot'}) // Update the lead status
             await sendMessage(leadId, channel, `Great, your appointment is booked for ${dateTimeStr}. Please confirm or let us know if you'd like to reschedule.`);
            } catch(error:any) {
                if (error.message.includes('overlaps')) { //Appointment Overlapping condition
                    await sendMessage(leadId, channel, `Sorry, the requested time slot is unavailable. Please suggest an alternative time.`);
                  } else {
                    await sendMessage(leadId, channel, 'Sorry, there was an issue booking your appointment. Please try again or contact us directly.');
                  }

            }
        } else {
            // If no clear date/time, ask for clarification
            await sendMessage(leadId, channel, 'Could you please specify the date and time you would like to book the appointment?');
        }
    } else {
        await updateLead(leadId, {status: 'Warm'}); // Update Lead to Warm
    }
      if(!aiResponse.toLowerCase().includes('book an appointment')){  // Auto Follow Up
        setTimeout(async()=> {
           const latestMessage = await getMessagesByChannelAndLeadId(leadId, channel);
           const lastMessage = latestMessage[latestMessage.length - 1];

            if(lastMessage && lastMessage.direction === 'Outbound'){ // If last message was sended by AI
              await sendMessage(leadId, channel, 'We have not received a response from you yet. Is there anything else I can assist you with?');
              await updateLead(leadId, {status: "Warm"})
            }
        }, 24*60*60*1000) //24 hours
    }
     if(aiResponse.toLowerCase().includes('connect to agent')){ // Connect to agent
         const message = `The client is asking to connect to a agent. Lead Id ${leadId}`;
         await sendMessage(leadId, channel, "Please wait while I connect you to an agent."); //To the client
         // To send to the agent, create a new lead, and message to the lead by agent

     }
      return createdMessage;
};
export const getAllMessages = async(): Promise<Message[]> => {
    return getMessages();
}

export const getMessage = async (id:string):Promise<Message> => {
    return getMessageById(id)
}
