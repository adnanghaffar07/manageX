import React from 'react';
import type { Invoice } from '../types';
import { Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../config/supabase';

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onRefresh: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onEdit, onRefresh }) => {
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice');
    }
  };

  const statusColors = {
    draft: 'badge-secondary',
    sent: 'badge-secondary',
    paid: 'badge-success',
    overdue: 'badge-warning',
  };

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 card" style={{ borderStyle: 'dashed' }}>
        <p className="text-muted">No invoices found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
      <table>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Client</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="font-medium">{invoice.invoice_number}</td>
              <td>{invoice.clients?.name || 'Unknown Client'}</td>
              <td className="text-muted">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </td>
              <td className="text-muted">
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
              </td>
              <td className="font-semibold text-primary">
                ${(invoice.total || 0).toFixed(2)}
              </td>
              <td>
                <span className={`badge ${statusColors[invoice.status] || 'badge-secondary'}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </td>
              <td className="flex justify-end gap-2">
                <button
                  onClick={() => onEdit(invoice)}
                  className="header-icon-btn"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(invoice.id)}
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
