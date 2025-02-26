
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PropertyType } from "@/types/properties";
import { LucideIcon } from "lucide-react";

interface PropertyCategoryCardProps {
  type: PropertyType | 'todas';
  label: string;
  icon: LucideIcon;
  gradient: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}

export function PropertyCategoryCard({ 
  type, 
  label, 
  icon: Icon, 
  gradient,
  count, 
  isSelected, 
  onClick 
}: PropertyCategoryCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className={`p-3 md:p-4 bg-gradient-to-br ${gradient} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-lg md:text-xl font-bold">{count}</span>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        <h3 className="text-sm font-medium">{label}</h3>
      </CardContent>
    </Card>
  );
}
