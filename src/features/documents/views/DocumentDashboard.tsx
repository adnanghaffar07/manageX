import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Loader2, FolderOpen } from 'lucide-react';
import { getDocuments } from '../api';
import type { Document, DocumentCategory } from '../types';
import { DocumentList } from '../components/DocumentList';
import { UploadModal } from '../components/UploadModal';
import { Button } from '../../../components/common/Button';

export const DocumentDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'All'>('All');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: (DocumentCategory | 'All')[] = ['All', 'General', 'Contract', 'ID', 'Invoice', 'Logo', 'Other'];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted text-sm mt-2">Manage your company files, contracts, and internal assets.</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2">
          <Plus size={18} />
          Upload Document
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <FolderOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">Total Files</p>
            <p className="text-xl font-bold">{documents.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
            <Filter size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">Categories</p>
            <p className="text-xl font-bold">{new Set(documents.map(d => d.category)).size}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
            <Search size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">Storage Used</p>
            <p className="text-xl font-bold">
              {(documents.reduce((acc, d) => acc + (d.file_size || 0), 0) / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 h-10 text-sm font-medium rounded-lg border transition-all whitespace-nowrap ${filterCategory === cat ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <DocumentList documents={filteredDocuments} onRefresh={fetchDocuments} />
        )}
      </div>

      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
};
