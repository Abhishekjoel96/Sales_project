// backend/src/models/Appointment.ts
import { appointmentSchema } from '../utils/validation';
import supabase from '../utils/db';
import { Lead } from './Lead';

export interface Appointment {
  id: string;
  lead_id: string;
  date_time: string;
  source: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at: string;
}

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
    const { error, value: validatedAppointmentData } = appointmentSchema.validate(appointmentData);
    if (error) {
        throw new Error(error.details[0].message);
    }
      const { data: leadData, error: leadError } = await supabase
        .from('Leads')
        .select('phone_number')
        .eq('id', validatedAppointmentData.lead_id)
        .single();

      if (leadError) {
        throw new Error(leadError.message);
      }
      if(!leadData){
        throw new Error('Lead Not Found');
      }

      // Check for overlapping appointments
      const { data: overlappingAppointments, error: overlapError } = await supabase
      .from('Appointments')
      .select('id')
      .eq('lead_id', validatedAppointmentData.lead_id)
      .lte('date_time', validatedAppointmentData.date_time )
      .gt('date_time',  validatedAppointmentData.date_time)


    if (overlapError) {
        throw new Error(overlapError.message);
    }

    if (overlappingAppointments && overlappingAppointments.length > 0) {
        throw new Error('Appointment overlaps with existing appointment.');
    }

    const { data, error: dbError } = await supabase
        .from('Appointments')
        .insert([validatedAppointmentData])
        .select()
        .single();

    if (dbError) {
        throw new Error(dbError.message);
    }
      if(!data) {
        throw new Error('Appointment creation failed');
      }
    return data as Appointment;
};

export const getAppointments = async(): Promise<Appointment[]> => {
  const {data, error} = await supabase
  .from('Appointments')
  .select('*');

  if(error) {
    throw new Error(error.message);
  }
  return data as Appointment[];
}
export const getAppointmentById = async(id:string): Promise<Appointment> => {
  const {data, error} = await supabase
  .from('Appointments')
  .select('*')
  .eq('id', id)
  .single()

  if(error){
    throw new Error(error.message);
  }

  if(!data){
    throw new Error('Appointment not found');
  }
  return data as Appointment;
}

export const updateAppointment = async (id: string, updateData: Partial<Omit<Appointment, 'id' | 'created_at'>>): Promise<Appointment> => {
  const {error, value: validateData} = appointmentSchema.validate(updateData, {abortEarly:false, allowUnknown:true});

  if(error){
    throw new Error(error.message)
  }
  const {data, error: dbError} = await supabase
  .from('Appointments')
  .update(validateData)
  .eq('id', id)
  .select()
  .single()

  if(dbError){
    throw new Error(dbError.message);
  }
  if(!data){
    throw new Error("Appointment not updated");
  }
  return data as Appointment;
}

export const deleteAppointment = async (id:string): Promise<void> => {
  const {error} = await supabase
  .from('Appointments')
  .delete()
  .eq('id', id);

  if(error){
    throw new Error(error.message);
  }
}