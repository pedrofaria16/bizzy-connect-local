import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, DollarSign } from "lucide-react";
import { useState } from "react";

type PriceSort = 'asc' | 'desc' | null;

interface FilterBarProps {
  selectedCategories?: string[];
  onCategoriesChange?: (cats: string[]) => void;
  priceSort?: PriceSort;
  onPriceSortChange?: (p: PriceSort) => void;
}

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

const FilterBar = ({ selectedCategories = [], onCategoriesChange, priceSort = null, onPriceSortChange }: FilterBarProps) => {
  const [localCats, setLocalCats] = useState<string[]>(selectedCategories);

  function toggleCategory(cat: string) {
    let next: string[];
    if (localCats.includes(cat)) next = localCats.filter(c => c !== cat);
    else next = [...localCats, cat];
    setLocalCats(next);
    onCategoriesChange?.(next);
  }

  function togglePrice() {
    const next: PriceSort = priceSort === 'asc' ? 'desc' : (priceSort === 'desc' ? null : 'asc');
    onPriceSortChange?.(next);
  }

  // no proximity control (removed)

  return (
    <div className="sticky top-16 z-40 bg-card border-b border-border py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
          <Button variant="outline" size="sm" className="gap-2 shrink-0 border-border hover:bg-transparent hover:text-inherit">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>

          <div className="h-8 w-px bg-border shrink-0" />

          {categories.map((category) => (
            <Badge
              key={category}
              variant={localCats.includes(category) ? "default" : "outline"}
              className={`cursor-pointer shrink-0 px-4 py-2 text-sm ${
                localCats.includes(category)
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-darker-gray"
              }`}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </Badge>
          ))}

          <div className="h-8 w-px bg-border shrink-0" />

          <Button variant={priceSort ? 'default' : 'outline'} size="sm" className="gap-2 shrink-0 border-border" onClick={togglePrice}>
            <DollarSign className="h-4 w-4" />
            Preço {priceSort ? (priceSort === 'asc' ? '↑' : '↓') : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
