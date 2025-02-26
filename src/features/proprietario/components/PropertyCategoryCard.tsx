
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
      <CardHeader className={`p-2 md:p-3 bg-gradient-to-br ${gradient} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="text-base md:text-lg font-bold">{count}</span>
        </div>
      </CardHeader>
      <CardContent className="p-2 md:p-3">
        <h3 className="text-xs md:text-sm font-medium truncate">{label}</h3>
      </CardContent>
    </Card>
  );
}
