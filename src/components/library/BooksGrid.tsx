
import { BookCard } from './BookCard';
import { Book } from '@/hooks/useBooks';

interface BooksGridProps {
  isLoading: boolean;
  books: Book[] | undefined;
  onBookClick: (filePath: string, title: string) => void;
}

export function BooksGrid({ isLoading, books, onBookClick }: BooksGridProps) {
  if (isLoading) {
    return <p>Carregando biblioteca...</p>;
  }

  if (!books?.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        Nenhum livro encontrado. Adicione seu primeiro livro!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onClick={() => onBookClick(book.file_path, book.title)}
        />
      ))}
    </div>
  );
}
