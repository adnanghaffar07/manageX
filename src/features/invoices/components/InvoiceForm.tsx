import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../config/supabase';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import type { Invoice, Client, InvoiceItem } from '../types';
import { fetchClients, createClient } from '../../clients/api';
import { Plus, Trash2 } from 'lucide-react';

interface InvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Invoice | null;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Create quick client state
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    client_id: initialData?.client_id || '',
    invoice_number: initialData?.invoice_number || `INV-${Math.floor(Math.random() * 100000)}`,
    issue_date: initialData?.issue_date || new Date().toISOString().split('T')[0],
    due_date: initialData?.due_date || '',
    status: initialData?.status || 'draft',
    tax_rate: initialData?.tax_rate || 0,
    notes: initialData?.notes || '',
  });

  const [items, setItems] = useState<Partial<InvoiceItem>[]>([]);

  useEffect(() => {
    if (user) {
      loadClients();
      if (initialData?.id) {
        loadInvoiceItems(initialData.id);
      } else {
        setItems([{ description: '', quantity: 1, unit_price: 0, amount: 0 }]);
      }
    }
  }, [user, initialData]);

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

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newClientName.trim()) return;
    try {
      setLoading(true);
      const newClient = await createClient(user.id, {
        name: newClientName,
        email: null,
        phone: null,
        address: null
      });
      setClients([newClient, ...clients]);
      setFormData({ ...formData, client_id: newClient.id });
      setIsAddingClient(false);
      setNewClientName('');
    } catch (e) {
      alert('Failed to quickly add client.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
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
  const total = useMemo(() => subtotal + (subtotal * (Number(formData.tax_rate) / 100)), [subtotal, formData.tax_rate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Basic validation
    if (!formData.client_id) return alert('Please select a client.');
    const validItems = items.filter(i => i.description?.trim() !== '');
    if (validItems.length === 0) return alert('At least one valid item is required.');

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
      notes: formData.notes
    };

    try {
      let createdInvoiceId = initialData?.id;

      if (createdInvoiceId) {
        // Update existing invoice
        const { error } = await supabase.from('invoices').update(invoicePayload).eq('id', createdInvoiceId);
        if (error) throw error;
        // Naive update method for items: Wipe and recreate.
        await supabase.from('invoice_items').delete().eq('invoice_id', createdInvoiceId);
      } else {
        // Insert new invoice
        const { data, error } = await supabase.from('invoices').insert([invoicePayload]).select().single();
        if (error) throw error;
        createdInvoiceId = data.id;
      }

      // Insert all valid items attached to this invoice
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

      onSuccess();
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice details. ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-full" style={{ overflowY: 'auto', maxHeight: '85vh' }}>
      <h3 className="text-xl font-semibold mb-6">
        {initialData ? 'Edit Invoice' : 'Create New Invoice'}
      </h3>
      
      {isAddingClient ? (
        <form onSubmit={handleAddClient} className="mb-6 p-4 rounded-lg space-y-3" style={{ border: '1px solid rgba(var(--primary), 0.3)', backgroundColor: 'rgba(var(--primary), 0.05)' }}>
          <Input 
            label="Fast Client Setup (Name only)" 
            value={newClientName} 
            onChange={e => setNewClientName(e.target.value)} 
            required 
            placeholder="E.g. Acme Corp..."
          />
          <div className="flex gap-2" style={{marginTop: '17px'}}>
            <Button type="submit" isLoading={loading} className="text-xs h-8">Save Client</Button>
            <Button type="button" variant="ghost" onClick={() => setIsAddingClient(false)} className="text-xs h-8">Cancel</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="flex flex-col gap-2" style={{ gridColumn: 'span 2' }}>
              <div className="flex justify-between items-center">
                <label>Client</label>
                <button type="button" onClick={() => setIsAddingClient(true)} className="text-xs text-primary add-new-btn">
                  + Add New
                </button>
              </div>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="form-input"
                required
              >
                <option value="" disabled>Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <Input
              label="Invoice Number"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              required
              style={{ gridColumn: 'span 2' }}
            />
          </div>

          <div className="grid gap-4 items-center" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Input
              label="Issue Date"
              type="date"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              required
            />
            <Input
              label="Due Date (Optional)"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Line Items</h4>
            </div>
            
            <div className="flex flex-col gap-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center relative group w-full">
                  <div className="flex-1">
                    <Input
                      label={index === 0 ? "Description" : ""}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Service rendered"
                      required
                    />
                  </div>
                  <div style={{ width: '80px' }}>
                    <Input
                      label={index === 0 ? "Qty" : ""}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ width: '100px' }}>
                    <Input
                      label={index === 0 ? "Price" : ""}
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      required
                    />
                  </div>
                  <div className={`font-medium text-right ${index === 0 ? 'mt-8' : ''}`} style={{ width: '80px' }}>
                    ${(Number(item.amount) || 0).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className={`header-icon-btn text-destructive ${index === 0 ? 'mt-8' : ''}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem} className="text-xs h-8 mt-2 w-full" style={{ borderStyle: 'dashed' }}>
                <Plus size={12} className="mr-1" /> Add Line Item
              </Button>
            </div>
          </div>

          <div className="border-t pt-4 flex flex-col items-end gap-3">
            <div className="flex justify-between w-full sm:w-1/2 text-sm">
              <span className="text-muted">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-full sm:w-1/2 items-center text-sm">
              <span className="text-muted">Tax Rate (%)</span>
              <div style={{ width: '100px' }}>
                <Input
                  label=""
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.tax_rate}
                  onChange={e => setFormData({...formData, tax_rate: e.target.value as any})}
                />
              </div>
            </div>
            <div className="flex justify-between w-full sm:w-1/2 font-medium text-lg pt-2 border-t">
              <span>Total Amount</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={loading} className="flex-1">{initialData ? 'Update Invoice' : 'Issue Invoice'}</Button>
          </div>
        </form>
      )}
    </div>
  );
};
