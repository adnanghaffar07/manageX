import React, { useEffect, useState } from 'react';
import { getSalaryStubs } from '../api';
import type { SalaryStub } from '../types';
import { SalaryStubList } from '../components/SalaryStubList';
import { SalaryStubFormModal } from '../components/SalaryStubFormModal';
import { SalarySlipModal } from '../components/SalarySlipModal';
import { Button } from '../../../components/common/Button';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export const SalaryStubDashboard: React.FC = () => {
  const [stubs, setStubs] = useState<SalaryStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [stubToEdit, setStubToEdit] = useState<SalaryStub | undefined>(undefined);
  const [stubToView, setStubToView] = useState<SalaryStub | undefined>(undefined);

  const fetchStubs = async () => {
    setLoading(true);
    try {
      const data = await getSalaryStubs();
      setStubs(data);
    } catch (error) {
      console.error('Error fetching salary stubs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStubs();
  }, []);

  const handleEdit = (stub: SalaryStub) => {
    setStubToEdit(stub);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setStubToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleViewSlip = (stub: SalaryStub) => {
    setStubToView(stub);
    setIsSlipModalOpen(true);
  };

  const { addToast } = useToast();

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    addToast('Salary stub saved successfully', 'success');
    fetchStubs();
  };

  return (
    <div className="flex flex-col gap-6 w-full px-1 sm:px-0">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Salary Stubs</h2>
          <p className="text-muted text-sm mt-2">Manage and generate pay stubs for your employees.</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center sm:w-auto justify-center">
          <Plus size={16} className="mr-2" />
          Create Stub
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="w-full rounded-xl border bg-[var(--surface-color)] p-2 sm:p-3">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <SalaryStubList 
              stubs={stubs} 
              onEdit={handleEdit} 
              onView={handleViewSlip}
              onRefresh={fetchStubs} 
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <SalaryStubFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          stubToEdit={stubToEdit}
        />
      )}

      {isSlipModalOpen && stubToView && (
        <SalarySlipModal
          stub={stubToView}
          onClose={() => setIsSlipModalOpen(false)}
        />
      )}
    </div>
  );
};
