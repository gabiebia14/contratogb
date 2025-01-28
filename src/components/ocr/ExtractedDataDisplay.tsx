import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExtractedData {
  text: string;
  confidence: number;
}

interface ExtractedDataDisplayProps {
  data: ExtractedData[];
}

const ExtractedDataDisplay = ({ data }: ExtractedDataDisplayProps) => {
  if (!data.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Extraídos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="border-b pb-2 last:border-0">
            <p className="text-sm text-gray-600">Texto extraído:</p>
            <p className="font-medium">{item.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              Confiança: {(item.confidence * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExtractedDataDisplay;