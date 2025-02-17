
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/library/BookCard';
import { AddBookDialog } from '@/components/library/AddBookDialog';
import { useBooks } from '@/hooks/useBooks';
import { useBookUpload } from '@/hooks/useBookUpload';

export default function Library() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const openBook = async (filePath: string) => {
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
        window.open(data.signedUrl, '_blank');
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
            onClick={() => openBook(book.file_path)}
          />
        ))}
      </div>

      {filteredBooks?.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Nenhum livro encontrado. Adicione seu primeiro livro!
        </div>
      )}
    </div>
  );
}
