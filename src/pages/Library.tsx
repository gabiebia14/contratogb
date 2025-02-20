
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBooks } from '@/hooks/useBooks';
import { useBookUpload } from '@/hooks/useBookUpload';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { BooksGrid } from '@/components/library/BooksGrid';
import { PDFReader } from '@/components/library/PDFReader';

export default function Library() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [currentBookTitle, setCurrentBookTitle] = useState('');
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>('');
  const { books, isLoading } = useBooks();
  const { uploadingBook, handleFileUpload } = useBookUpload(() => setDialogOpen(false));

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Por favor, faça login para acessar a biblioteca');
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const openBook = async (filePath: string, title: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sua sessão expirou. Por favor, faça login novamente');
        navigate('/auth');
        return;
      }

      const { data } = await supabase.storage
        .from('library_pdfs')
        .createSignedUrl(filePath, 60 * 60);

      if (data?.signedUrl) {
        setCurrentBookTitle(title);
        setCurrentPdfUrl(data.signedUrl);
        setIsReaderOpen(true);
      }
    } catch (error) {
      console.error('Erro ao abrir livro:', error);
      toast.error('Erro ao abrir o livro');
    }
  };

  const filteredBooks = books?.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="space-y-6">
      <LibraryHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dialogOpen={dialogOpen}
        uploadingBook={uploadingBook}
        onOpenChange={setDialogOpen}
        onFileUpload={handleFileUpload}
      />

      <BooksGrid
        isLoading={isLoading}
        books={filteredBooks}
        onBookClick={openBook}
      />

      <PDFReader
        isOpen={isReaderOpen}
        onOpenChange={setIsReaderOpen}
        currentBookTitle={currentBookTitle}
        currentPdfUrl={currentPdfUrl}
        onDocumentLoadSuccess={onDocumentLoadSuccess}
        numPages={numPages}
      />
    </div>
  );
}
