// backend/src/utils/helpers.ts
import { format, isWithinInterval, subMinutes, addMinutes, parseISO  } from 'date-fns';
import config from '../config/config';
import { getAppointments } from "../models/Appointment";


export const formatPhoneNumber = (phoneNumber: string) => {
    // Placeholder - Replace with actual phone number formatting logic
    return phoneNumber;
};

export const formatDate = (date: string | Date, formatString: string = 'yyyy-MM-dd HH:mm:ss') => {
    try {
        return format(new Date(date), formatString);
    } catch (error) {
        return '';
    }
};

export const isOutOfOffice = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    const [startHour, startMinute] = config.outOfOfficeStart.split(':').map(Number);
    const [endHour, endMinute] = config.outOfOfficeEnd.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    return (day === 0 || day === 6 || currentTime < startTime || currentTime > endTime);
};