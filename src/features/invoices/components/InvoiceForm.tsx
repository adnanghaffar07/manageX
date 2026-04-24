import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../config/supabase';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import type { Invoice, Client, InvoiceItem, Profile } from '../types';
import { fetchClients } from '../../clients/api';
import { Plus, Trash2, Download, Mail, CreditCard, Check, Image as ImageIcon, Upload } from 'lucide-react';
import { ClientFormModal } from '../../clients/components/ClientFormModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '../../../context/ToastContext';

interface InvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Invoice | null;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [isAddingClient, setIsAddingClient] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: initialData?.client_id || '',
    invoice_number: initialData?.invoice_number || `INV-${Math.floor(Math.random() * 100000)}`,
    issue_date: initialData?.issue_date || new Date().toISOString().split('T')[0],
    due_date: initialData?.due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: initialData?.status || 'draft',
    tax_rate: initialData?.tax_rate || 0,
    notes: initialData?.notes || 'Service per current month',
    bank_details: initialData?.bank_details || '',
    logo_url: initialData?.logo_url || '',
  });

  const [profile, setProfile] = useState<Profile | null>(null);

  const [items, setItems] = useState<Partial<InvoiceItem>[]>([]);

  useEffect(() => {
    if (user) {
      loadClients();
      loadProfile();
      if (initialData?.id) {
        loadInvoiceItems(initialData.id);
      } else {
        setItems([{ description: '', quantity: 1, unit_price: 0, amount: 0 }]);
      }
    }
  }, [user, initialData]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  const loadClients = async () => {
    if (!user) return;
    try {
      const data = await fetchClients(user.id);
      setClients(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadInvoiceItems = async (invoiceId: string) => {
    const { data } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId);
    if (data) setItems(data);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    item[field] = value as never;
    if (field === 'quantity' || field === 'unit_price') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.amount || 0), 0), [items]);
  const taxAmount = useMemo(() => subtotal * (Number(formData.tax_rate) / 100), [subtotal, formData.tax_rate]);
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const selectedClient = useMemo(() => clients.find(c => c.id === formData.client_id), [clients, formData.client_id]);
  const currency = selectedClient?.invoice_currency || 'USD';

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    
    if (!formData.client_id) return addToast('Please select a client.', 'error');
    const validItems = items.filter(i => i.description?.trim() !== '');
    if (validItems.length === 0) return addToast('At least one valid item is required.', 'error');

    setLoading(true);

    const invoicePayload = {
      user_id: user.id,
      client_id: formData.client_id,
      invoice_number: formData.invoice_number,
      status: formData.status,
      issue_date: formData.issue_date,
      due_date: formData.due_date || null,
      subtotal,
      tax_rate: Number(formData.tax_rate),
      total,
      notes: formData.notes,
      bank_details: formData.bank_details,
      logo_url: formData.logo_url
    };

    try {
      let createdInvoiceId = initialData?.id;

      if (createdInvoiceId) {
        const { error } = await supabase.from('invoices').update(invoicePayload).eq('id', createdInvoiceId);
        if (error) throw error;
        await supabase.from('invoice_items').delete().eq('invoice_id', createdInvoiceId);
      } else {
        const { data, error } = await supabase.from('invoices').insert([invoicePayload]).select().single();
        if (error) throw error;
        createdInvoiceId = data.id;
      }

      const itemsPayload = validItems.map(item => ({
        invoice_id: createdInvoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount
      }));

      if (itemsPayload.length > 0) {
        const { error: itemsError } = await supabase.from('invoice_items').insert(itemsPayload);
        if (itemsError) throw itemsError;
      }
      
      addToast('Invoice saved successfully!', 'success');
      onSuccess();
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      addToast('Failed to save invoice.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      setFormData({ ...formData, logo_url: publicUrl });
      addToast('Logo uploaded successfully', 'success');
    } catch (error) {
      console.error('Logo upload error:', error);
      addToast('Failed to upload logo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice-preview-capture');
    if (!element) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${formData.invoice_number}.pdf`);
      addToast('PDF downloaded successfully', 'success');
    } catch (error) {
      console.error('Failed to generate PDF', error);
      addToast('Failed to generate PDF', 'error');
    }
  };

  return (
    <>
      {isAddingClient && (
        <ClientFormModal
          onClose={() => setIsAddingClient(false)}
          onSuccess={(newClient) => {
            setClients([newClient, ...clients]);
            setFormData({ ...formData, client_id: newClient.id });
            setIsAddingClient(false);
            addToast('Client created', 'success');
          }}
        />
      )}

      {/* Strict 2-column flex layout for responsive screens, wraps on mobile */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        
        {/* LEFT PANE: FORM */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Invoice Details</h2>
              <div className="relative">
                <input
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <label 
                  htmlFor="logo-upload" 
                  className="btn btn-outline btn-sm gap-2 h-9 text-xs rounded-full cursor-pointer"
                >
                  <Upload size={14} /> Choose Logo
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium">Client <span className="text-destructive">*</span></label>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingClient(true)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    + Add New
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="form-input appearance-none cursor-pointer pr-10"
                    required
                  >
                    <option value="" disabled>Select a client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {/* <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    <Plus size={16} />
                  </div> */}
                </div>
              </div>

              <Input
                label="Subject"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Service per June 2023"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Due date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
                <Input
                  label="Issue date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium">Bank Details</label>
                <textarea
                  value={formData.bank_details}
                  onChange={(e) => setFormData({ ...formData, bank_details: e.target.value })}
                  placeholder="Bank name: Meezan&#10;Account Number: 0123456789"
                  className="form-input min-h-[100px] py-2"
                  style={{ height: 'auto' }}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Product</h2>
            <div className="flex flex-col gap-2">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 40px', gap: '0.5rem', padding: '0 0.5rem' }} className="text-sm font-medium text-muted">
                <div>Item</div>
                <div>Qty</div>
                <div>Price</div>
                <div></div>
              </div>

              {items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 40px', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="form-input"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="form-input text-center"
                    required
                  />
                  <div className="relative">
                    {/* <span 
                      className="absolute text-muted text-xs" 
                      style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                    >
                      {currency === 'USD' ? '$' : currency}
                    </span> */}
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '1.5rem' }}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="header-icon-btn text-destructive mx-auto w-8 h-8 flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                // size="sm"
                onClick={addItem}
                className="gap-2 mt-2 w-fit border-dashed"
              >
                <Plus size={16} /> Add New Line
              </Button>

              <div className="mt-6 pt-6 border-t flex flex-col gap-3">
                <div className="flex justify-between w-full text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span>{currency} {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full items-center text-sm">
                  <span className="text-muted">Tax Rate (%)</span>
                  <div style={{ width: '80px' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.tax_rate}
                      onChange={e => setFormData({...formData, tax_rate: Number(e.target.value) || 0})}
                      className="w-full bg-transparent border rounded p-1 text-sm outline-none focus:border-primary text-right"
                      style={{ color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
                <div className="flex justify-between w-full font-medium text-lg pt-2 border-t">
                  <span>Total Amount</span>
                  <span className="text-primary">{currency} {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 flex items-center justify-between">
            <span className="text-xs text-muted">Last saved: Just now</span>
            <div className="flex items-center gap-4">
              <button type="button" onClick={onCancel} className="font-semibold text-sm hover:underline">
                Cancel
              </button>
              <Button type="button" onClick={handleSubmit} isLoading={loading} className="rounded-full px-6 bg-foreground text-background font-medium">
                Processing Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: PREVIEW */}
        <div className="invoice-preview-pane">
          <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'nowrap' }}>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">Preview</h3>
              {/* <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] text-background">i</div> */}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="bg-card h-9 text-sm gap-2 font-semibold shadow-sm" onClick={handleDownloadPDF}>
                <Download size={16} /> PDF
              </Button>
              <Button variant="ghost" className="h-9 text-sm gap-2 text-muted hover:text-foreground">
                <Mail size={16} /> Email
              </Button>
              <Button variant="ghost" className="h-9 text-sm gap-2 text-muted hover:text-foreground">
                <CreditCard size={16} /> Payment page
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full pb-10 flex justify-center" style={{ overflowX: 'auto' }}>
            <div 
              id="invoice-preview-capture" 
              className="card shadow-md flex flex-col"
              style={{ width: '100%', maxWidth: '800px', minHeight: '1056px', aspectRatio: '1/1.414', fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff', color: '#0f172a', padding: '3rem' }}
            >
              {/* Header section with Logo and Invoice Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                <div style={{ width: '240px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                   {formData.logo_url ? (
                     <img 
                       src={formData.logo_url} 
                       alt="Logo" 
                       style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                     />
                   ) : (
                     <div style={{ width: '100%', height: '100%', border: '2px dashed #e2e8f0', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '0.75rem' }}>
                       <ImageIcon size={24} />
                       <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Logo placeholder</span>
                     </div>
                   )}
                </div>
                
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Invoice</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formData.invoice_number}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Issue date</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formData.issue_date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Due date</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formData.due_date}</span>
                  </div>
                </div>
              </div>

              {/* From and To sections */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>From</p>
                  <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem' }}>{profile?.full_name || profile?.company_name || user?.email?.split('@')[0] || 'Sender Name'}</p>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{user?.email}</p>
                </div>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>To</p>
                  <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem' }}>{selectedClient?.name || 'Recipient name'}</p>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{selectedClient?.email || 'Recipient contact details'}</p>
                </div>
              </div>

              {/* Bank Details section */}
              {formData.bank_details && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '3rem', backgroundColor: '#f8fafc' }}>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Bank Details</p>
                  <div style={{ color: '#475569', fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {formData.bank_details}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <div>Description</div>
                  <div style={{ textAlign: 'center' }}>Qty</div>
                  <div style={{ textAlign: 'right' }}>Unit Price</div>
                  <div style={{ textAlign: 'right' }}>Amount</div>
                </div>

                {items.filter(i => i.description).map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '0.25rem', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} style={{ color: '#94a3b8' }} />
                      </div>
                      {item.description}
                    </div>
                    <div style={{ textAlign: 'center' }}>{item.quantity}</div>
                    <div style={{ textAlign: 'right' }}>{(Number(item.unit_price) || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}</div>
                    <div style={{ textAlign: 'right' }}>{(Number(item.amount) || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', fontSize: '0.875rem', marginBottom: '4rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#475569' }}>
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}</span>
                  </div>
                  {formData.tax_rate > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#475569' }}>
                      <span>Tax {formData.tax_rate}%</span>
                      <span>{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', color: '#0f172a' }}>
                    <span>Total</span>
                    <span>{total.toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '0.25rem', color: '#0f172a' }}>
                    <span>Amount due</span>
                    <span>{total.toLocaleString(undefined, {minimumFractionDigits: 2})} {currency}</span>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </>
  );
};
