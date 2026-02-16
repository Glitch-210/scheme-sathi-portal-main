import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout/Layout';
import CategoryCard from '@/components/CategoryCard';
import ServiceCard from '@/components/ServiceCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { serviceCategories, services, states, filterServices, searchServices } from '@/lib/services';

const Services = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  let displayedServices = services;

  if (searchQuery) {
    displayedServices = searchServices(searchQuery);
  } else if (selectedCategory || selectedState) {
    displayedServices = filterServices({
      category: selectedCategory || undefined,
      state: selectedState || undefined,
    });
  }

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t('services')}
          </h1>
          <p className="text-muted-foreground">
            Browse and access government services across all categories
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedCategory(null);
              }}
              placeholder={`${t('search')} services...`}
              className="pl-12"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-muted rounded-lg p-4 mb-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full h-12 rounded-lg border-2 border-input bg-card px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedState('');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Categories */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {serviceCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-left"
                >
                  <CategoryCard
                    id={category.id}
                    icon={category.icon}
                    nameKey={category.nameKey}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Category Header */}
        {selectedCategory && (
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              ← Back
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              {t(serviceCategories.find((c) => c.id === selectedCategory)?.nameKey || '')}
            </h2>
          </div>
        )}

        {/* Services List */}
        {(searchQuery || selectedCategory) && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {displayedServices.length} services found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            {displayedServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No services found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Services;
