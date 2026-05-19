import { supabase } from '../../config/supabase';
import type { Sender } from '../invoices/types';

export async function fetchSenders(userId: string) {
  const { data, error } = await supabase
    .from('senders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching senders:', error);
    throw error;
  }

  return data as Sender[];
}

export async function createSender(senderData: Partial<Sender>) {
  const { data, error } = await supabase
    .from('senders')
    .insert([senderData])
    .select()
    .single();

  if (error) {
    console.error('Error creating sender:', error);
    throw error;
  }

  return data as Sender;
}
