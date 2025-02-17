
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import FileUploadArea from '@/components/ocr/FileUploadArea';

interface AddBookDialogProps {
  isOpen: boolean;
  isUploading: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (files: File[]) => Promise<void>;
}

export function AddBookDialog({ isOpen, isUploading, onOpenChange, onFileUpload }: AddBookDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" disabled={isUploading}>
          <PlusCircle className="h-5 w-5" />
          {isUploading ? 'Adicionando...' : 'Adicionar Livro'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Livro</DialogTitle>
        </DialogHeader>
        <FileUploadArea onFilesSelected={onFileUpload} />
      </DialogContent>
    </Dialog>
  );
}
