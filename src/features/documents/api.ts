import { supabase } from '../../config/supabase';
import type { Document, DocumentCategory } from './types';
import { PDFDocument } from 'pdf-lib';

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

export const uploadDocument = async (file: File, category: DocumentCategory, isSigned: boolean = false): Promise<Document> => {
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
      metadata: { is_signed: isSigned },
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

export const signDocument = async (document: Document, signatureDataUrl: string): Promise<Document> => {
  if (document.file_type !== 'application/pdf') {
    throw new Error('Only PDF documents can be signed directly.');
  }

  // 1. Download original PDF
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(document.storage_path);

  if (downloadError || !fileData) {
    console.error('Error downloading document:', downloadError);
    throw new Error(downloadError?.message || 'Failed to download document');
  }

  const arrayBuffer = await fileData.arrayBuffer();
  
  // 2. Load PDF
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // 3. Process Signature Image
  // signatureDataUrl is a base64 string like "data:image/png;base64,iVBORw0KGgo..."
  const base64Data = signatureDataUrl.split(',')[1];
  const signatureBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  const signatureImage = await pdfDoc.embedPng(signatureBytes);
  
  // 4. Draw Signature on Last Page
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  
  // Calculate dimensions to maintain aspect ratio, max width 200, max height 100
  const sigDims = signatureImage.scaleToFit(200, 100);
  
  lastPage.drawImage(signatureImage, {
    x: 50,
    y: 50, // Bottom left corner with padding
    width: sigDims.width,
    height: sigDims.height,
  });

  // 5. Save modified PDF
  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });

  // 6. Upload back to Storage (replace existing)
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(document.storage_path, pdfBlob, {
      upsert: true,
      contentType: 'application/pdf',
    });

  if (uploadError) {
    console.error('Error uploading signed document:', uploadError);
    throw new Error(uploadError.message);
  }

  // 7. Update metadata in Database
  const newMetadata = { ...document.metadata, is_signed: true };
  const { data: updatedDoc, error: dbError } = await supabase
    .from('documents')
    .update({ metadata: newMetadata })
    .eq('id', document.id)
    .select()
    .single();

  if (dbError) {
    console.error('Error updating document metadata:', dbError);
    throw new Error(dbError.message);
  }

  return updatedDoc;
};
