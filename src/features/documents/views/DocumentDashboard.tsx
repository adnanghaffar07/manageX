import React, { useEffect, useState } from 'react';
import { Plus, Search, Loader2, FolderOpen, FileText, HardDrive, Sparkles } from 'lucide-react';
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

  const totalSizeMB = (documents.reduce((acc, d) => acc + (d.file_size || 0), 0) / 1024 / 1024).toFixed(1);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .hero-banner {
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          border-radius: 1rem;
          padding: 2rem;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        .hero-banner::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
        }
        .stat-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }
        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          transition: transform 0.3s ease;
        }
        .stat-card:hover .stat-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }
        .category-pill {
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--muted-foreground);
        }
        .category-pill:hover {
          border-color: var(--primary);
          background: var(--accent);
          color: var(--accent-foreground);
        }
        .category-pill.active {
          background: var(--primary);
          color: var(--primary-foreground);
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
      `}</style>

      {/* Hero Header Section */}
      <div className="hero-banner flex justify-between items-center flex-wrap gap-4">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={24} style={{ color: '#fbbf24' }} />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'white' }}>Document Center</h2>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '500px' }}>
            Securely manage, organize, and access all your company's important files, contracts, and internal assets in one unified hub.
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Button 
            onClick={() => setIsUploadModalOpen(true)} 
            className="flex items-center gap-2"
            style={{ 
              background: 'white', 
              color: 'var(--primary)', 
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem'
            }}
          >
             <Plus size={18} strokeWidth={3} />
            New Upload
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
            <FolderOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-muted font-semibold uppercase tracking-wider mb-1">Total Files</p>
            <p className="text-3xl font-bold">{documents.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-muted font-semibold uppercase tracking-wider mb-1">Categories</p>
            <p className="text-3xl font-bold">{new Set(documents.map(d => d.category)).size}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-sm text-muted font-semibold uppercase tracking-wider mb-1">Storage Used</p>
            <p className="text-3xl font-bold flex items-baseline gap-1">
              {totalSizeMB} <span className="text-lg text-muted">MB</span>
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Search and Filter bar */}
      <div className="card flex flex-col gap-4 p-4" style={{ borderRadius: '1rem' }}>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground document-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search documents by name..."
              className="form-input"
              style={{ 
                paddingLeft: '2.75rem', 
                height: '3rem', 
                borderRadius: '0.75rem',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                width: '100%'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`category-pill ${filterCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center flex-col items-center gap-4 p-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted font-medium">Loading documents...</p>
          </div>
        ) : (
           <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '1rem' }}>
            <DocumentList documents={filteredDocuments} onRefresh={fetchDocuments} />
           </div>
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
