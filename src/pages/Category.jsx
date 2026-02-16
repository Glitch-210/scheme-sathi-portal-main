import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout/Layout';
import ServiceCard from '@/components/ServiceCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { serviceCategories, getServicesByCategory } from '@/lib/services';
const Category = () => {
    const { categoryId } = useParams();
    const { t } = useTranslation();
    const { isAuthenticated } = useAuthStore();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }
    const category = serviceCategories.find((c) => c.id === categoryId);
    const services = categoryId ? getServicesByCategory(categoryId) : [];
    if (!category) {
        return <Navigate to="/services" replace/>;
    }
    return (<Layout>
      <div className="container py-6 md:py-10">
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4"/>
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {t(category.nameKey)}
              </h1>
              <p className="text-muted-foreground">
                {services.length} services available
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (<ServiceCard key={service.id} service={service}/>))}
        </div>

        {services.length === 0 && (<div className="text-center py-12">
            <p className="text-muted-foreground">No services found in this category</p>
          </div>)}
      </div>
    </Layout>);
};
export default Category;
