
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploadArea from '@/components/ocr/FileUploadArea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, PlusCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  file_path: string;
  cover_image: string;
  last_page: number;
  total_pages: number;
  created_at: string;
}

export default function Library() {
  const navigate = useNavigate();
  const [uploadingBook, setUploadingBook] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const { data: books, isLoading } = useQuery({
    queryKey: ['library-books'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Não autenticado');
      }

      const { data, error } = await supabase
        .from('library_books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Book[];
    },
    retry: false,
    meta: {
      onError: (error: Error) => {
        console.error('Erro ao carregar livros:', error);
        if (error.message === 'Não autenticado') {
          navigate('/auth');
        } else {
          toast.error('Erro ao carregar os livros');
        }
      }
    }
  });

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    try {
      setUploadingBook(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sua sessão expirou. Por favor, faça login novamente');
        navigate('/auth');
        return;
      }
      
      // Upload the PDF file
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('library_pdfs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Process the PDF to get the first page as an image
      const formData = new FormData();
      formData.append('file', file);

      const { error: functionError, data: functionData } = await supabase.functions.invoke('extract-pdf-cover', {
        body: formData,
      });

      if (functionError) throw functionError;

      let coverImagePath = '/placeholder.svg';
      if (functionData?.coverImageUrl) {
        coverImagePath = functionData.coverImageUrl;
      }

      // Create book record
      const { error: insertError } = await supabase
        .from('library_books')
        .insert({
          title: file.name.replace(`.${fileExt}`, ''),
          file_path: filePath,
          file_size: file.size,
          user_id: session.user.id,
          cover_image: coverImagePath
        });

      if (insertError) throw insertError;

      toast.success('Livro adicionado com sucesso!');
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do livro');
    } finally {
      setUploadingBook(false);
    }
  };

  const openBook = async (book: Book) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sua sessão expirou. Por favor, faça login novamente');
        navigate('/auth');
        return;
      }

      const { data } = await supabase.storage
        .from('library_pdfs')
        .createSignedUrl(book.file_path, 60 * 60);

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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={uploadingBook}>
                <PlusCircle className="h-5 w-5" />
                {uploadingBook ? 'Adicionando...' : 'Adicionar Livro'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Livro</DialogTitle>
              </DialogHeader>
              <FileUploadArea onFilesSelected={handleFileUpload} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading ? (
          <p>Carregando biblioteca...</p>
        ) : filteredBooks?.map((book) => (
          <Card 
            key={book.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => openBook(book)}
          >
            <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
              <img
                src={book.cover_image || '/placeholder.svg'}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold line-clamp-2">{book.title}</h3>
              {book.author && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {book.author}
                </p>
              )}
            </CardContent>
          </Card>
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
