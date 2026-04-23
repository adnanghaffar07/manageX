import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { createSalaryStub, updateSalaryStub } from '../api';
import { getEmployees } from '../../employees/api';
import type { Employee } from '../../employees/types';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { X, Loader2 } from 'lucide-react';
import type { SalaryStub, SalaryStubFormData } from '../types';

interface SalaryStubFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  stubToEdit?: SalaryStub;
}

export const SalaryStubFormModal: React.FC<SalaryStubFormModalProps> = ({ onClose, onSuccess, stubToEdit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SalaryStubFormData>({
    employee_id: stubToEdit?.employee_id || '',
    month: stubToEdit?.month || '',
    basic_salary: stubToEdit?.basic_salary?.toString() || '',
    allowances: stubToEdit?.allowances?.toString() || '0',
    deductions: stubToEdit?.deductions?.toString() || '0',
    worked_days: stubToEdit?.worked_days?.toString() || '30',
    total_days: stubToEdit?.total_days?.toString() || '30',
    paid_on: stubToEdit?.paid_on || '',
  });

  useEffect(() => {
    const fetchEmps = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (err) {
        console.error('Failed to fetch employees', err);
      } finally {
        setFetchingEmployees(false);
      }
    };
    fetchEmps();
  }, []);

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

    if (!formData.employee_id) {
      setError('Please select an employee.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (stubToEdit) {
        await updateSalaryStub(stubToEdit.id, formData);
      } else {
        await createSalaryStub(formData);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error saving salary stub:', err);
      setError(err.message || 'Failed to save salary stub.');
    } finally {
      setLoading(false);
    }
  };

  const basic = parseFloat(formData.basic_salary) || 0;
  const totalDays = parseInt(formData.total_days) || 30;
  const workedDays = parseInt(formData.worked_days) || 0;
  const proratedBasic = (basic / totalDays) * workedDays;

  const calculatedNet = 
    proratedBasic + 
    (parseFloat(formData.allowances) || 0) - 
    (parseFloat(formData.deductions) || 0);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal-content" style={{ maxWidth: '600px', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 className="text-xl font-bold">{stubToEdit ? 'Edit Salary Stub' : 'New Salary Stub'}</h2>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: '4px', background: 'transparent',
              border: 'none', cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{
            backgroundColor: 'rgba(var(--destructive), 0.1)',
            color: 'rgb(var(--destructive))',
            border: '1px solid rgba(var(--destructive), 0.2)',
          }}>
            {error}
          </div>
        )}

        {fetchingEmployees ? (
           <div className="flex justify-center p-6"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-sm font-medium">Employee *</label>
              <select
                className="form-input"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                style={{ height: '40px' }}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name || (emp as any).name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="Month (e.g. 2025-01) *"
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                required
              />
              <Input
                label="Paid On Date"
                type="date"
                value={formData.paid_on}
                onChange={(e) => setFormData({ ...formData, paid_on: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="Basic Salary *"
                type="number"
                step="0.01"
                value={formData.basic_salary}
                onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                required
              />
              <Input
                label="Allowances"
                type="number"
                step="0.01"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="Deductions"
                type="number"
                step="0.01"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
              />
              <Input
                label="Days Worked *"
                type="number"
                value={formData.worked_days}
                onChange={(e) => setFormData({ ...formData, worked_days: e.target.value })}
                required
              />
              <Input
                label="Total Days (Base) *"
                type="number"
                value={formData.total_days}
                onChange={(e) => setFormData({ ...formData, total_days: e.target.value })}
                required
              />
            </div>

            <div className="p-4 rounded-lg bg-[var(--background)] border mt-2 flex justify-between items-center">
              <span className="font-medium">Calculated Net Pay:</span>
              <span className="text-xl font-bold text-success">${calculatedNet.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                 ✓ {stubToEdit ? 'Update Stub' : 'Save Stub'}
              </Button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
