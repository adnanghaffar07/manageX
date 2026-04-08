import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabase';
import type { Invoice } from '../types';
import { InvoiceList } from '../components/InvoiceList';
import { InvoiceForm } from '../components/InvoiceForm';
import { Button } from '../../../components/common/Button';
import { Plus, Loader2 } from 'lucide-react';

export const InvoiceDashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingInvoice(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingInvoice(null);
    fetchInvoices();
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center sm:flex-col sm:items-start" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="text-2xl font-bold">Invoices</h2>
          <p className="text-muted text-sm mt-2">Manage your billing and payments.</p>
        </div>
        {!isFormOpen && (
          <Button onClick={handleAddNew} className="flex items-center">
            <Plus size={16} className="mr-2" />
            New Invoice
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isFormOpen ? '2fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <InvoiceList invoices={invoices} onEdit={handleEdit} onRefresh={fetchInvoices} />
          )}
        </div>

        {isFormOpen && (
          <div>
            <InvoiceForm
              initialData={editingInvoice}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingInvoice(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
