// backend/src/services/leadService.ts
import { createLead, deleteLead, getLeadById, getLeads, updateLead, Lead, getLeadByPhoneNumber, getLeadByEmail } from '../models/Lead'; //EXPORT
import { createMessage } from '../models/Message';

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
    // Further logic can be added here
};

// ADDED THESE EXPORTS!
export const getLeadByPhone = getLeadByPhoneNumber;
export const getLeadByMail = getLeadByEmail;
