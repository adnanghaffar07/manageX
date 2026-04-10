export interface Employee {
  id: string; // uuid
  user_id: string; // references profiles(id)
  full_name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  job_title: string | null;
  salary: number | null;
  joining_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormData {
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  job_title: string;
  salary: string;
  joining_date: string;
  status: string;
}
