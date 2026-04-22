import { supabase } from '../../config/supabase';
import type { SalaryStub, SalaryStubFormData } from './types';

export const getSalaryStubs = async (): Promise<SalaryStub[]> => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('salary_stubs')
    .select('*, employees!inner(*)') // Inner join to only get stubs for the user's employees
    .eq('employees.user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching salary stubs:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const createSalaryStub = async (stubData: SalaryStubFormData): Promise<SalaryStub> => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error('User not authenticated');

  const basic_salary = parseFloat(stubData.basic_salary) || 0;
  const allowances = parseFloat(stubData.allowances) || 0;
  const deductions = parseFloat(stubData.deductions) || 0;
  const net_salary = basic_salary + allowances - deductions;

  const payload = {
    employee_id: stubData.employee_id,
    month: stubData.month,
    basic_salary,
    allowances,
    deductions,
    net_salary,
    paid_on: stubData.paid_on || null,
  };

  const { data, error } = await supabase
    .from('salary_stubs')
    .insert([payload])
    .select('*, employees(*)')
    .single();

  if (error) {
    console.error('Error creating salary stub:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateSalaryStub = async (id: string, stubData: SalaryStubFormData): Promise<SalaryStub> => {
  const basic_salary = parseFloat(stubData.basic_salary) || 0;
  const allowances = parseFloat(stubData.allowances) || 0;
  const deductions = parseFloat(stubData.deductions) || 0;
  const net_salary = basic_salary + allowances - deductions;

  const payload = {
    employee_id: stubData.employee_id,
    month: stubData.month,
    basic_salary,
    allowances,
    deductions,
    net_salary,
    paid_on: stubData.paid_on || null,
  };

  const { data, error } = await supabase
    .from('salary_stubs')
    .update(payload)
    .eq('id', id)
    .select('*, employees(*)')
    .single();

  if (error) {
    console.error('Error updating salary stub:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteSalaryStub = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('salary_stubs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting salary stub:', error);
    throw new Error(error.message);
  }
};
