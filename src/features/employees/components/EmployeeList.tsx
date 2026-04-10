import React from 'react';
import type { Employee } from '../types';
import { Edit2, Trash2 } from 'lucide-react';
import { deleteEmployee } from '../api';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onRefresh: () => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEdit, onRefresh }) => {
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await deleteEmployee(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const statusColors: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-secondary',
    on_leave: 'badge-warning',
    terminated: 'badge-destructive',
  };

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 card" style={{ borderStyle: 'dashed' }}>
        <p className="text-muted">No employees found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Job Title</th>
            <th>Salary</th>
            <th>Joining Date</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="font-medium">{employee.full_name}</td>
              <td className="text-muted">{employee.email || '-'}</td>
              <td>{employee.job_title || '-'}</td>
              <td className="font-semibold text-primary">
                {employee.salary ? `$${employee.salary.toFixed(2)}` : '-'}
              </td>
              <td className="text-muted">
                {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : '-'}
              </td>
              <td>
                <span className={`badge ${statusColors[employee.status] || 'badge-secondary'}`}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1).replace('_', ' ')}
                </span>
              </td>
              <td className="flex justify-end gap-2">
                <button
                  onClick={() => onEdit(employee)}
                  className="header-icon-btn"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="header-icon-btn text-destructive"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
