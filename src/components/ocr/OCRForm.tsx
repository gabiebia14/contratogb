
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DocumentRole, DocumentType, MaritalStatus } from '@/types/ocr';

interface OCRFormProps {
  documentType: DocumentRole;
  setDocumentType: (value: DocumentRole) => void;
  documentCategory: DocumentType;
  setDocumentCategory: (value: DocumentType) => void;
  maritalStatus: MaritalStatus;
  setMaritalStatus: (value: MaritalStatus) => void;
  sharedAddress: boolean;
  setSharedAddress: (value: boolean) => void;
  needsGuarantor: boolean;
  setNeedsGuarantor: (value: boolean) => void;
}

const OCRForm = ({
  documentType,
  setDocumentType,
  documentCategory,
  setDocumentCategory,
  maritalStatus,
  setMaritalStatus,
  sharedAddress,
  setSharedAddress,
  needsGuarantor,
  setNeedsGuarantor
}: OCRFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Parte do Documento</Label>
        <Select value={documentType} onValueChange={(value: DocumentRole) => setDocumentType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a parte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="locador">Locador</SelectItem>
            <SelectItem value="locadora">Locadora</SelectItem>
            <SelectItem value="locatario">Locatário</SelectItem>
            <SelectItem value="locataria">Locatária</SelectItem>
            <SelectItem value="fiador">Fiador</SelectItem>
            <SelectItem value="fiadora">Fiadora</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tipo de Documento</Label>
        <Select value={documentCategory} onValueChange={(value: DocumentType) => setDocumentCategory(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="documentos_pessoais">Documentos Pessoais</SelectItem>
            <SelectItem value="comprovante_endereco">Comprovante de Endereço</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Estado Civil</Label>
        <Select value={maritalStatus} onValueChange={(value: MaritalStatus) => setMaritalStatus(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado civil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solteiro">Solteiro(a)</SelectItem>
            <SelectItem value="casado">Casado(a)</SelectItem>
            <SelectItem value="divorciado">Divorciado(a)</SelectItem>
            <SelectItem value="viuvo">Viúvo(a)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {maritalStatus === 'casado' && (
        <div className="flex items-center space-x-2">
          <Switch
            id="shared-address"
            checked={sharedAddress}
            onCheckedChange={setSharedAddress}
          />
          <Label htmlFor="shared-address">Endereço compartilhado com cônjuge</Label>
        </div>
      )}

      {(documentType === 'locatario' || documentType === 'locataria') && (
        <div className="flex items-center space-x-2">
          <Switch
            id="needs-guarantor"
            checked={needsGuarantor}
            onCheckedChange={setNeedsGuarantor}
          />
          <Label htmlFor="needs-guarantor">Necessita de Fiador</Label>
        </div>
      )}
    </div>
  );
};

export default OCRForm;
