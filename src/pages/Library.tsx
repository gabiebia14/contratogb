
import { useState } from 'react';
import FileUploadArea from '@/components/ocr/FileUploadArea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

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
  const [uploadingBook, setUploadingBook] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: books, isLoading } = useQuery({
    queryKey: ['library-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library_books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Book[];
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
      
      // Upload do arquivo PDF
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('library_pdfs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Criar registro do livro
      const { error: insertError } = await supabase
        .from('library_books')
        .insert({
          title: file.name.replace(`.${fileExt}`, ''),
          file_path: filePath,
          file_size: file.size,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (insertError) throw insertError;

      toast.success('Livro adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do livro');
    } finally {
      setUploadingBook(false);
    }
  };

  const openBook = async (book: Book) => {
    try {
      const { data } = await supabase.storage
        .from('library_pdfs')
        .createSignedUrl(book.file_path, 60 * 60); // URL válida por 1 hora

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
        <Input
          type="search"
          placeholder="Pesquisar livros..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Adicionar Novo Livro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadArea onFilesSelected={handleFileUpload} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Carregando biblioteca...</p>
        ) : filteredBooks?.map((book) => (
          <Card key={book.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                {book.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {book.author && (
                <p className="text-sm text-gray-500 mb-4">
                  Autor: {book.author}
                </p>
              )}
              <Button onClick={() => openBook(book)} className="w-full">
                Ler Livro
              </Button>
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
