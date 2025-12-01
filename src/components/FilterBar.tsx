import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, DollarSign } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

type PriceSort = 'asc' | 'desc' | null;

interface FilterBarProps {
  selectedCategories?: string[];
  onCategoriesChange?: (cats: string[]) => void;
  priceSort?: PriceSort;
  onPriceSortChange?: (p: PriceSort) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const FilterBar = ({ selectedCategories = [], onCategoriesChange, priceSort = null, onPriceSortChange, searchQuery = '', onSearchChange }: FilterBarProps) => {
  const { t } = useTranslation();
  const [localCats, setLocalCats] = useState<string[]>(selectedCategories);

  // USE CHAVES CONSISTENTES - não traduza os valores internos
  const categories = [
    { key: 'Todos', label: t('Todos') },
    { key: 'Limpeza', label: t('Limpeza') },
    { key: 'Construção', label: t('Construção') },
    { key: 'Tecnologia', label: t('Tecnologia') },
    { key: 'Beleza', label: t('Beleza') },
    { key: 'Eventos', label: t('Eventos') },
    { key: 'Educação', label: t('Educação') },
    { key: 'Transporte', label: t('Transporte') },
    { key: 'Jardinagem', label: t('Jardinagem') },
  ];

  function toggleCategory(catKey: string) {
    let next: string[];
    if (localCats.includes(catKey)) next = localCats.filter(c => c !== catKey);
    else next = [...localCats, catKey];
    setLocalCats(next);
    onCategoriesChange?.(next);
  }

  function togglePrice() {
    const next: PriceSort = priceSort === 'asc' ? 'desc' : (priceSort === 'desc' ? null : 'asc');
    onPriceSortChange?.(next);
  }

  return (
    <div className="sticky top-16 z-40 bg-card border-b border-border py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
          <Button variant="outline" size="sm" className="gap-2 shrink-0 border-border hover:bg-transparent hover:text-inherit">
            <Filter className="h-4 w-4" />
            {t('Filtros')}
          </Button>

          <div className="h-8 w-px bg-border shrink-0" />

          {/* ATUALIZE AQUI: use category.key internamente e category.label visualmente */}
          {categories.map((category) => (
            <Badge
              key={category.key}
              variant={localCats.includes(category.key) ? "default" : "outline"}
              className={`cursor-pointer shrink-0 px-4 py-2 text-sm ${
                localCats.includes(category.key)
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-darker-gray"
              }`}
              onClick={() => toggleCategory(category.key)}
            >
              {category.label}
            </Badge>
          ))}

          <div className="h-8 w-px bg-border shrink-0" />

          <Button variant={priceSort ? 'default' : 'outline'} size="sm" className="gap-2 shrink-0 border-border" onClick={togglePrice}>
            <DollarSign className="h-4 w-4" />
            {t('Preço')} {priceSort ? (priceSort === 'asc' ? '↑' : '↓') : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;