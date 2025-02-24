
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PropertyType } from "@/types/properties";
import { LucideIcon } from "lucide-react";

interface PropertyCategoryCardProps {
  type: PropertyType | 'todas';
  label: string;
  icon: LucideIcon;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}

export function PropertyCategoryCard({ 
  type, 
  label, 
  icon: Icon, 
  count, 
  isSelected, 
  onClick 
}: PropertyCategoryCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 ${
        isSelected ? 'border-primary shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <Icon className="w-6 h-6" />
          <span className="text-2xl font-bold">{count}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h3 className="font-medium">{label}</h3>
      </CardContent>
    </Card>
  );
}
