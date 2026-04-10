import React, { useEffect, useState } from 'react';
import { getProjects } from '../api';
import type { Project } from '../types';
import { ProjectList } from '../components/ProjectList';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { Button } from '../../../components/common/Button';
import { Plus, Loader2, Briefcase } from 'lucide-react';

export const ProjectDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | undefined>(undefined);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setProjectToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchProjects();
  };

  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted text-sm mt-2">Track your work, milestones, and client project management.</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center sm:w-auto justify-center">
          <Plus size={16} className="mr-2" />
          Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">Active Projects</p>
            <p className="text-xl font-bold">{activeProjects}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
            <Loader2 size={24} className="animate-spin-slow" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">Completed</p>
            <p className="text-xl font-bold">{completedProjects}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
             <span className="text-xl font-bold">$</span>
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">Total Value</p>
            <p className="text-xl font-bold">${totalBudget.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ProjectList projects={projects} onEdit={handleEdit} onRefresh={fetchProjects} />
        )}
      </div>

      {isModalOpen && (
        <ProjectFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          projectToEdit={projectToEdit}
        />
      )}
    </div>
  );
};
