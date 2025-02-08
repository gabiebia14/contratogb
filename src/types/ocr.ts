
export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
}

export type DocumentRole = 
  | 'locador' 
  | 'locadora'
  | 'locatario' 
  | 'locataria'
  | 'fiador' 
  | 'fiadora';

export type DocumentType = 'documentos_pessoais' | 'comprovante_endereco';
export type MaritalStatus = 'solteiro' | 'casado' | 'divorciado' | 'viuvo';
export type DocumentGender = 'masculino' | 'feminino';

