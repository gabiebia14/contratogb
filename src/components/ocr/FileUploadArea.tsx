import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
}

const FileUploadArea = ({ onFilesSelected }: FileUploadAreaProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
    
    // Criar prévia para o primeiro arquivo
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      
      reader.readAsDataURL(file);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
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
        transition-colors duration-200 ease-in-out
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
        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Solte o arquivo aqui...'
              : 'Arraste documentos ou clique para fazer upload'}
          </p>
          <p className="text-xs text-gray-500">
            Suporta: JPEG, PNG e PDF (máx. 10MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;
