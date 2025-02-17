import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

interface ExtractedData {
  locatario_nome?: string;
  locatario_nacionalidade?: string;
  locatario_estado_civil?: string;
  locatario_profissao?: string;
  locatario_rg?: string;
  locatario_cpf?: string;
  locatario_endereco?: string;
  locatario_cidade?: string;
  locatario_estado?: string;

  locataria_nome?: string;
  locataria_nacionalidade?: string;
  locataria_estado_civil?: string;
  locataria_profissao?: string;
  locataria_rg?: string;
  locataria_cpf?: string;
  locataria_endereco?: string;
  locataria_cidade?: string;
  locataria_estado?: string;

  locador_nome?: string;
  locador_nacionalidade?: string;
  locador_estado_civil?: string;
  locador_profissao?: string;
  locador_rg?: string;
  locador_cpf?: string;
  locador_endereco?: string;
  locador_cidade?: string;
  locador_estado?: string;

  locadora_nome?: string;
  locadora_nacionalidade?: string;
  locadora_estado_civil?: string;
  locadora_profissao?: string;
  locadora_rg?: string;
  locadora_cpf?: string;
  locadora_endereco?: string;
  locadora_cidade?: string;
  locadora_estado?: string;
}

function base64ToUint8Array(base64: string) {
  if (!base64) {
    throw new Error('Conteúdo base64 vazio');
  }

  const cleanBase64 = base64.replace(/^data:.*;base64,/, '').trim();
  
  try {
    const binaryString = atob(cleanBase64);
    
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  } catch (error) {
    console.error('Erro ao decodificar base64:', error);
    throw new Error('Erro ao decodificar o template: formato inválido');
  }
}

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const generateContract = async (templateId: string, documentId: string, title: string) => {
    setLoading(true);
    try {
      if (!templateId?.trim() || !documentId?.trim()) {
        throw new Error('ID do template ou documento inválido');
      }

      const { data: template, error: templateError } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('id', templateId.trim())
        .single();

      if (templateError) {
        console.error('Erro ao buscar template:', templateError);
        throw new Error('Erro ao buscar template');
      }

      if (!template?.content) {
        throw new Error('Template não possui conteúdo');
      }

      const { data: document, error: documentError } = await supabase
        .from('processed_documents')
        .select('*')
        .eq('id', documentId.trim())
        .single();

      if (documentError) {
        console.error('Erro ao buscar documento:', documentError);
        throw new Error('Erro ao buscar documento');
      }

      if (!document?.extracted_data) {
        throw new Error('Documento não possui dados extraídos');
      }

      const parsedData = typeof document.extracted_data === 'string' 
        ? JSON.parse(document.extracted_data) 
        : document.extracted_data;

      const templateData = {
        locatario_nome: parsedData.locatario_nome || '',
        locatario_nacionalidade: parsedData.locatario_nacionalidade || '',
        locatario_estado_civil: parsedData.locatario_estado_civil || '',
        locatario_profissao: parsedData.locatario_profissao || '',
        locatario_rg: parsedData.locatario_rg || '',
        locatario_cpf: parsedData.locatario_cpf || '',
        locatario_endereco: parsedData.locatario_endereco || '',
        locatario_cidade: parsedData.locatario_cidade || '',
        locatario_estado: parsedData.locatario_estado || '',

        locataria_nome: parsedData.locataria_nome || '',
        locataria_nacionalidade: parsedData.locataria_nacionalidade || '',
        locataria_estado_civil: parsedData.locataria_estado_civil || '',
        locataria_profissao: parsedData.locataria_profissao || '',
        locataria_rg: parsedData.locataria_rg || '',
        locataria_cpf: parsedData.locataria_cpf || '',
        locataria_endereco: parsedData.locataria_endereco || '',
        locataria_cidade: parsedData.locataria_cidade || '',
        locataria_estado: parsedData.locataria_estado || '',

        locador_nome: parsedData.locador_nome || '',
        locador_nacionalidade: parsedData.locador_nacionalidade || '',
        locador_estado_civil: parsedData.locador_estado_civil || '',
        locador_profissao: parsedData.locador_profissao || '',
        locador_rg: parsedData.locador_rg || '',
        locador_cpf: parsedData.locador_cpf || '',
        locador_endereco: parsedData.locador_endereco || '',
        locador_cidade: parsedData.locador_cidade || '',
        locador_estado: parsedData.locador_estado || '',

        locadora_nome: parsedData.locadora_nome || '',
        locadora_nacionalidade: parsedData.locadora_nacionalidade || '',
        locadora_estado_civil: parsedData.locadora_estado_civil || '',
        locadora_profissao: parsedData.locadora_profissao || '',
        locadora_rg: parsedData.locadora_rg || '',
        locadora_cpf: parsedData.locadora_cpf || '',
        locadora_endereco: parsedData.locadora_endereco || '',
        locadora_cidade: parsedData.locadora_cidade || '',
        locadora_estado: parsedData.locadora_estado || ''
      };

      try {
        const templateBuffer = base64ToUint8Array(template.content);

        const zip = new PizZip(templateBuffer);
        
        const doc = new Docxtemplater();
        doc.loadZip(zip);
        
        doc.setData(templateData);
        
        doc.render();
        
        const output = doc.getZip().generate({
          type: 'base64',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        const { data: contract, error } = await supabase.functions.invoke('generate-contract', {
          body: { 
            templateId, 
            documentId, 
            title,
            content: output
          }
        });

        if (error) throw error;
        
        if (!contract?.contract) {
          throw new Error('Erro ao salvar contrato');
        }

        toast.success('Contrato gerado com sucesso!');
        return contract.contract;

      } catch (error: any) {
        console.error('Erro ao processar template:', error);
        throw new Error('Erro ao processar template: ' + (error.message || 'Erro desconhecido'));
      }

    } catch (error: any) {
      console.error('Erro ao gerar contrato:', error);
      toast.error('Erro ao gerar contrato: ' + (error.message || 'Erro desconhecido'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateContract
  };
};
