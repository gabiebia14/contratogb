import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExtractedField } from '@/types/ocr';
import { Badge } from '@/components/ui/badge';

interface ExtractedDataDisplayProps {
  data: ExtractedField[];
}

const ExtractedDataDisplay = ({ data }: ExtractedDataDisplayProps) => {
  if (!data.length) return null;

  const sortedData = [...data].sort((a, b) => b.confidence - a.confidence);

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'bg-green-100 text-green-800';
    if (confidence > 0.8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Campo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="text-right">Confiança</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.field}</TableCell>
              <TableCell>{item.value}</TableCell>
              <TableCell className="text-right">
                <Badge 
                  variant="secondary"
                  className={getConfidenceColor(item.confidence)}
                >
                  {(item.confidence * 100).toFixed(1)}%
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExtractedDataDisplay;