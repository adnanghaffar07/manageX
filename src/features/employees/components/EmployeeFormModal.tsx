import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { createEmployee, updateEmployee } from '../api';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { X } from 'lucide-react';
import type { Employee, EmployeeFormData } from '../types';

interface EmployeeFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  employeeToEdit?: Employee;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ onClose, onSuccess, employeeToEdit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EmployeeFormData>({
    full_name: employeeToEdit?.full_name || '',
    email: employeeToEdit?.email || '',
    phone_number: employeeToEdit?.phone_number || '',
    address: employeeToEdit?.address || '',
    city: employeeToEdit?.city || '',
    postal_code: employeeToEdit?.postal_code || '',
    country: employeeToEdit?.country || '',
    job_title: employeeToEdit?.job_title || '',
    salary: employeeToEdit?.salary?.toString() || '',
    joining_date: employeeToEdit?.joining_date || '',
    status: employeeToEdit?.status || 'active',
  });

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

    if (!formData.full_name.trim()) {
      setError('Full name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (employeeToEdit) {
        await updateEmployee(employeeToEdit.id, formData);
      } else {
        await createEmployee(formData);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error saving employee:', err);
      setError(err.message || 'Failed to save employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal-content" style={{ maxWidth: '860px', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 className="text-xl font-bold">{employeeToEdit ? 'Edit Employee' : 'New Employee'}</h2>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Full Name *"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
            <Input
              label="Job Title"
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Salary *"
              type="number"
              step="0.01"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              required
            />
            <Input
              label="Joining Date *"
              type="date"
              value={formData.joining_date}
              onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Postal Code"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
             <label className="text-sm font-medium">Status</label>
             <select
               className="form-input"
               value={formData.status}
               onChange={(e) => setFormData({ ...formData, status: e.target.value })}
               style={{ height: '40px' }}
             >
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
               <option value="on_leave">On Leave</option>
               <option value="terminated">Terminated</option>
             </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
               ✓ {employeeToEdit ? 'Update Employee' : 'Save Employee'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
