// backend/src/services/leadService.ts
import { createLead, deleteLead, getLeadById, getLeads, updateLead, Lead, getLeadByPhoneNumber, getLeadByEmail } from '../models/Lead';
import { createMessage } from '../models/Message';
import logger from '../utils/logger';
import { parse } from 'csv-parse';
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
    return getLeadByPhoneNumber(phoneNumber);
}
export const getLeadByMail = async (email:string): Promise<Lead | null> => {
    return getLeadByEmail(email)
}

// New function to handle lead import

export const importLeads = async(file: Express.Multer.File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const results: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] = [];
        const parser = parse({
            columns: true,
            skip_empty_lines: true,
        });

        parser.on('readable', () => {
            let record;
            while ((record = parser.read()) !== null) {
                results.push(record);
            }
        });

        parser.on('error', (err) => {
            reject(err); // Reject the promise on parsing error
        });

        parser.on('end', async () => {
            let createdCount = 0;
            // Use Promise.all to handle multiple async operations
            const createPromises = results.map(async (leadData) => {
            try{
                await createLead(leadData);
                createdCount++;

            } catch(error: any){
                //Individual lead creation failed.
                logger.warn(`Failed to create lead ${leadData.name}: ${error.message}`)
            }
            })

            try {
                await Promise.all(createPromises); // Wait for all lead creations to complete
                resolve(createdCount); // Resolve with the number of created leads
              } catch (error) {
                reject(error); // Reject if *any* of the createLead calls fail
              }
        });
         // Create a stream from the buffer and pipe it to the parser
        const stream = new Readable();
        stream.push(file.buffer);
        stream.push(null);  // Signal the end of the stream
        stream.pipe(parser)
    })
}
