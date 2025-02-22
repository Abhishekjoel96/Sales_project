//backend/src/utils/validation.ts
import Joi from 'joi';

export const leadSchema = Joi.object({
    name: Joi.string().required(),
    phone_number: Joi.string().required(),
    email: Joi.string().email().allow(null, ''),
    region: Joi.string().allow(null, ''),
    source: Joi.string().required(),
    status: Joi.string().valid('New', 'Cold', 'Warm', 'Hot').default('New'),
    company: Joi.string().allow(null, ''),
    industry: Joi.string().allow(null, '')
});

export const appointmentSchema = Joi.object({
    lead_id: Joi.string().required(),
    date_time: Joi.date().required(),
    source: Joi.string().required(),
    status: Joi.string().valid('Scheduled', 'Completed', 'Cancelled').default('Scheduled'),
});

export const messageSchema = Joi.object({
    lead_id: Joi.string().required(),
    channel: Joi.string().valid('WhatsApp', 'SMS', 'Email').required(),
    direction: Joi.string().valid('Inbound', 'Outbound').required(),
    content: Joi.string().required(),
    timestamp: Joi.date().default(Date.now),
});

export const callLogSchema = Joi.object({
    lead_id: Joi.string().required(),
    twilio_call_sid: Joi.string().required(),
    duration: Joi.number().allow(null),
    status: Joi.string().valid('scheduled', 'initiated', 'ringing', 'in_progress', 'completed', 'failed', 'no_answer', 'busy').required(),
    recording_url: Joi.string().allow(null, ''),
    transcription: Joi.string().allow(null, ''),
    summary: Joi.string().allow(null, ''),
    direction: Joi.string().valid('Inbound', 'Outbound').required(),
    timestamp: Joi.date().default(Date.now)
});


export const aiSettingsSchema = Joi.object({
    channel: Joi.string().valid('WhatsApp', 'SMS', 'Email', 'Call').required(),
    context: Joi.string().allow(null, ''),
    tone: Joi.string().valid('Formal', 'Informal', 'Friendly', 'Professional').default('Professional'),
    style: Joi.string().valid('Concise', 'Detailed', 'Short', 'Medium').default('Concise'),
});
