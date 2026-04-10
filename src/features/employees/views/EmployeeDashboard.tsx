import React, { useEffect, useState } from 'react';
import { getEmployees } from '../api';
import type { Employee } from '../types';
import { EmployeeList } from '../components/EmployeeList';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { Button } from '../../../components/common/Button';
import { Plus, Loader2 } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | undefined>(undefined);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEmployeeToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchEmployees();
  };

  return (
    <div className="flex flex-col gap-6 w-full px-1 sm:px-0">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted text-sm mt-2">Manage your team and staff details.</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center sm:w-auto justify-center">
          <Plus size={16} className="mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="w-full rounded-xl border bg-[var(--surface-color)] p-2 sm:p-3">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <EmployeeList employees={employees} onEdit={handleEdit} onRefresh={fetchEmployees} />
          )}
        </div>
      </div>

      {isModalOpen && (
        <EmployeeFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          employeeToEdit={employeeToEdit}
        />
      )}
    </div>
  );
};
