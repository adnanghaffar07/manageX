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
        <Loader2 className="animate-spin text-primary" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col p-4" style={{ minHeight: 'calc(100vh - 6rem)' }}>
      <button
        onClick={handleCancel}
        className="mb-6 btn btn-secondary flex items-center justify-center gap-2 rounded-full"
        style={{ alignSelf: 'flex-start', width: 'auto' }}
      >
        <ArrowLeft size={16} /> Back to Invoices
      </button>

      <div className="w-full mx-auto flex-1" style={{ maxWidth: '1400px' }}>
        <InvoiceForm 
          initialData={invoice} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </div>
    </section>
  );
};
