// backend/src/models/Message.ts
import { messageSchema } from '../utils/validation';
import supabase from '../utils/db';

export interface Message {
    id: string;
    lead_id: string;
    channel: 'WhatsApp' | 'SMS' | 'Email';
    direction: 'Inbound' | 'Outbound';
    content: string;
    timestamp: string;
}

export const createMessage = async (messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    const { error, value: validatedMessageData } = messageSchema.validate(messageData);
    if (error) {
        throw new Error(error.details[0].message);
    }
    const { data, error: dbError } = await supabase
        .from('Messages')
        .insert([validatedMessageData])
        .select()
        .single();

    if (dbError) {
        throw new Error(dbError.message);
    }
    if(!data){
      throw new Error('Message creation failed');
    }

    return data as Message;
};

export const getMessages = async(): Promise<Message[]> => {
 const {data, error} = await supabase
 .from('Messages')
 .select('*');

 if(error){
  throw new Error(error.message);
 }
 return data as Message[];
}

export const getMessageById = async (id:string): Promise<Message> => {
    const {data, error} = await supabase
    .from('Messages')
    .select('*')
    .eq('id', id)
    .single()

    if(error){
        throw new Error(error.message);
    }
    if(!data){
        throw new Error('Message Not found')
    }
    return data as Message;
}
export const updateMessage = async(id: string, updateData: Partial<Omit<Message, 'id'>>):Promise<Message> => {
  const {error, value: validatedData} = messageSchema.validate(updateData, {abortEarly: false, allowUnknown:true});
  if(error){
    throw new Error(error.message);
  }
  const {data, error: dbError} = await supabase
  .from('Messages')
  .update(validatedData)
  .eq('id',id)
  .select()
  .single()

  if(dbError){
    throw new Error(dbError.message);
  }
  if(!data){
    throw new Error("Failed to update message")
  }
  return data as Message;
}

export const getMessagesByLeadId = async (leadId: string): Promise<Message[]> => {
    const { data, error } = await supabase
        .from('Messages')
        .select('*')
        .eq('lead_id', leadId);

    if (error) {
        throw new Error(error.message);
    }
    return data as Message[];
};

// Added to get messages by channel and lead Id
export const getMessagesByChannelAndLeadId = async (leadId: string, channel: 'WhatsApp' | 'SMS' | 'Email'): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('Messages')
    .select('*')
    .eq('lead_id', leadId)
    .eq('channel', channel);

    if(error){
      throw new Error(error.message);
    }
    return data as Message[];
}
