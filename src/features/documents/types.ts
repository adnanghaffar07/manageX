export type DocumentCategory = 'General' | 'Contract' | 'ID' | 'Invoice' | 'Logo' | 'Other';

export interface Document {
  id: string;
  user_id: string;
  name: string;
  storage_path: string;
  file_type: string | null;
  file_size: number | null;
  category: DocumentCategory;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadParams {
  file: File;
  category: DocumentCategory;
}
