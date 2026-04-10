import { supabase } from '../../config/supabase';
import type { Document, DocumentCategory } from './types';

export const getDocuments = async (): Promise<Document[]> => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const uploadDocument = async (file: File, category: DocumentCategory): Promise<Document> => {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) throw new Error('User not authenticated');

  const userId = userData.user.id;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // 1. Upload to Storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (storageError) {
    console.error('Error uploading to storage:', storageError);
    throw new Error(storageError.message);
  }

  // 2. Insert into Table
  const { data, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      name: file.name,
      storage_path: filePath,
      file_type: file.type,
      file_size: file.size,
      category: category,
    })
    .select()
    .single();

  if (dbError) {
    // Cleanup storage if db fails
    await supabase.storage.from('documents').remove([filePath]);
    console.error('Error recording document in database:', dbError);
    throw new Error(dbError.message);
  }

  return data;
};

export const deleteDocument = async (id: string, storagePath: string): Promise<void> => {
  // 1. Delete from Storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([storagePath]);

  if (storageError) {
    console.error('Error deleting from storage:', storageError);
  }

  // 2. Delete from Table
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error('Error deleting from database:', dbError);
    throw new Error(dbError.message);
  }
};

export const getDocumentDownloadUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 60); // 60 seconds link

  if (error) {
    console.error('Error creating signed URL:', error);
    throw new Error(error.message);
  }

  return data.signedUrl;
};
