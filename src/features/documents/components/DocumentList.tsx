import React, { useState } from 'react';
import { FileText, Download, Trash2, ExternalLink, Image as ImageIcon, File, PenTool } from 'lucide-react';
import type { Document } from '../types';
import { deleteDocument, getDocumentDownloadUrl } from '../api';
import { SignDocumentModal } from './SignDocumentModal';

interface DocumentListProps {
  documents: Document[];
  onRefresh: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onRefresh }) => {
  const [signingDocument, setSigningDocument] = useState<Document | null>(null);

  const handleDelete = async (doc: Document) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) return;
    try {
      await deleteDocument(doc.id, doc.storage_path);
      onRefresh();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document.');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const url = await getDocumentDownloadUrl(doc.storage_path);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.name;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to get download link.');
    }
  };

  const getFileIcon = (type: string | null) => {
    if (!type) return <File size={20} />;
    if (type.includes('image')) return <ImageIcon size={20} className="text-blue-500" />;
    if (type.includes('pdf')) return <FileText size={20} className="text-red-500" />;
    return <File size={20} />;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 card border-dashed">
        <div className="p-4 rounded-full bg-secondary text-muted-foreground mb-4">
          <FileText size={32} />
        </div>
        <p className="text-muted text-center max-w-[200px]">No documents found. Upload your first file to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Category</th>
              <th>Type</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-secondary">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <span className="truncate max-w-[200px]" title={doc.name}>{doc.name}</span>
                  </div>
                </td>
                <td>
                  <div className="flex gap-2 items-center">
                    <span className="badge badge-secondary">{doc.category}</span>
                    {doc.metadata?.is_signed && (
                      <span className="badge" style={{ backgroundColor: '#10b981', color: 'white', fontSize: '0.7rem' }}>Signed</span>
                    )}
                  </div>
                </td>
                <td className="text-muted text-xs uppercase">
                  {doc.file_type?.split('/').pop() || 'Unknown'}
                </td>
                <td className="text-muted">
                  {formatSize(doc.file_size)}
                </td>
                <td className="text-muted">
                  {new Date(doc.created_at).toLocaleDateString()}
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button 
                      onClick={() => handleDownload(doc)}
                      className="header-icon-btn" 
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    {doc.file_type === 'application/pdf' && !doc.metadata?.is_signed && (
                      <button 
                        onClick={() => setSigningDocument(doc)}
                        className="header-icon-btn text-primary" 
                        title="Sign Document"
                      >
                        <PenTool size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDownload(doc)} // Same URL for preview in new tab
                      className="header-icon-btn" 
                      title="Preview"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc)}
                      className="header-icon-btn text-destructive" 
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {signingDocument && (
          <SignDocumentModal 
            document={signingDocument} 
            onClose={() => setSigningDocument(null)} 
            onSuccess={() => {
              setSigningDocument(null);
              onRefresh();
            }} 
          />
        )}
    </div>
  );
};
