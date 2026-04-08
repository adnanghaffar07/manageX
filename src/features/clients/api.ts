import { supabase } from '../../config/supabase';
import type { Client } from '../invoices/types'; // Borrowing the type

export const fetchClients = async (userId: string): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  return data as Client[];
};

export const createClient = async (
  userId: string,
  clientData: Omit<Client, 'id' | 'created_at' | 'user_id'>
): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...clientData, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }

  return data as Client;
};
