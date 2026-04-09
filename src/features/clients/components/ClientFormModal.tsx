import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { createClient } from '../api';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Client } from '../../invoices/types';

interface CustomField {
  key: string;
  value: string;
}

interface ClientFormModalProps {
  onClose: () => void;
  onSuccess: (client: Client) => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
  });

  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [loading, onClose]);

  const handleAddField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const updateCustomField = (index: number, field: keyof CustomField, value: string) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First and last name are required.');
      return;
    }

    // Convert custom fields array to object
    const customFieldsObj: Record<string, string> = {};
    for (const field of customFields) {
      if (field.key.trim() && field.value.trim()) {
        customFieldsObj[field.key.trim()] = field.value.trim();
      }
    }

    setLoading(true);
    setError(null);

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

    try {
      const newClient = await createClient(user.id, {
        name: fullName,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        company_name: formData.companyName.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        custom_fields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : null,
      });

      onSuccess(newClient);
    } catch (err: any) {
      console.error('Error creating client:', err);
      setError(err.message || 'Failed to create client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="modal-content">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted hover:text-foreground transition-colors"
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
        >
          <X size={20} />
        </button>
        <div className="mb-5 pr-8">
          <h2 className="text-xl sm:text-2xl font-bold" style={{marginLeft:'44px'}}>Add New Client</h2>
          <p className="text-sm text-muted mt-1"style={{marginTop:"7px"}}>Create a client quickly and attach them to this invoice.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md text-sm" style={{ backgroundColor: 'rgba(var(--destructive), 0.1)', color: 'rgb(var(--destructive))', border: '1px solid rgba(var(--destructive), 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 overflow-y-auto pr-1 max-h-[calc(92vh-7rem)]">
          <div className="form-grid">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Company Name (Optional)"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />

          <div className="form-grid">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Address</label>
            <textarea
              className="form-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-medium">Dynamic Fields</h4>
                <p className="text-xs text-muted">Add custom information like VAT Number or specific notes.</p>
              </div>
              <Button type="button" variant="outline" onClick={handleAddField} className="text-sm h-8">
                <Plus size={14} className="mr-1" /> Add Field
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {customFields.map((field, index) => (
                <div key={index} className="custom-field-grid w-full">
                  <div>
                    <Input
                      label=""
                      placeholder="Field Name (e.g. VAT No)"
                      value={field.key}
                      onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label=""
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="header-icon-btn text-destructive mb-1"
                    style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {customFields.length === 0 && (
                <p className="text-sm text-muted italic text-center py-4 bg-muted/10 rounded border border-dashed">
                  No custom fields added.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t mt-2 justify-end" style={{ flexWrap: 'wrap' }}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Save Client
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
