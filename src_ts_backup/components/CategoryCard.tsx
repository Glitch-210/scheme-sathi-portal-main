import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

interface CategoryCardProps {
  id: string;
  icon: string;
  nameKey: string;
}

const CategoryCard = ({ id, icon, nameKey }: CategoryCardProps) => {
  const { t } = useTranslation();

  return (
    <Link to={`/category/${id}`}>
      <Card className="h-full group cursor-pointer hover:border-primary transition-all duration-200">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {t(nameKey)}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
