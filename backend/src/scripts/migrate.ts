// backend/src/scripts/migrate.ts
import supabase from '../utils/db';
import logger from '../utils/logger';

const migrate = async () => {
  try {
    // --- Leads Table ---
    const { error: leadsError } = await supabase.schema.createTable('Leads', (table) => {
      table.uuid('id').primaryKey().defaultTo(supabase.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.string('phone_number').notNullable();
      table.string('email');
      table.string('region');
      table.string('source').notNullable();
      table.enum('status', ['New', 'Cold', 'Warm', 'Hot']).defaultTo('New');
      table.string('company');
      table.string('industry');
      table.timestamp('created_at').defaultTo(supabase.fn('now')());
      table.timestamp('updated_at').defaultTo(supabase.fn('now')());
    });
    if (leadsError) throw leadsError;
    logger.info('Created Leads table');


    // --- CallLogs Table ---
    const { error: callLogsError } = await supabase.schema.createTable('CallLogs', (table) => {
      table.uuid('id').primaryKey().defaultTo(supabase.raw('uuid_generate_v4()'));
      table.uuid('lead_id').notNullable().references('id').inTable('Leads'); // Foreign key
      table.string('twilio_call_sid').notNullable();
      table.integer('duration');
      table.enum('status', ['scheduled', 'initiated', 'ringing', 'in_progress', 'completed', 'failed', 'no_answer', 'busy']).notNullable();
      table.string('recording_url');
      table.text('transcription');
      table.text('summary');
      table.enum('direction', ['Inbound', 'Outbound']).notNullable();
      table.timestamp('timestamp').defaultTo(supabase.fn('now')());
    });
    if (callLogsError) throw callLogsError;
    logger.info('Created CallLogs table');

    // --- Appointments Table ---
    const { error: appointmentsError } = await supabase.schema.createTable('Appointments', (table) => {
        table.uuid('id').primaryKey().defaultTo(supabase.raw('uuid_generate_v4()'));
        table.uuid('lead_id').notNullable().references('id').inTable('Leads'); // Foreign Key
        table.timestamp('date_time').notNullable();
        table.string('source').notNullable();
        table.enum('status', ['Scheduled', 'Completed', 'Cancelled']).defaultTo('Scheduled');
        table.timestamp('created_at').defaultTo(supabase.fn('now')());
        table.timestamp('updated_at').defaultTo(supabase.fn('now')());
    });

    if(appointmentsError) throw appointmentsError;
    logger.info('Created Appointments table');

    // --- Messages Table ---
    const { error: messagesError } = await supabase.schema.createTable('Messages', (table) => {
      table.uuid('id').primaryKey().defaultTo(supabase.raw('uuid_generate_v4()'));
      table.uuid('lead_id').notNullable().references('id').inTable('Leads'); // Foreign Key
      table.enum('channel', ['WhatsApp', 'SMS', 'Email']).notNullable();
      table.enum('direction', ['Inbound', 'Outbound']).notNullable();
      table.text('content').notNullable();
      table.timestamp('timestamp').defaultTo(supabase.fn('now')());
    });
    if (messagesError) throw messagesError;
    logger.info('Created Messages table');

    // --- AISettings Table ---
    const { error: aiSettingsError } = await supabase.schema.createTable('AISettings', (table) => {
        table.uuid('id').primaryKey().defaultTo(supabase.raw('uuid_generate_v4()'));
        table.enum('channel', ['WhatsApp', 'SMS', 'Email', 'Call']).notNullable();
        table.text('context');
        table.enum('tone', ['Formal', 'Informal', 'Friendly', 'Professional']).defaultTo('Professional');
        table.enum('style', ['Concise', 'Detailed', 'Short', 'Medium']).defaultTo('Concise');
        table.timestamp('updated_at').defaultTo(supabase.fn('now')());
    });

    if(aiSettingsError) throw aiSettingsError;
      logger.info('Created AISettings table');

    logger.info('Database migration completed successfully.');

  } catch (error: any) {
    logger.error('Error during database migration:', error);
    console.error('Migration error:', error.message); // Log to console too
  }
};

migrate();