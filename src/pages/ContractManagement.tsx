import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Clock } from "lucide-react"

const ContractManagement = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Gestão de Contratos</h2>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Contratos Ativos</TabsTrigger>
          <TabsTrigger value="expiring">Vencendo em Breve</TabsTrigger>
          <TabsTrigger value="expired">Vencidos</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid gap-4">
            {[1, 2, 3].map((contract) => (
              <Card key={contract} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold mb-2">Contrato de Prestação de Serviços #{contract}</h3>
                    <p className="text-sm text-gray-500 mb-1">Cliente: Empresa ABC Ltda</p>
                    <p className="text-sm text-gray-500">Início: 01/01/2024 | Término: 31/12/2024</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Ativo
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expiring">
          <div className="grid gap-4">
            {[1, 2].map((contract) => (
              <Card key={contract} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Contrato de Locação #{contract}</h3>
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Cliente: XYZ Corporação</p>
                    <p className="text-sm text-gray-500">Vence em: 15 dias</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    Vencendo em Breve
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expired">
          <div className="grid gap-4">
            <Card className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Contrato de Parceria #123</h3>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Cliente: Tech Solutions SA</p>
                  <p className="text-sm text-gray-500">Vencido há: 5 dias</p>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  Vencido
                </span>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ContractManagement