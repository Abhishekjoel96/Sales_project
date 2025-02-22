// backend/src/services/leadService.ts
import { createLead, deleteLead, getLeadById, getLeads, updateLead, Lead, getLeadByPhoneNumber, getLeadByEmail } from '../models/Lead';
import { createMessage } from '../models/Message';
import logger from '../utils/logger';
import { parse } from 'csv-parse/sync'; // Synchronous version
import { Readable } from 'stream';

export const createNewLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> => {
  return createLead(leadData);
};

export const getAllLeads = async(): Promise<Lead[]> => {
  return getLeads();
}

export const getLead = async(id:string): Promise<Lead> => {
    return getLeadById(id);
}
export const updateExistingLead = async (id: string, updateData: Partial<Omit<Lead, 'id' | 'created_at'>>): Promise<Lead> => {
    return updateLead(id, updateData);
};

export const deleteExistingLead = async(id:string) : Promise<void> => {
    return deleteLead(id);
}

export const updateLeadStatusBasedOnInteraction = async (leadId: string, channel: 'WhatsApp' | 'SMS' | 'Email', direction: 'Inbound' | 'Outbound') => {
    const lead = await getLeadById(leadId);

    if (direction === 'Inbound') {
        // If it's an inbound message, and the lead is New or Cold, move to Warm.
        if (lead.status === 'New' || lead.status === 'Cold') {
            await updateLead(leadId, { status: 'Warm' });
        }
    }
    // Further logic can be added here, e.g., checking for keywords to move to 'Hot'
};

export const getLeadByPhone = async (phoneNumber: string): Promise<Lead | null> => {
    return getLeadByPhoneNumber(phoneNumber)
}
export const getLeadByMail = async(email: string) : Promise<Lead | null> => {
    return getLeadByEmail(email);
}
// New function to handle lead import
export const importLeads = async(file: Express.Multer.File): Promise<number> => {
        let createdCount = 0;
        try {
          const records: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] = parse(file.buffer.toString(), {
            columns: true,
            skip_empty_lines: true,
          });

          for (const leadData of records) {
            try{
                await createLead(leadData);
                createdCount++;
            }
            catch(error: any){
                logger.error(`Error importing lead: ${error.message}`)
            }
          }
          return createdCount;
        }
        catch(error: any){
            logger.error(`Error importing leads: ${error}`)
            throw new Error('Failed to import leads: ' + error.message); // Or handle more gracefully
        }
}
