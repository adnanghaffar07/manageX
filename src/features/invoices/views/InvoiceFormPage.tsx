import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvoiceForm } from '../components/InvoiceForm';
import { supabase } from '../../../config/supabase';
import type { Invoice } from '../types';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const InvoiceFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
    }
  }, [id]);

  const fetchInvoice = async (invoiceId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(name, email)')
        .eq('id', invoiceId)
        .single();
        
      if (error) throw error;
      setInvoice(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      alert('Failed to load invoice.');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate('/invoices');
  };

  const handleCancel = () => {
    navigate('/invoices');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-24 w-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="w-full min-h-[calc(100vh-6rem)] px-3 sm:px-5 lg:px-8 py-4 sm:py-6">
      <div className="mx-auto w-full max-w-6xl rounded-2xl border bg-[var(--surface-color)] shadow-sm p-4 sm:p-6 lg:p-8">
      <button
        onClick={handleCancel}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors invoice-btn"
      >
        <ArrowLeft size={16} /> Back to Invoice
      </button>

      <InvoiceForm 
        initialData={invoice} 
        onSuccess={handleSuccess} 
        onCancel={handleCancel} 
      />
      </div>
    </section>
  );
};
