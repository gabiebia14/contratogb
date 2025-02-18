
export interface ContractParty {
  role: string;
  documentId: string;
}

export interface DocumentFields {
  nome?: string;
  nome_completo?: string;
  cpf?: string;
  rg?: string;
  nacionalidade?: string;
  estado_civil?: string;
  profissao?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  email?: string;
  telefone?: string;
  [key: string]: string | undefined;
}

export interface ContractVariables {
  [key: string]: string;
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  variables: string[];
}
