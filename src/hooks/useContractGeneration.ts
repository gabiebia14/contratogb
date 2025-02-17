
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const processTemplate = (template: string, variables: Record<string, any>) => {
    let processedContent = template;

    // Substitui todas as variáveis encontradas no template
    Object.entries(variables).forEach(([key, value]) => {
      // Remove as chaves ao redor da variável
      const variableName = key.replace(/[{}]/g, '');
      // Cria um regex que busca a variável com as chaves
      const regex = new RegExp(`{${variableName}}`, 'g');
      // Substitui todas as ocorrências pela string do valor
      processedContent = processedContent.replace(regex, value ? String(value) : '');
    });

    return processedContent;
  };

  const generateContract = async (templateId: string, documentId: string, title: string) => {
    setLoading(true);
    try {
      // Busca o template
      const { data: template } = await supabase
        .from('contract_templates')
        .select('content')
        .eq('id', templateId)
        .single();

      if (!template) {
        throw new Error('Template não encontrado');
      }

      // Busca o documento e seus dados extraídos
      const { data: document } = await supabase
        .from('processed_documents')
        .select('extracted_data')
        .eq('id', documentId)
        .single();

      if (!document) {
        throw new Error('Documento não encontrado');
      }

      // Processa os dados extraídos
      const rawData = typeof document.extracted_data === 'string'
        ? JSON.parse(document.extracted_data)
        : document.extracted_data;

      // Normaliza os dados para garantir que temos todas as variáveis possíveis
      const variables = {
        // Dados básicos
        nome_completo: rawData.nome_completo || '',
        cpf: rawData.cpf || '',
        rg: rawData.rg || '',
        nacionalidade: rawData.nacionalidade || '',
        estado_civil: rawData.estado_civil || '',
        profissao: rawData.profissao || '',
        
        // Dados de locador
        locador_nome: rawData.locador_nome || rawData.nome_completo || '',
        locador_cpf: rawData.locador_cpf || rawData.cpf || '',
        locador_rg: rawData.locador_rg || rawData.rg || '',
        locador_nacionalidade: rawData.locador_nacionalidade || rawData.nacionalidade || '',
        locador_estado_civil: rawData.locador_estado_civil || rawData.estado_civil || '',
        locador_profissao: rawData.locador_profissao || rawData.profissao || '',
        locador_endereco: rawData.locador_endereco || rawData.endereco || '',
        locador_bairro: rawData.locador_bairro || '',
        locador_cidade: rawData.locador_cidade || '',
        locador_estado: rawData.locador_estado || '',
        locador_cep: rawData.locador_cep || '',
        
        // Dados de locatário
        locatario_nome: rawData.locatario_nome || '',
        locatario_cpf: rawData.locatario_cpf || '',
        locatario_rg: rawData.locatario_rg || '',
        locatario_nacionalidade: rawData.locatario_nacionalidade || '',
        locatario_estado_civil: rawData.locatario_estado_civil || '',
        locatario_profissao: rawData.locatario_profissao || '',
        locatario_endereco: rawData.locatario_endereco || '',
        locatario_bairro: rawData.locatario_bairro || '',
        locatario_cidade: rawData.locatario_cidade || '',
        locatario_estado: rawData.locatario_estado || '',
        locatario_cep: rawData.locatario_cep || '',

        // Dados de fiador
        fiador_nome: rawData.fiador_nome || '',
        fiador_cpf: rawData.fiador_cpf || '',
        fiador_rg: rawData.fiador_rg || '',
        fiador_nacionalidade: rawData.fiador_nacionalidade || '',
        fiador_estado_civil: rawData.fiador_estado_civil || '',
        fiador_profissao: rawData.fiador_profissao || '',
        fiador_endereco: rawData.fiador_endereco || '',
        fiador_bairro: rawData.fiador_bairro || '',
        fiador_cidade: rawData.fiador_cidade || '',
        fiador_estado: rawData.fiador_estado || '',
        fiador_cep: rawData.fiador_cep || '',
        
        // Dados de pessoa jurídica
        cnpj: rawData.cnpj || '',
        razao_social: rawData.razao_social || '',
        
        // Outros campos comuns
        email: rawData.email || '',
        telefone: rawData.telefone || '',
        ...rawData // Inclui quaisquer outros campos que possam existir
      };

      console.log('Template original:', template.content);
      console.log('Variáveis para substituição:', variables);
      
      // Processa o template substituindo as variáveis
      const processedContent = processTemplate(template.content, variables);
      
      console.log('Conteúdo processado:', processedContent);

      // Cria o contrato com o conteúdo processado
      const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
          title,
          content: processedContent,
          template_id: templateId,
          document_id: documentId,
          variables: variables,
          status: 'draft',
          metadata: {
            source: 'web-interface',
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;

      return contract;
    } catch (error) {
      console.error('Erro ao gerar contrato:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateContract };
};
