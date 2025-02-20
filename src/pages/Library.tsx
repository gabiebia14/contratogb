
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/library/BookCard';
import { AddBookDialog } from '@/components/library/AddBookDialog';
import { useBooks } from '@/hooks/useBooks';
import { useBookUpload } from '@/hooks/useBookUpload';
import HTMLFlipBook from 'react-pageflip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Page {
  pageNumber: number;
  url: string;
}

export default function Library() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfPages, setPdfPages] = useState<Page[]>([]);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [currentBookTitle, setCurrentBookTitle] = useState('');
  const { books, isLoading } = useBooks();
  const { uploadingBook, handleFileUpload } = useBookUpload(() => setDialogOpen(false));
  const flipBookRef = useRef(null);

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
        // Em vez de abrir em uma nova aba, vamos abrir no visualizador
        setCurrentBookTitle(title);
        setPdfPages([{ pageNumber: 1, url: data.signedUrl }]); // Inicialmente só uma página
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

  // Componente Page para o HTMLFlipBook
  const PageCover = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="flex items-center justify-center bg-white shadow-lg rounded-lg w-[400px] h-[600px]">
        {children}
      </div>
    );
  };

  const Page = ({ url }: { url: string }) => {
    return (
      <div className="flex items-center justify-center bg-white shadow-lg rounded-lg w-[400px] h-[600px]">
        <iframe src={url} className="w-full h-full rounded-lg" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Biblioteca Digital</h2>
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Pesquisar livros..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddBookDialog
            isOpen={dialogOpen}
            isUploading={uploadingBook}
            onOpenChange={setDialogOpen}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading ? (
          <p>Carregando biblioteca...</p>
        ) : filteredBooks?.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => openBook(book.file_path, book.title)}
          />
        ))}
      </div>

      {filteredBooks?.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Nenhum livro encontrado. Adicione seu primeiro livro!
        </div>
      )}

      <Sheet open={isReaderOpen} onOpenChange={setIsReaderOpen}>
        <SheetContent side="right" className="w-full sm:w-[850px] p-6">
          <SheetHeader className="flex flex-row items-center justify-between mb-6">
            <SheetTitle>{currentBookTitle}</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsReaderOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>
          
          <div className="flex justify-center">
            <HTMLFlipBook
              width={400}
              height={600}
              size="stretch"
              minWidth={315}
              maxWidth={1000}
              minHeight={400}
              maxHeight={1533}
              drawShadow={true}
              flippingTime={1000}
              ref={flipBookRef}
              showCover={true}
              className="mx-auto"
            >
              <PageCover>
                <h2 className="text-xl font-bold">{currentBookTitle}</h2>
              </PageCover>
              {pdfPages.map((page) => (
                <Page key={page.pageNumber} url={page.url} />
              ))}
              <PageCover>
                <h2 className="text-xl font-bold">Fim</h2>
              </PageCover>
            </HTMLFlipBook>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
