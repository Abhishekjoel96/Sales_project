//backend/src/models/Lead.ts
import { leadSchema } from '../utils/validation';
import supabase from '../utils/db';

export interface Lead {
    id: string;
    name: string;
    phone_number: string;
    email: string | null;
    region: string | null;
    source: string;
    status: 'New' | 'Cold' | 'Warm' | 'Hot';
    company: string | null;
    industry: string | null;
    created_at: string;
    updated_at: string;
}

export const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> => {
  const { error, value: validatedLeadData } = leadSchema.validate(leadData);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const { data, error: dbError } = await supabase
    .from('Leads')
    .insert([validatedLeadData])
    .select()
    .single();

  if (dbError) {
    throw new Error(dbError.message);
  }
  if (!data) {
    throw new Error("Lead creation failed");
  }

  return data as Lead;
};


export const getLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
      .from('Leads')
      .select('*');

  if (error) {
      throw new Error(error.message);
  }

  return data as Lead[];
};


export const getLeadById = async (id:string): Promise<Lead> => {
const {data, error} = await supabase
.from('Leads')
.select('*')
.eq('id', id)
.single();

if(error){
  throw new Error(error.message);
}
if(!data){
  throw new Error('Lead not found');
}
return data as Lead;
}

export const updateLead = async (id: string, updateData: Partial<Omit<Lead, 'id' | 'created_at'>>): Promise<Lead> => {
  const { error, value: validatedUpdateData } = leadSchema.validate(updateData, { abortEarly: false, allowUnknown: true });
    if (error) {
      throw new Error(error.details[0].message);
  }

  const { data, error: dbError } = await supabase
      .from('Leads')
      .update(validatedUpdateData)
      .eq('id', id)
      .select()
      .single();

  if (dbError) {
      throw new Error(dbError.message);
  }
  if(!data) {
      throw new Error("Lead update failed");
  }

  return data as Lead;
};

export const deleteLead = async (id:string): Promise<void> => {
  const {error} = await supabase
  .from('Leads')
  .delete()
  .eq('id',id);

  if(error){
      throw new Error(error.message);
  }
}

export const getLeadByPhoneNumber = async (phoneNumber: string): Promise<Lead | null> => {
    const { data, error } = await supabase
        .from('Leads')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

    if (error) {
      if (error.code === 'PGRST116') { // Assuming this code means "not found"
            return null; // Lead not found, return null
        }
        throw new Error(error.message);
    }

    return data as Lead || null; // Return null if data is empty
};

// Added to get lead by email

export const getLeadByEmail = async (email: string): Promise<Lead | null> => {
  const {data, error} = await supabase
  .from('Leads')
  .select('*')
  .eq('email', email)
  .single()

  if(error){
    if (error.code === 'PGRST116'){
      return null; // Lead not found by email
    }
    throw new Error(error.message);
  }
  return data as Lead || null;
}
