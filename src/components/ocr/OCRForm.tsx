import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface OCRFormProps {
  documentType: 'locador' | 'locatario' | 'fiador';
  setDocumentType: (value: 'locador' | 'locatario' | 'fiador') => void;
  maritalStatus: 'solteiro' | 'casado' | 'divorciado' | 'viuvo';
  setMaritalStatus: (value: 'solteiro' | 'casado' | 'divorciado' | 'viuvo') => void;
  sharedAddress: boolean;
  setSharedAddress: (value: boolean) => void;
  needsGuarantor: boolean;
  setNeedsGuarantor: (value: boolean) => void;
}

const OCRForm = ({
  documentType,
  setDocumentType,
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
        <Label>Tipo de Documento</Label>
        <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="locador">Locador</SelectItem>
            <SelectItem value="locatario">Locatário</SelectItem>
            <SelectItem value="fiador">Fiador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Estado Civil</Label>
        <Select value={maritalStatus} onValueChange={(value: any) => setMaritalStatus(value)}>
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

      {documentType === 'locatario' && (
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