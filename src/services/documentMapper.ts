
import { DocumentFields } from '@/types/contract-generation';

// Lista padronizada de campos que serão mapeados
const DOCUMENT_FIELDS = [
  'nome', 'nome_completo',
  'nacionalidade', 'estado_civil', 'profissao',
  'cpf', 'rg', 'rg_orgao_emissor',
  'endereco', 'numero', 'complemento',
  'bairro', 'cidade', 'estado', 'cep',
  'email', 'telefone'
];

export const mapDocumentFields = (rawData: any, prefix: string): Record<string, string> => {
  const mappedData: Record<string, string> = {};
  console.log('Mapeando campos com prefixo:', prefix);
  console.log('Dados brutos:', rawData);

  // Mapeamentos especiais para campos que podem ter nomes diferentes
  const fieldMappings: Record<string, string[]> = {
    'nome': ['nome', 'nome_completo', 'name', 'full_name'],
    'cpf': ['cpf', 'cpf_numero', 'documento_cpf'],
    'rg': ['rg', 'rg_numero', 'documento_rg'],
    'rg_orgao_emissor': ['rg_orgao_emissor', 'orgao_emissor', 'rg_emissor'],
    'profissao': ['profissao', 'ocupacao', 'profession'],
    'estado_civil': ['estado_civil', 'estadocivil', 'marital_status'],
    'nacionalidade': ['nacionalidade', 'nationality'],
  };

  DOCUMENT_FIELDS.forEach(field => {
    // Tenta encontrar o valor usando os mapeamentos especiais
    const possibleNames = fieldMappings[field] || [field];
    let foundValue = null;

    // Primeiro tenta com o prefixo
    for (const name of possibleNames) {
      const prefixedKey = `${prefix}${name}`;
      if (rawData[prefixedKey] !== undefined && rawData[prefixedKey] !== null) {
        foundValue = rawData[prefixedKey];
        break;
      }
    }

    // Se não encontrou com prefixo, tenta sem prefixo
    if (foundValue === null) {
      for (const name of possibleNames) {
        if (rawData[name] !== undefined && rawData[name] !== null) {
          foundValue = rawData[name];
          break;
        }
      }
    }

    if (foundValue !== null) {
      // Armazena com o prefixo correto
      mappedData[`${prefix}${field}`] = String(foundValue);
      console.log(`Campo mapeado: ${prefix}${field} = ${foundValue}`);
    } else {
      console.log(`Campo não encontrado: ${field}`);
    }
  });

  return mappedData;
};

export const getPartyPrefix = (role: string): string => {
  // Mapeia os diferentes tipos de papéis para os prefixos corretos
  const roleMappings: Record<string, string> = {
    'locador': 'locador_',
    'locadora': 'locadora_',
    'locatario': 'locatario_',
    'locataria': 'locataria_',
    'fiador': 'fiador_',
    'fiadora': 'fiadora_',
    'arrendador': 'locador_',    // Mapeamento adicional
    'arrendadora': 'locadora_',  // Mapeamento adicional
    'arrendatario': 'locatario_', // Mapeamento adicional
    'arrendataria': 'locataria_'  // Mapeamento adicional
  };

  const prefix = roleMappings[role.toLowerCase()];
  if (!prefix) {
    console.warn(`Papel não reconhecido: ${role}, usando papel padrão`);
    return 'parte_';
  }

  return prefix;
};
