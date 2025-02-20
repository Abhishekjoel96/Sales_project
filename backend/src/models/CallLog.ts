// backend/src/models/CallLog.ts
import { callLogSchema } from '../utils/validation';
import supabase from '../utils/db';

export interface CallLog {
  id: string;
  lead_id: string;
  twilio_call_sid: string;
  duration: number | null;
  status: 'scheduled' | 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy';
  recording_url: string | null;
  transcription: string | null;
  summary: string | null;
  direction: 'Inbound' | 'Outbound';
  timestamp: string;
}

export const createCallLog = async (callLogData: Omit<CallLog, 'id' | 'timestamp'>): Promise<CallLog> => {
  const { error, value: validatedCallLogData } = callLogSchema.validate(callLogData);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const { data, error: dbError } = await supabase
    .from('CallLogs')
    .insert([validatedCallLogData])
    .select()
    .single();

  if (dbError) {
    throw new Error(dbError.message);
  }
  if (!data) {
    throw new Error("Call log creation failed");
  }
  return data as CallLog;
};
export const getCallLogs = async (): Promise<CallLog[]> => {
    const { data, error } = await supabase
        .from('CallLogs')
        .select('*');

    if (error) {
        throw new Error(error.message);
    }
    return data as CallLog[];
};

export const getCallLogById = async (id:string): Promise<CallLog> => {
  const {data, error} = await supabase
  .from('CallLogs')
  .select('*')
  .eq('id', id)
  .single()

  if(error){
    throw new Error(error.message)
  }
  if(!data){
    throw new Error('Call log not found');
  }
  return data as CallLog;
}
export const updateCallLog = async (id: string, updateData: Partial<Omit<CallLog, 'id'>>): Promise<CallLog> => {
  const { error, value: validatedData } = callLogSchema.validate(updateData, {abortEarly:false, allowUnknown: true});
  if(error){
    throw new Error(error.message);
  }

  const {data, error:dbError} = await supabase
  .from('CallLogs')
  .update(validatedData)
  .eq('id', id)
  .select()
  .single()

  if(dbError){
    throw new Error(dbError.message);
  }
  if(!data){
    throw new Error('Failed to update Call log');
  }
  return data as CallLog;
}