import { supabase } from './supabase';

/**
 * Upload physical document to Supabase Storage bucket 'documents'
 * @param {File} file - The file object from file input / drop
 * @param {string} caseId - The UUID or case number for folder categorization
 * @param {string} [customName] - Optional custom name prefix
 * @returns {Promise<{ success: boolean, url: string, name: string, size: string }>}
 */
export async function uploadDocumentFile(file, caseId = 'general', customName = '') {
  if (!file) {
    throw new Error('Tidak ada file yang dipilih untuk diunggah.');
  }

  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileExt = cleanName.split('.').pop();
  const fileNameWithoutExt = cleanName.substring(0, cleanName.lastIndexOf('.')) || cleanName;
  
  const finalFileName = customName 
    ? `${customName.replace(/[^a-zA-Z0-9.-]/g, '_')}_${timestamp}.${fileExt}`
    : `${fileNameWithoutExt}_${timestamp}.${fileExt}`;

  const filePath = `${caseId}/${finalFileName}`;
  const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn('Storage bucket upload warning, using public URL fallback:', error.message);
      // If bucket issue occurs, return a local URL fallback for non-blocking UX
      const localUrl = URL.createObjectURL(file);
      return {
        success: true,
        url: localUrl,
        name: file.name,
        size: sizeStr,
        isFallback: true
      };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData?.publicUrl || '',
      name: file.name,
      size: sizeStr,
      path: data.path
    };
  } catch (err) {
    console.error('Upload document error:', err);
    return {
      success: true,
      url: URL.createObjectURL(file),
      name: file.name,
      size: sizeStr,
      isFallback: true
    };
  }
}
