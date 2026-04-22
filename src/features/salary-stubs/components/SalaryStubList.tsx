import React from 'react';
import type { SalaryStub } from '../types';
import { Edit2, Trash2 } from 'lucide-react';
import { deleteSalaryStub } from '../api';

interface SalaryStubListProps {
  stubs: SalaryStub[];
  onEdit: (stub: SalaryStub) => void;
  onRefresh: () => void;
}

export const SalaryStubList: React.FC<SalaryStubListProps> = ({ stubs, onEdit, onRefresh }) => {
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this salary stub?')) return;
    try {
      await deleteSalaryStub(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting salary stub:', error);
      alert('Failed to delete salary stub');
    }
  };

  if (stubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 card" style={{ borderStyle: 'dashed' }}>
        <p className="text-muted">No salary stubs found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Month</th>
            <th>Paid On</th>
            <th>Basic Salary</th>
            <th>Allowances</th>
            <th>Deductions</th>
            <th>Net Pay</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stubs.map((stub) => (
            <tr key={stub.id}>
              <td className="font-medium">
                {stub.employees?.name || stub.employees?.full_name || 'Unknown'}
              </td>
              <td className="text-muted">{stub.month}</td>
              <td className="text-muted">
                {stub.paid_on ? new Date(stub.paid_on).toLocaleDateString() : '-'}
              </td>
              <td className="font-semibold text-primary">
                ${stub.basic_salary ? Number(stub.basic_salary).toFixed(2) : '0.00'}
              </td>
              <td className="font-semibold text-success">
                ${stub.allowances ? Number(stub.allowances).toFixed(2) : '0.00'}
              </td>
              <td className="font-semibold text-destructive">
                ${stub.deductions ? Number(stub.deductions).toFixed(2) : '0.00'}
              </td>
              <td className="font-semibold text-success">
                ${stub.net_salary ? Number(stub.net_salary).toFixed(2) : '0.00'}
              </td>
              <td className="flex justify-end gap-2">
                <button
                  onClick={() => onEdit(stub)}
                  className="header-icon-btn"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(stub.id)}
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
