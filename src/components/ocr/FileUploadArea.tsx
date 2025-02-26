
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  title?: string;
  description?: string;
  accept?: Record<string, string[]>;
}

const FileUploadArea = ({ 
  onFilesSelected, 
  title = "Arraste documentos ou clique para fazer upload",
  description = "Suporta: PDF, DOC, DOCX e TXT (máx. 10MB)",
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt']
  }
}: FileUploadAreaProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false
  });

  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFilesSelected([]);
  };

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors duration-200 ease-in-out min-h-[200px] flex items-center justify-center
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
      `}
    >
      <input {...getInputProps()} />
      
      {preview ? (
        <div className="relative">
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={preview}
            alt="Prévia do documento"
            className="max-h-64 mx-auto object-contain"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {!isDragActive ? (
            <>
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  {title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {description}
                </p>
              </div>
            </>
          ) : (
            <div className="text-primary">
              <Upload className="mx-auto h-12 w-12" />
              <p className="text-sm font-medium mt-2">Solte o arquivo aqui...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;
