import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, DollarSign, Handshake } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';

type PriceSort = 'asc' | 'desc' | null;

interface FilterBarProps {
  selectedCategories?: string[];
  onCategoriesChange?: (cats: string[]) => void;
  priceSort?: PriceSort;
  onPriceSortChange?: (p: PriceSort) => void;
  offerFilter?: 'all' | 'request' | 'offer';
  onOfferFilterChange?: (v: 'all' | 'request' | 'offer') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const FilterBar = ({ selectedCategories = [], onCategoriesChange, priceSort = null, onPriceSortChange, offerFilter = 'all', onOfferFilterChange, searchQuery = '', onSearchChange }: FilterBarProps) => {
  const { t } = useTranslation();
  const [localCats, setLocalCats] = useState<string[]>(selectedCategories);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef<number>(0);
  const ticking = useRef<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY || 0;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          // hide when scrolling down, show when scrolling up
          if (currentY > lastY.current && currentY > 100) {
            setHidden(true);
          } else if (currentY < lastY.current) {
            setHidden(false);
          }
          lastY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    // single-select behavior: selecting a category clears the others
    let next: string[];
    if (catKey === 'Todos') {
      next = ['Todos'];
    } else {
      // if the clicked category is already the only one selected, go back to 'Todos'
      if (localCats.length === 1 && localCats[0] === catKey) next = ['Todos'];
      else next = [catKey];
    }
    setLocalCats(next);
    onCategoriesChange?.(next);
  }

  function togglePrice() {
    const next: PriceSort = priceSort === 'asc' ? 'desc' : (priceSort === 'desc' ? null : 'asc');
    onPriceSortChange?.(next);
  }

  // cycle through offer filters: all -> request -> offer -> all
  function toggleOfferFilter() {
    const next = offerFilter === 'all' ? 'request' : (offerFilter === 'request' ? 'offer' : 'all');
    onOfferFilterChange?.(next);
  }

  return (
    <div>
      <div
        className={`fixed left-0 right-0 top-16 sm:top-16 z-40 bg-card border-b border-border h-20 sm:h-16 transition-transform duration-200 ease-in-out will-change-transform ${hidden ? '-translate-y-full pointer-events-none' : 'translate-y-0'}`}
      >
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-center gap-3 overflow-x-auto h-full">
          <div className="flex items-center gap-2 shrink-0 px-3 py-2 text-sm text-darker-gray select-none">
            <Filter className="h-4 w-4" />
            <span>{t('Filtros')}</span>
          </div>

          <div className="h-8 w-px bg-border shrink-0" />

          {/* ATUALIZE AQUI: use category.key internamente e category.label visualmente */}
          {categories.map((category) => (
            <Badge
              key={category.key}
              variant={localCats.includes(category.key) ? "default" : "outline"}
              className={`cursor-pointer shrink-0 px-4 py-2 text-sm transition duration-150 ease-in-out ${
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

          <Button variant={priceSort ? 'default' : 'outline'} size="sm" className="gap-2 shrink-0 border-border hover:scale-100 active:scale-100" onClick={togglePrice}>
            <DollarSign className="h-4 w-4" />
            {t('Preço')} {priceSort ? (priceSort === 'asc' ? '↑' : '↓') : ''}
          </Button>

          <Button variant={offerFilter && offerFilter !== 'all' ? 'default' : 'outline'} size="sm" className="gap-2 shrink-0 border-border hover:scale-100 active:scale-100" onClick={toggleOfferFilter}>
            <Handshake className="h-4 w-4" />
            {offerFilter === 'request' ? t('Solicita') : offerFilter === 'offer' ? t('Oferece') : t('Todos')}
          </Button>
          </div>
        </div>
      </div>
      {/* spacer to preserve layout since the filter bar is fixed */}
      <div className="h-20 sm:h-16" aria-hidden />
    </div>
  );
};

export default FilterBar;