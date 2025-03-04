
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [contractAlerts, setContractAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const handleSaveSettings = () => {
    toast.success("Configurações salvas com sucesso!");
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Notificações por E-mail</Label>
              <Switch 
                id="email-notifications" 
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="contract-alerts">Alertas de Contratos</Label>
              <Switch 
                id="contract-alerts" 
                checked={contractAlerts}
                onCheckedChange={setContractAlerts}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Modo Escuro</Label>
              <Switch 
                id="dark-mode" 
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue="usuario@exemplo.com" />
            </div>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" defaultValue="Usuário Exemplo" />
            </div>
            <Button onClick={handleSaveSettings}>Salvar Configurações</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
