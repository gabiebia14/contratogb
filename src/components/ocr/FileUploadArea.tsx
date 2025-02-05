import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-muted"
      )}
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
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">
          Arraste documentos ou clique para fazer upload
        </h3>
        <p className="text-sm text-muted-foreground">
          Documentos aceitos: RG, CNH, Comprovante de Residência
          <br />
          Formatos: PDF, PNG, JPG (max. 10MB)
        </p>
      </label>
    </div>
  );
};

export default FileUploadArea;