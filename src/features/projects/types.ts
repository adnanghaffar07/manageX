export interface Project {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  status: 'todo' | 'in_progress' | 'on_hold' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  
  // Virtual field for join operations
  clients?: {
    name: string;
    company_name: string | null;
  };
}

export interface ProjectFormData {
  name: string;
  client_id: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: string;
  status: 'todo' | 'in_progress' | 'on_hold' | 'completed';
  priority: 'low' | 'medium' | 'high';
}
