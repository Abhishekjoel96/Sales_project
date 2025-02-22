// backend/src/config/config.ts
import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 3001,
    supabaseUrl: process.env.VITE_SUPABASE_URL!,
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY!,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID!,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN!,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER!,
    mailgunApiKey: process.env.MAILGUN_API_KEY!,
    mailgunDomain: process.env.MAILGUN_DOMAIN!,
    mailgunFromEmail: process.env.MAILGUN_FROM_EMAIL!,
    openaiApiKey: process.env.OPENAI_API_KEY!,
    outOfOfficeStart: '09:00',
    outOfOfficeEnd: '17:00',
    reminderTimes: [24, 1],
    apiKey: process.env.API_KEY! //Required for authentication
};
