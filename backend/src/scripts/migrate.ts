// backend/src/scripts/migrate.ts
import supabase from '../utils/db';
import logger from '../utils/logger';
import { PostgrestError } from '@supabase/supabase-js'; // Import PostgrestError


const migrate = async () => {
    try {
        // --- Leads Table ---
        const { error: leadsError } = await supabase.schema
            .createTable('Leads', { ifNotExists: true }) // Use schema.createTable, with options
            .then(({ error }) => {
              if (error) throw error;
              return supabase
                .from('Leads')
                .insert([
                  { name: 'John Smith', phone_number: '+15551234567', email: 'john.123@example.com', region: 'North America', source: 'Website', status: 'Hot', company: 'TechCorp Solutions', industry:'Technology' },
                  { name: 'Sarah Johnson', phone_number: '+15552345678', email: 'sarah.johnson@inovate.co', region: 'Europe', source: 'WhatsApp', status: 'Warm', company: 'Inovate Inc', industry: 'Healthcare' },
                  { name: 'Michael Brown', phone_number: '+15553456789', email: 'michael.456@global.net', region: 'Asia Pacific', source: 'SMS', status: 'Cold', company: 'Global Manufacturing Ltd', industry:'Manufacturing' },
                ])
            });

        if (leadsError) throw leadsError;

        logger.info('Created and Seeded Leads table');


        // --- CallLogs Table ---
        const { error: callLogsError } = await supabase.schema
            .createTable('CallLogs',{ ifNotExists: true })
            .then(({ error }) => {
                if(error) throw error;
                return supabase.from('CallLogs')
                .insert([
                  { lead_id: '83667894-939a-42aa-ab75-74575f285766', twilio_call_sid: 'CA1234567890abcdef', duration: 240, status: 'completed', recording_url: 'https://example.com/recording1.mp3', transcription: 'This is a sample transcription of the first call.', summary: 'Customer expressed strong interest.', direction: 'Outbound', timestamp: '2024-02-20T14:30:00Z' },
                  { lead_id: '257c5c39-9a65-4499-a19b-54856a9f1b8f', twilio_call_sid: 'CA0987654321fedcba', duration: 180, status: 'completed', recording_url: 'https://example.com/recording2.mp3', transcription: 'This is another example transcription.', summary: 'Customer requested a callback.', direction: 'Inbound', timestamp: '2024-02-20T16:00:00Z' },
                  { lead_id: '8b27a7b3-9f1a-4e2b-8c99-2d758a6f4e1c', twilio_call_sid: 'CAaabbccddeeff001122', status: 'failed', direction: 'Outbound', timestamp: '2024-02-21T09:15:00Z' },
                  ])
              })
        if (callLogsError) throw callLogsError;
        logger.info('Created and Seeded CallLogs table');

        // --- Appointments Table ---
        const { error: appointmentsError } = await supabase.schema.createTable('Appointments', { ifNotExists: true })
        .then(({ error }) => {
            if(error) throw error;
          return supabase.from('Appointments')
          .insert([
            { lead_id: '83667894-939a-42aa-ab75-74575f285766', date_time: '2024-02-22T10:00:00Z', source: 'Call', status: 'Scheduled' },
            { lead_id: '257c5c39-9a65-4499-a19b-54856a9f1b8f', date_time: '2024-02-23T14:00:00Z', source: 'WhatsApp', status: 'Scheduled' },
            { lead_id: '8b27a7b3-9f1a-4e2b-8c99-2d758a6f4e1c', date_time: '2024-02-24T11:00:00Z', source: 'Call', status: 'Completed' },
          ])
        });

        if (appointmentsError) throw appointmentsError;
        logger.info('Created and Seeded Appointments table');

        // --- Messages Table ---
        const { error: messagesError } = await supabase.schema
        .createTable('Messages', { ifNotExists: true })
        .then(({ error }) => {
          if(error) throw error
          return supabase.from('Messages')
          .insert([
            { lead_id: '83667894-939a-42aa-ab75-74575f285766', channel: 'WhatsApp', direction: 'Outbound', content: 'Initial outreach message to John Smith.' },
            { lead_id: '83667894-939a-42aa-ab75-74575f285766', channel: 'WhatsApp', direction: 'Inbound', content: 'Thanks for the information, I am available on the proposed date.' },
            { lead_id: '257c5c39-9a65-4499-a19b-54856a9f1b8f', channel: 'SMS', direction: 'Outbound', content: 'Follow-up message to Sarah Johnson.' },
            { lead_id: '8b27a7b3-9f1a-4e2b-8c99-2d758a6f4e1c', channel: 'Email', direction: 'Inbound', content: 'Received email from Michael Brown with questions.' }
          ])
        });
        if (messagesError) throw messagesError;
        logger.info('Created and Seeded Messages table');

        // --- AISettings Table ---
        const { error: aiSettingsError } = await supabase.schema.createTable('AISettings', { ifNotExists: true })
        .then(({ error }) => {
          if(error) throw error;
          return supabase.from('AISettings')
          .insert([
            { channel: 'WhatsApp', context: 'You are a helpful and friendly AI assistant for BusinessOn.ai. Your primary goal is to qualify leads and book appointments for consultations.', tone: 'Friendly', style: 'Concise' },
            { channel: 'SMS', context: 'You are a concise and professional AI assistant for BusinessOn.ai. Focus on scheduling appointments and providing brief information.', tone: 'Professional', style: 'Short' },
            { channel: 'Email', context: 'You are a formal and detailed AI assistant for BusinessOn.ai. Provide comprehensive information and assist with scheduling consultations.', tone: 'Formal', style: 'Detailed' },
            { channel: 'Call', context: 'You are a helpful and efficient AI phone agent for BusinessOn.ai.  Your main task is to qualify leads and book appointments.', tone: 'Professional', style: 'Concise' }

          ])
        });

        if (aiSettingsError) throw aiSettingsError;
        logger.info('Created and Seeded AISettings table');

        logger.info('Database migration completed successfully.');

    } catch (error: any) {
        logger.error('Error during database migration:', error);
        console.error('Migration error:', error.message); // Log to console too
    }
};

migrate();
