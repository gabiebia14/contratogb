import { useState, useEffect } from 'react';
import { Template } from '@/types/contracts';

export const useContractTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      name: 'Contrato de Prestação de Serviços',
      category: 'Serviços',
      lastModified: '15/03/2024',
      downloads: 128,
      content: 'template-servicos.pdf'
    },
    {
      id: 2,
      name: 'Termo de Confidencialidade',
      category: 'Legal',
      lastModified: '14/03/2024',
      downloads: 85,
      content: 'template-nda.pdf'
    }
  ]);

  return { templates };
};