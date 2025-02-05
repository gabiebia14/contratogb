import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExtractedField } from '@/types/ocr';

interface ExtractedDataDisplayProps {
  data: ExtractedField[];
}

const ExtractedDataDisplay = ({ data }: ExtractedDataDisplayProps) => {
  if (!data.length) return null;

  // Ordenar dados por confiança (do maior para o menor)
  const sortedData = [...data].sort((a, b) => b.confidence - a.confidence);

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'bg-green-100 text-green-800';
    if (confidence > 0.8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Extraídos do Documento</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Confiança</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.field}</TableCell>
                <TableCell>{item.value}</TableCell>
                <TableCell>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(item.confidence)}`}
                  >
                    {(item.confidence * 100).toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ExtractedDataDisplay;