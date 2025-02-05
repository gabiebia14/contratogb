export type DocumentType = 'locador' | 'locatario' | 'fiador';
export type MaritalStatus = 'solteiro' | 'casado' | 'divorciado' | 'viuvo';

export interface PersonData {
  nome: string;
  nacionalidade: string;
  estado_civil: MaritalStatus;
  profissao: string;
  rg: string;
  cpf: string;
  endereco: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  telefone?: string;
}

export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
}

export interface OCRFormData {
  documentType: DocumentType;
  maritalStatus: MaritalStatus;
  sharedAddress: boolean;
  hasGuarantor: boolean;
}