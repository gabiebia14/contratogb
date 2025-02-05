import React from 'react';
import { ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import FileUploadArea from './ocr/FileUploadArea';
import ExtractedDataDisplay from './ocr/ExtractedDataDisplay';
import { useOCR } from '@/hooks/useOCR';
import { OCRFormData, DocumentType, MaritalStatus } from '@/types/ocr';

const OCRPage = () => {
  const form = useForm<OCRFormData>({
    defaultValues: {
      documentType: 'locador',
      maritalStatus: 'solteiro',
      sharedAddress: true,
      hasGuarantor: false
    }
  });

  const {
    selectedFiles,
    processing,
    extractedData,
    handleFilesSelected,
    processFiles
  } = useOCR();

  const watchMaritalStatus = form.watch('maritalStatus');
  const watchHasGuarantor = form.watch('hasGuarantor');

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Documento</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="locador" id="locador" />
                          <Label htmlFor="locador">Locador</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="locatario" id="locatario" />
                          <Label htmlFor="locatario">Locatário</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fiador" id="fiador" />
                          <Label htmlFor="fiador">Fiador</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Estado Civil</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="solteiro" id="solteiro" />
                          <Label htmlFor="solteiro">Solteiro(a)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="casado" id="casado" />
                          <Label htmlFor="casado">Casado(a)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="divorciado" id="divorciado" />
                          <Label htmlFor="divorciado">Divorciado(a)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="viuvo" id="viuvo" />
                          <Label htmlFor="viuvo">Viúvo(a)</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchMaritalStatus === 'casado' && (
                <FormField
                  control={form.control}
                  name="sharedAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Endereço Compartilhado
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          O cônjuge possui o mesmo endereço
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="hasGuarantor"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Incluir Fiador
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        O contrato terá fiador
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadArea onFilesSelected={handleFilesSelected} />
          
          {selectedFiles.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedFiles.length} arquivo(s) selecionado(s)
              </p>
              <Button
                onClick={processFiles}
                disabled={processing}
              >
                {processing ? (
                  <>Processando...</>
                ) : (
                  <>
                    <ScanLine className="mr-2" />
                    Processar Documento
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {extractedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Extraídos</CardTitle>
          </CardHeader>
          <CardContent>
            <ExtractedDataDisplay data={extractedData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OCRPage;