export interface Profile {
  id: string; // references auth.users
  full_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Client {
  id: string; // uuid
  user_id: string; // references profiles(id)
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  email: string | null;
  phone: string | null;
  address?: string | null; // Kept for backwards compatibility
  custom_fields?: Record<string, string> | null; // Kept for backwards compatibility
  country?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  website?: string | null;
  invoice_currency?: string | null;
  additional_info?: string | null;
  created_at: string;
}

export interface Sender {
  id: string; // uuid
  user_id: string; // references profiles(id)
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company_name: string | null;
  website: string | null;
  created_at: string;
}

export interface Invoice {
  id: string; // uuid
  user_id: string; // references profiles(id)
  client_id: string; // references clients(id)
  sender_id?: string | null; // references senders(id)
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_rate: number;
  total: number;
  notes: string | null;
  bank_details: string | null;
  logo_url: string | null;
  created_at: string;
  
  // Virtual field for join operations
  clients?: {
    name: string;
    email: string | null;
  };
}

export interface InvoiceItem {
  id: string; // uuid
  invoice_id: string; // references invoices(id)
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}
