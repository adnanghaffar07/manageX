import { supabase } from '../../config/supabase';
import type { Employee, EmployeeFormData } from './types';

export const getEmployees = async (): Promise<Employee[]> => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const createEmployee = async (employeeData: EmployeeFormData): Promise<Employee> => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error('User not authenticated');

  const payload = {
    user_id: userData.user.id,
    full_name: employeeData.full_name,
    email: employeeData.email || null,
    phone_number: employeeData.phone_number || null,
    address: employeeData.address || null,
    city: employeeData.city || null,
    postal_code: employeeData.postal_code || null,
    country: employeeData.country || null,
    job_title: employeeData.job_title || null,
    salary: employeeData.salary ? parseFloat(employeeData.salary) : null,
    joining_date: employeeData.joining_date || null,
    status: employeeData.status || 'active',
  };

  const { data, error } = await supabase
    .from('employees')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error creating employee:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateEmployee = async (id: string, employeeData: EmployeeFormData): Promise<Employee> => {
  const payload = {
    full_name: employeeData.full_name,
    email: employeeData.email || null,
    phone_number: employeeData.phone_number || null,
    address: employeeData.address || null,
    city: employeeData.city || null,
    postal_code: employeeData.postal_code || null,
    country: employeeData.country || null,
    job_title: employeeData.job_title || null,
    salary: employeeData.salary ? parseFloat(employeeData.salary) : null,
    joining_date: employeeData.joining_date || null,
    status: employeeData.status || 'active',
  };

  const { data, error } = await supabase
    .from('employees')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating employee:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting employee:', error);
    throw new Error(error.message);
  }
};
