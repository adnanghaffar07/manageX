import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { createProject, updateProject } from '../api';
import { fetchClients } from '../../clients/api';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { X } from 'lucide-react';
import type { Project, ProjectFormData } from '../types';
import type { Client } from '../../invoices/types';

interface ProjectFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  projectToEdit?: Project;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ onClose, onSuccess, projectToEdit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: projectToEdit?.name || '',
    client_id: projectToEdit?.client_id || '',
    description: projectToEdit?.description || '',
    start_date: projectToEdit?.start_date || '',
    end_date: projectToEdit?.end_date || '',
    budget: projectToEdit?.budget?.toString() || '',
    status: projectToEdit?.status || 'todo',
    priority: projectToEdit?.priority || 'medium',
  });

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      const data = await fetchClients(user!.id);
      setClients(data);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [loading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      setError('Project name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (projectToEdit) {
        await updateProject(projectToEdit.id, formData);
      } else {
        await createProject(formData);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error saving project:', err);
      setError(err.message || 'Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-content" style={{ maxWidth: '700px', width: '100%' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{projectToEdit ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="header-icon-btn">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded text-sm bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid-2">
            <Input
              label="Project Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Website Redesign"
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Client</label>
              <select
                className="form-input"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                required
              >
                <option value="">Choose a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company_name ? `(${client.company_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <Input
              label="End Date / Deadline"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <Input
              label="Budget"
              type="number"
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="0.00"
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                className="form-input"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="form-input"
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Project requirements and notes..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {projectToEdit ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
