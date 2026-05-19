import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { createSender } from '../api';
import type { Sender } from '../../invoices/types';

interface SenderFormModalProps {
  onClose: () => void;
  onSuccess: (sender: Sender) => void;
}

export const SenderFormModal: React.FC<SenderFormModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const newSender = await createSender({
        ...formData,
        user_id: user.id,
      });
      onSuccess(newSender);
    } catch (error) {
      console.error('Failed to create sender:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal-content" style={{ maxWidth: '600px', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 className="text-xl font-bold">Add New Sender</h2>
            <p className="text-sm text-muted mt-1">Create a new sender profile for invoices</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: '4px', background: 'transparent',
              border: 'none', cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Sender Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g. John Doe or Acme Corp"
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Company Name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="e.g. Acme Corp"
            />
            <Input
              label="Email address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
            />
            <Input
              label="Web site"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="text-sm font-medium">Address</label>
            <textarea
              className="form-input"
              style={{ minHeight: '90px', resize: 'vertical' }}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              ✓ Save Sender
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
