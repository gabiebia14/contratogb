import { FileText, Upload, BookOpen, ScanLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function Index() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo ao ContractPro</h1>
        <p className="text-gray-600 mt-1">O que você precisa fazer hoje?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/ocr-documentos">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <ScanLine className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Extrair Documento</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Extraia informações de documentos usando OCR
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/novo-contrato">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Gerar Contrato</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Crie um novo contrato a partir dos modelos
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/modelos-contratos">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <BookOpen className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Modelos de Contratos</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gerencie seus modelos de contratos
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default Index;