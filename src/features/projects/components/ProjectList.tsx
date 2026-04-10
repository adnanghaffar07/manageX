import React from 'react';
import type { Project } from '../types';
import { Edit2, Trash2, Calendar, DollarSign, Clock } from 'lucide-react';
import { deleteProject } from '../api';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onRefresh: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onEdit, onRefresh }) => {
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const statusColors: Record<string, string> = {
    todo: 'badge-secondary',
    in_progress: 'badge-warning',
    on_hold: 'badge-secondary',
    completed: 'badge-success',
  };

  const priorityColors: Record<string, string> = {
    low: 'text-muted',
    medium: 'text-primary',
    high: 'text-destructive',
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 card" style={{ borderStyle: 'dashed' }}>
        <p className="text-muted">No projects found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="card hover:shadow-md transition-shadow flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <span className={`badge ${statusColors[project.status]} mb-2`}>
                {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
              </span>
              <h3 className="text-lg font-bold leading-tight">{project.name}</h3>
              <p className="text-sm text-muted mt-1">{project.clients?.company_name || project.clients?.name || 'Unknown Client'}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => onEdit(project)} className="header-icon-btn" title="Edit">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(project.id)} className="header-icon-btn text-destructive" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <p className="text-sm text-muted line-clamp-3 flex-1">
            {project.description || 'No description provided.'}
          </p>

          <div className="pt-4 border-t grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Calendar size={14} />
              <span>{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No deadline'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary justify-end">
              <DollarSign size={14} />
              <span>{project.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Clock size={14} />
              <span className={`font-medium ${priorityColors[project.priority]}`}>
                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
