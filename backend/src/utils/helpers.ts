// backend/src/utils/helpers.ts
import { format } from 'date-fns';
import config from '../config/config';

export const formatPhoneNumber = (phoneNumber: string) => {
    // Placeholder - Replace with actual phone number formatting logic
    return phoneNumber;
};

export const formatDate = (date: string | Date, formatString: string = 'yyyy-MM-dd HH:mm:ss') => {
    try {
        return format(new Date(date), formatString);
    } catch (error) {
        return ''; // Or some other default value on error
    }
};

export const isOutOfOffice = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hour = now.getHours();
    const minute = now.getMinutes();

    const currentTime = hour * 60 + minute;

    const [startHour, startMinute] = config.outOfOfficeStart.split(':').map(Number);
    const [endHour, endMinute] = config.outOfOfficeEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    return day === 0 || day === 6 || currentTime < startTime || currentTime > endTime;
};
