import { Badge } from "./ui/badge";

const categories = [
  "All",
  "Community",
  "Education", 
  "Healthcare",
  "Environment",
  "Arts & Culture",
  "Sports",
  "Emergency",
  "Animal Welfare"
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="font-semibold mb-4">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge 
            key={category}
            variant={category === selectedCategory ? "default" : "outline"}
            className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
