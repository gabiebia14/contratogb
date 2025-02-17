
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
  try {
    // Remove possíveis cabeçalhos de data URI e espaços em branco
    const cleanBase64 = base64.replace(/^data:.*?;base64,/, '').trim();
    
    if (!cleanBase64) {
      throw new Error('Conteúdo base64 vazio');
    }

    // Decodifica o base64 diretamente para um array de bytes
    const binary = window.atob(cleanBase64);
    const bytes = new Uint8Array(binary.length);
    
    // Converte cada caractere em seu valor ASCII
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i) & 0xFF; // Garante que pegamos apenas os 8 bits menos significativos
    }
    
    return bytes;
  } catch (error) {
    console.error('Erro ao decodificar base64:', error);
    
    // Tenta uma abordagem alternativa usando TextEncoder
    try {
      const decoder = new TextDecoder('utf-8');
      const encoder = new TextEncoder();
      const decodedBase64 = window.atob(cleanBase64);
      const decodedText = decoder.decode(encoder.encode(decodedBase64));
      return encoder.encode(decodedText);
    } catch (alternativeError) {
      console.error('Erro na abordagem alternativa:', alternativeError);
      throw new Error('Erro ao decodificar conteúdo do template: Formato inválido ou caracteres não suportados');
    }
  }
}

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const generateContract = async (templateId: string, documentId: string, title: string) => {
    setLoading(true);
    try {
      const [templateResult, documentResult] = await Promise.all([
        supabase
          .from('contract_templates')
          .select('*')
          .eq('id', templateId)
          .single(),
        supabase
          .from('processed_documents')
          .select('*')
          .eq('id', documentId)
          .single()
      ]);

      if (templateResult.error) throw new Error('Erro ao buscar template');
      if (documentResult.error) throw new Error('Erro ao buscar documento');

      const template = templateResult.data;
      const document = documentResult.data;

      if (!template.content) {
        throw new Error('Template não possui conteúdo');
      }

      console.log('Template content length:', template.content.length);

      let documentData: ExtractedData = {};
      try {
        const parsedData: ExtractedData = typeof document.extracted_data === 'string' 
          ? JSON.parse(document.extracted_data) 
          : document.extracted_data;

        documentData = {
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
          locadora_estado: parsedData.locadora_estado || '',
        };

        console.log('Dados formatados para o template:', documentData);
      } catch (error) {
        console.error('Erro ao processar dados do documento:', error);
        toast.error('Erro ao processar dados do documento');
        return;
      }

      try {
        const templateContent = base64ToUint8Array(template.content);
        
        const zip = new PizZip(templateContent);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          delimiters: { start: '{', end: '}' }
        });
        
        console.log('Template carregado, aplicando dados...');
        
        doc.setData(documentData);

        console.log('Renderizando documento...');
        
        doc.render();

        const processedContent = doc.getZip().generate({
          type: 'base64',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        console.log('Documento processado, salvando contrato...');
        
        const { data: contract, error } = await supabase.functions.invoke('generate-contract', {
          body: { 
            templateId, 
            documentId, 
            title,
            content: processedContent
          }
        });

        if (error) throw error;

        if (!contract?.contract) {
          throw new Error('Erro ao gerar contrato');
        }

        toast.success('Contrato gerado com sucesso!');
        return contract.contract;
      } catch (error: any) {
        console.error('Erro ao processar template:', error);
        if (error.properties && error.properties.errors) {
          console.log('Erros detalhados:', error.properties.errors);
          console.log('Tags não resolvidas:', error.properties.paragraphParts);
        }
        throw new Error('Erro ao processar template: ' + (error.message || 'Erro desconhecido'));
      }
    } catch (error: any) {
      console.error('Error generating contract:', error);
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
