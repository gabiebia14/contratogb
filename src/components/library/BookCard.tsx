
import { Card, CardContent } from '@/components/ui/card';

interface Book {
  id: string;
  title: string;
  author: string;
  cover_image: string;
}

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
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
  );
}
