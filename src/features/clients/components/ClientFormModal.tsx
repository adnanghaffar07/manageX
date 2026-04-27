import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { createClient } from '../api';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { X } from 'lucide-react';
import type { Client } from '../../invoices/types';
import { COUNTRIES, CURRENCIES } from './constants';

interface ClientFormModalProps {
  onClose: () => void;
  onSuccess: (client: Client) => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    country: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneCountryCode: '+1',
    phone: '',
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    website: '',
    invoiceCurrency: '',
    additionalInfo: '',
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [loading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First and last name are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    const fullPhone = formData.phone.trim()
      ? `${formData.phoneCountryCode} ${formData.phone.trim()}`
      : null;

    try {
      const newClient = await createClient(user.id, {
        name: fullName,
        first_name: formData.firstName.trim() || null,
        last_name: formData.lastName.trim() || null,
        company_name: formData.companyName.trim() || null,
        email: formData.email.trim() || null,
        phone: fullPhone,
        country: formData.country.trim() || null,
        address_line_1: formData.addressLine1.trim() || null,
        address_line_2: formData.addressLine2.trim() || null,
        postal_code: formData.postalCode.trim() || null,
        city: formData.city.trim() || null,
        website: formData.website.trim() || null,
        invoice_currency: formData.invoiceCurrency.trim() || null,
        additional_info: formData.additionalInfo.trim() || null,
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
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal-content" style={{ maxWidth: '860px', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 className="text-xl font-bold">New Client</h2>
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

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{
            backgroundColor: 'rgba(var(--destructive), 0.1)',
            color: 'rgb(var(--destructive))',
            border: '1px solid rgba(var(--destructive), 0.2)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Row 1: Company Name + Country */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Company name *"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-sm font-medium">Country</label>
              <input
                className="form-input"
                list="country-list"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Type or select..."
                autoComplete="off"
                style={{ height: '40px' }}
              />
              <datalist id="country-list">
                {COUNTRIES.map(c => (
                  <option key={`country-${c.code}`} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 2: First Name + Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="First name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          {/* Row 3: Email + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Email address *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-sm font-medium">Phone number</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  className="form-input"
                  list="phone-codes-list"
                  value={formData.phoneCountryCode}
                  onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                  placeholder="+1"
                  autoComplete="off"
                  style={{ width: '100px', height: '40px', flexShrink: 0 }}
                />
                <datalist id="phone-codes-list">
                  {COUNTRIES.map(c => (
                    <option key={`dial-${c.code}`} value={c.dialCode}>
                      {c.flag} {c.dialCode} ({c.name})
                    </option>
                  ))}
                </datalist>
                <input
                  className="form-input"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="70 123 4567"
                  style={{ flex: 1, height: '40px' }}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Address Line 1 + Address Line 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Address line 1"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
            />
            <Input
              label="Address line 2"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
            />
          </div>

          {/* Row 5: Postal Code + City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Postal code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          


          {/* Row 6: Website + Invoice Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Web site"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-sm font-medium">Invoice currency</label>
              <input
                className="form-input"
                list="currency-list"
                value={formData.invoiceCurrency}
                onChange={(e) => setFormData({ ...formData, invoiceCurrency: e.target.value })}
                placeholder="Type or select..."
                autoComplete="off"
                style={{ height: '40px' }}
              />
              <datalist id="currency-list">
                {CURRENCIES.map(c => (
                  <option key={`cur-${c.code}`} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 7: Additional Info — full width */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="text-sm font-medium">Additional info</label>
            <textarea
              className="form-input"
              style={{ minHeight: '90px', resize: 'vertical' }}
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              placeholder="Any additional notes"
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              ✓ Save Client
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};