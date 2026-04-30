import React, { useState } from 'react';
import { X, Upload, File } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { uploadDocument } from '../api';
import type { DocumentCategory } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('General');
  const [isSigned, setIsSigned] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: DocumentCategory[] = ['General', 'Contract', 'ID', 'Invoice', 'Logo', 'Other'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await uploadDocument(file, category, isSigned);
      onSuccess();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button onClick={onClose} className="header-icon-btn">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded text-sm bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange}
            />
            {file ? (
              <>
                <File className="text-primary" size={32} />
                <div className="text-center">
                  <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-secondary text-primary">
                  <Upload size={24} />
                </div>
                <div className="text-center" style={{ marginTop: '30px' }}>
                  <p className="font-medium">Click or drag to upload</p>
                  <p className="text-xs text-muted">PDF, PNG, JPG, DOC (Max 10MB)</p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`btn ${category === cat ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.875rem', padding: '0.5rem', height: 'auto' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isSigned" 
              checked={isSigned} 
              onChange={(e) => setIsSigned(e.target.checked)}
              style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="isSigned" className="text-sm font-medium cursor-pointer" style={{ userSelect: 'none' }}>
              This is a signed document
            </label>
          </div>

          <div className="flex gap-3 pt-4" style={{ marginTop: '20px' }}>
            <Button variant="ghost" onClick={onClose} className="flex-1" type="button" disabled={isUploading}>
              Cancel
            </Button>
            <Button className="flex-1" type="submit" isLoading={isUploading} disabled={!file}>
              Upload
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
