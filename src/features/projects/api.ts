import { supabase } from '../../config/supabase';
import type { Project, ProjectFormData } from './types';

export const getProjects = async (): Promise<Project[]> => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name, company_name)')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const createProject = async (projectData: ProjectFormData): Promise<Project> => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error('User not authenticated');

  const payload = {
    user_id: userData.user.id,
    client_id: projectData.client_id || null,
    name: projectData.name,
    description: projectData.description || null,
    start_date: projectData.start_date || null,
    end_date: projectData.end_date || null,
    budget: projectData.budget ? parseFloat(projectData.budget) : 0,
    status: projectData.status || 'todo',
    priority: projectData.priority || 'medium',
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([payload])
    .select('*, clients(name, company_name)')
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateProject = async (id: string, projectData: ProjectFormData): Promise<Project> => {
  const payload = {
    client_id: projectData.client_id || null,
    name: projectData.name,
    description: projectData.description || null,
    start_date: projectData.start_date || null,
    end_date: projectData.end_date || null,
    budget: projectData.budget ? parseFloat(projectData.budget) : 0,
    status: projectData.status,
    priority: projectData.priority,
  };

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select('*, clients(name, company_name)')
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteProject = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    throw new Error(error.message);
  }
};
