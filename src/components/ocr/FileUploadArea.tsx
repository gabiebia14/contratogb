import React, { useState } from 'react';
import { ScanLine } from 'lucide-react';

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
}

const FileUploadArea = ({ onFilesSelected }: FileUploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
      }`}
    >
      <input
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        id="ocrFileInput"
        multiple
        accept=".pdf,.png,.jpg,.jpeg"
      />
      <label
        htmlFor="ocrFileInput"
        className="cursor-pointer block"
      >
        <ScanLine className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">
          Arraste documentos ou clique para fazer upload
        </h3>
        <p className="text-sm text-gray-500">
          Suporte para PDF, PNG, JPG (max. 10MB)
        </p>
      </label>
    </div>
  );
};

export default FileUploadArea;