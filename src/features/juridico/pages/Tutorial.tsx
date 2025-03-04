
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";

export default function Tutorial() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tutorial</h1>
      <p className="text-muted-foreground">Aprenda a utilizar todas as funcionalidades do sistema jurídico.</p>
      
      <Tabs defaultValue="contratos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="ia">Inteligência Artificial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contratos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Como Criar um Contrato</CardTitle>
              <CardDescription>
                Aprenda a criar contratos utilizando modelos pré-definidos ou criando do zero.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Passo 1: Selecione um modelo</h3>
                    <p className="text-sm text-muted-foreground">
                      Acesse a seção de modelos e escolha o tipo de contrato que deseja criar.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Passo 2: Preencha os dados</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete os campos necessários com as informações do contrato.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Passo 3: Revise e finalize</h3>
                    <p className="text-sm text-muted-foreground">
                      Verifique se todas as informações estão corretas e finalize a criação.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">Assistir vídeo tutorial</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Documentos</CardTitle>
              <CardDescription>
                Aprenda a gerenciar documentos no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Passo 1: Upload de documentos</h3>
                    <p className="text-sm text-muted-foreground">
                      Faça upload de documentos em PDF, Word ou imagens.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Passo 2: Organização</h3>
                    <p className="text-sm text-muted-foreground">
                      Categorize os documentos por tipo, cliente ou processo.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">Ver exemplo prático</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recursos de IA</CardTitle>
              <CardDescription>
                Aprenda a utilizar as ferramentas de inteligência artificial.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Análise de contratos</h3>
                    <p className="text-sm text-muted-foreground">
                      Utilize a IA para analisar e encontrar possíveis problemas em contratos.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Comparação de documentos</h3>
                    <p className="text-sm text-muted-foreground">
                      Compare diferentes versões de documentos para identificar alterações.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Assistente virtual</h3>
                    <p className="text-sm text-muted-foreground">
                      Utilize o chat para tirar dúvidas jurídicas.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">Experimentar IA</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
