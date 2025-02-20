// backend/src/services/calendarService.ts
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    Appointment
} from '../models/Appointment';

import { addHours, subHours, formatISO, parseISO } from 'date-fns'; // Import date-fns functions
import twilioService from './twilioService';
import mailgunService from './mailgunService';
import { getLeadById } from '../models/Lead';
import config from '../config/config';
import { formatDate } from '../utils/helpers';
import supabase from '../utils/db';

export const createNewAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
  return createAppointment(appointmentData);
};

export const getAllAppointments = async(): Promise<Appointment[]> => {
  return getAppointments();
}
export const getAppointment = async(id:string): Promise<Appointment> => {
  return getAppointmentById(id)
}

export const updateExistingAppointment = async (id: string, updateData: Partial<Omit<Appointment, 'id' | 'created_at'>>): Promise<Appointment> => {
    return updateAppointment(id, updateData);
};

export const deleteExistingAppointment = async (id:string): Promise<void> => {
  return deleteAppointment(id);
}

// Function to send reminders
const sendReminder = async (appointment: Appointment) => {
    const lead = await getLeadById(appointment.lead_id);
    if (!lead) {
        throw new Error('Lead not found');
    }
    const formattedDateTime = formatDate(appointment.date_time, 'EEEE, MMMM do yyyy, h:mm a'); // e.g., "Monday, March 15th 2024, 10:30 AM"
    const message = `Reminder: You have an appointment scheduled with BusinessOn.ai on ${formattedDateTime}.`;

    try{
      await twilioService.sendWhatsAppMessage(lead.phone_number, message, lead.id);
      await twilioService.sendSMS(lead.phone_number,message, lead.id);
      await mailgunService.sendEmail(lead.email!, "Appointment Reminder", message)

    } catch(error: any){
      throw new Error("Failed to send the Reminder: " + error.message)
    }

};

// Function to schedule reminders
export const scheduleReminders = async () => {
    const now = new Date();

    for (const hours of config.reminderTimes) {
        const reminderTime = subHours(now, hours);
        const reminderTimeString = reminderTime.toISOString();

          const { data, error } = await supabase
            .from('Appointments')
            .select('*')
            .gte('date_time', reminderTimeString) // Greater than or equal to the reminder time
            .lt('date_time', addHours(reminderTime, 1).toISOString()) // Less than 1 hour after
            .eq('status', 'Scheduled') // Only scheduled appointments
            if(error) {
               throw new Error(error.message)
            }
            if(!data){
              throw new Error('Appointment not found');
            }

        const appointments: Appointment[] = data as Appointment[];

        for (const appointment of appointments) {
            await sendReminder(appointment);
        }
    }
};
// Set interval for reminders, runs every 5 minutes or 1 hour
setInterval(scheduleReminders, 5 * 60 * 1000); // Every 5 minutes for testing