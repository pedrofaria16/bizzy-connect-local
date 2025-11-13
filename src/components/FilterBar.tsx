import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, MapPin, DollarSign } from "lucide-react";

const categories = [
  "Todos",
  "Limpeza",
  "Construção",
  "Tecnologia",
  "Beleza",
  "Eventos",
  "Educação",
  "Transporte",
  "Jardinagem",
];

const FilterBar = () => {
  return (
    <div className="sticky top-16 z-40 bg-background border-b border-border py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          
          <div className="h-8 w-px bg-border shrink-0" />
          
          {categories.map((category, index) => (
            <Badge
              key={category}
              variant={index === 0 ? "default" : "outline"}
              className={`cursor-pointer shrink-0 px-4 py-2 text-sm transition-all hover:scale-105 ${
                index === 0 
                  ? "bg-primary text-primary-foreground hover:bg-primary-dark" 
                  : "hover:bg-secondary"
              }`}
            >
              {category}
            </Badge>
          ))}
          
          <div className="h-8 w-px bg-border shrink-0" />
          
          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <MapPin className="h-4 w-4" />
            Proximidade
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <DollarSign className="h-4 w-4" />
            Preço
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
