// backend/src/models/AISettings.ts
import { aiSettingsSchema } from "../utils/validation";
import supabase from "../utils/db";

export interface AISettings {
  id: string;
  channel: 'WhatsApp' | 'SMS' | 'Email' | 'Call';
  context: string | null;
  tone: 'Formal' | 'Informal' | 'Friendly' | 'Professional';
  style: 'Concise' | 'Detailed' | 'Short' | 'Medium';
  updated_at: string;
}


export const getAISettingsByChannel = async (channel: 'WhatsApp' | 'SMS' | 'Email' | 'Call'): Promise<AISettings> => {
    const { data, error } = await supabase
        .from('AISettings')
        .select('*')
        .eq('channel', channel)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        // Return default settings if no settings found for the channel
      return {
        id: 'default', // Or generate a UUID if needed
        channel: channel,
        context: null, // Or a default context
        tone: 'Professional',
        style: 'Concise',
        updated_at: new Date().toISOString(),

      }
    }

    return data as AISettings;
};

export const updateAISettings = async (channel: 'WhatsApp' | 'SMS' | 'Email' | 'Call', settings: Partial<Omit<AISettings, 'id'>>): Promise<AISettings> => {
    const { error, value: validatedSettings } = aiSettingsSchema.validate(settings, { abortEarly: false, allowUnknown: true });
    if (error) {
      throw new Error(error.details[0].message);
    }

    const { data, error: dbError } = await supabase
        .from('AISettings')
        .update(validatedSettings)
        .eq('channel', channel)
        .select()
        .single();

    if (dbError) {
        throw new Error(dbError.message);
    }

    if(!data) {
        // if there is no data we'll insert
        const { data: insertData, error: insertError } = await supabase
            .from('AISettings')
            .insert([{ ...validatedSettings, channel }])
            .select()
            .single();

            if(insertError) {
                throw new Error(insertError.message);
            }
            if(!insertData){
                throw new Error("Failed to insert AI settings");
            }
            return insertData as AISettings;
    }

    return data as AISettings;
};
