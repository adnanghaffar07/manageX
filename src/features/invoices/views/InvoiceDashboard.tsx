import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabase';
import type { Invoice } from '../types';
import { InvoiceList } from '../components/InvoiceList';
import { Button } from '../../../components/common/Button';
import { Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InvoiceDashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    navigate(`/invoices/${invoice.id}/edit`);
  };

  const handleAddNew = () => {
    navigate('/invoices/new');
  };

  return (
    <div className="flex flex-col gap-6 w-full px-1 sm:px-0">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted text-sm mt-2">Manage your billing, client payments, and invoices in one place.</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center sm:w-auto justify-center">
          <Plus size={16} className="mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="w-full rounded-xl border bg-[var(--surface-color)] p-2 sm:p-3">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <InvoiceList invoices={invoices} onEdit={handleEdit} onRefresh={fetchInvoices} />
          )}
        </div>
      </div>
    </div>
  );
};
