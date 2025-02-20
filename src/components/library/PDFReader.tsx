
import { useRef } from 'react';
import { Document, Page as PDFPage, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFReaderProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentBookTitle: string;
  currentPdfUrl: string;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  numPages: number;
}

// Page components
const PageCover = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flip-page-cover bg-white shadow-lg rounded-lg">
      <div className="flex items-center justify-center w-[400px] h-[600px]">
        {children}
      </div>
    </div>
  );
};

const Page = ({ number }: { number: number }) => {
  return (
    <div className="flip-page bg-white shadow-lg rounded-lg">
      <div className="flex items-center justify-center w-[400px] h-[600px]">
        <PDFPage
          pageNumber={number}
          width={400}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </div>
    </div>
  );
};

export function PDFReader({ 
  isOpen, 
  onOpenChange, 
  currentBookTitle, 
  currentPdfUrl,
  onDocumentLoadSuccess,
  numPages 
}: PDFReaderProps) {
  const flipBookRef = useRef<any>(null);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[850px] p-6">
        <SheetHeader className="flex flex-row items-center justify-between mb-6">
          <SheetTitle>{currentBookTitle}</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <div className="flex justify-center">
          {currentPdfUrl && (
            <Document
              file={currentPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div>Carregando PDF...</div>}
              error={<div>Erro ao carregar PDF!</div>}
            >
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
                usePortrait={true}
                startPage={0}
                useMouseEvents={true}
                ref={flipBookRef}
                showCover={true}
                className="mx-auto"
                style={{}}
                startZIndex={0}
                autoSize={true}
                maxShadowOpacity={0.5}
                mobileScrollSupport={true}
                clickEventForward={true}
                swipeDistance={0}
                showPageCorners={true}
                disableFlipByClick={false}
              >
                <PageCover>
                  <h2 className="text-xl font-bold">{currentBookTitle}</h2>
                </PageCover>
                {Array.from(new Array(numPages), (_, index) => (
                  <Page key={index + 1} number={index + 1} />
                ))}
                <PageCover>
                  <h2 className="text-xl font-bold">Fim</h2>
                </PageCover>
              </HTMLFlipBook>
            </Document>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
