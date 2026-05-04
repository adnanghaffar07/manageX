import React, { useEffect, useState } from 'react';
import { getProjects } from '../api';
import type { Project } from '../types';
import { ProjectList } from '../components/ProjectList';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { Button } from '../../../components/common/Button';
import { Plus, Loader2, Briefcase, CheckCircle } from 'lucide-react';

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
  // const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);

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

      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <div className="stat-card primary">
          <div className="stat-icon-wrapper primary hidden sm:flex">
            <Briefcase size={28} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted font-medium mb-1">Total Projects</p>
            <p className="text-xl sm:text-3xl font-bold tracking-tight">{projects.length}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon-wrapper warning hidden sm:flex">
            <Loader2 size={28} className="animate-spin-slow" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted font-medium mb-1">Active Projects</p>
            <p className="text-xl sm:text-3xl font-bold tracking-tight">{activeProjects}</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon-wrapper success hidden sm:flex">
             <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted font-medium mb-1">Completed Projects</p>
            <p className="text-xl sm:text-3xl font-bold tracking-tight">{completedProjects}</p>
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
