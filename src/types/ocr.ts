
export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
}

export type DocumentField = 
  | "Nome completo"
  | "Nacionalidade"
  | "Data de nascimento"
  | "RG"
  | "CPF"
  | "Profissão"
  | "Endereço"
  | "Bairro"
  | "CEP"
  | "Cidade"
  | "Estado"
  | "Telefone";

export type DocumentRole = 'locador' | 'locatario' | 'fiador';
export type DocumentType = 'rg_cpf' | 'comprovante_endereco';
export type MaritalStatus = 'solteiro' | 'casado' | 'divorciado' | 'viuvo';
export type DocumentGender = 'masculino' | 'feminino';

