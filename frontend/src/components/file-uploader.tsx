import { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';

interface FileUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
  endpoint?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export function FileUploader({
  onUploadComplete,
  multiple = false,
  endpoint = "images",
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024 // 5MB default
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // Limit number of files if multiple uploads are allowed
    if (multiple && acceptedFiles.length + uploadedFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files`);
      return;
    }
    
    setError(null);
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      if (multiple) {
        acceptedFiles.forEach((file) => {
          formData.append('files', file);
        });
      } else {
        formData.append('file', acceptedFiles[0]);
      }
      
      const response = await axios.post(`${API_ENDPOINTS.UPLOAD}/${endpoint}`, formData);
      
      let newUrls: string[] = [];
      if (multiple) {
        newUrls = response.data.urls || [];
      } else {
        newUrls = response.data.url ? [response.data.url] : [];
      }
      
      const allUrls = [...uploadedFiles, ...newUrls];
      setUploadedFiles(allUrls);
      onUploadComplete(allUrls);
      
      toast.success(`File${acceptedFiles.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload files. Please try again.');
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    onUploadComplete(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxSize,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: multiple ? maxFiles : 1,
    disabled: isUploading
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-rose-500 animate-spin mb-2" />
          ) : (
            <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
          )}
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Drop the files here"
              : isUploading
                ? "Uploading..."
                : `Drag & drop ${multiple ? 'files' : 'a file'} here, or click to select`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {multiple ? `Up to ${maxFiles} files, ` : ""}
            Max {Math.floor(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {uploadedFiles.map((url, idx) => (
            <div key={idx} className="relative h-24 rounded-md overflow-hidden border">
              <img 
                src={url} 
                alt={`Uploaded file ${idx+1}`} 
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 