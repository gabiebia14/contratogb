
import { Input } from '@/components/ui/input';
import { AddBookDialog } from './AddBookDialog';

interface LibraryHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dialogOpen: boolean;
  uploadingBook: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (files: File[]) => Promise<void>;
}

export function LibraryHeader({
  searchTerm,
  onSearchChange,
  dialogOpen,
  uploadingBook,
  onOpenChange,
  onFileUpload
}: LibraryHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Biblioteca Digital</h2>
      <div className="flex items-center gap-4">
        <Input
          type="search"
          placeholder="Pesquisar livros..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <AddBookDialog
          isOpen={dialogOpen}
          isUploading={uploadingBook}
          onOpenChange={onOpenChange}
          onFileUpload={onFileUpload}
        />
      </div>
    </div>
  );
}
