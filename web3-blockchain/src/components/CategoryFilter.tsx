
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full">
      <ScrollArea className="w-full">
        <div className="flex space-x-2 p-1">
          <Button
            onClick={() => onSelectCategory('all')}
            variant={selectedCategory === 'all' ? "default" : "outline"}
            className="rounded-full whitespace-nowrap"
          >
            All NFTs
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="rounded-full whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CategoryFilter;
