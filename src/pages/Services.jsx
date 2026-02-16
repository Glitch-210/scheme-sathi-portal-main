import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ServiceCard from '@/components/ServiceCard';
import CategoryCard from '@/components/CategoryCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/lib/store';
import { useSchemeStore, serviceCategories, states } from '@/stores/schemeStore';

const ITEMS_PER_PAGE = 24;

const Services = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Pre-fill search from URL query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const { schemes, searchSchemes, filterSchemes } = useSchemeStore();

  const displayedServices = useMemo(() => {
    let result = schemes;
    if (searchQuery) {
      result = searchSchemes(searchQuery);
    } else if (selectedCategory || selectedState) {
      result = filterSchemes({
        category: selectedCategory || undefined,
        state: selectedState || undefined,
      });
    }
    return result;
  }, [searchQuery, selectedCategory, selectedState, schemes, searchSchemes, filterSchemes]);

  const totalPages = Math.ceil(displayedServices.length / ITEMS_PER_PAGE);
  const paginatedServices = displayedServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Compute counts per category for badges
  const categoryCounts = useMemo(() => {
    const counts = {};
    schemes.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [schemes]);

  // Reset page on any filter/search change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
    setCurrentPage(1);
    setSearchQuery('');
  };
  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    setCurrentPage(1);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (<Layout>
    <div className="container py-6 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t('services')}</h1>
        <p className="text-muted-foreground">Browse {schemes.length}+ government schemes and services</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schemes, benefits, categories..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">State</label>
            <select
              value={selectedState}
              onChange={handleStateChange}
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm"
            >
              <option value="">All States</option>
              {states.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); setSearchQuery(''); }}
              className="w-full border rounded-md px-3 py-2 bg-background text-foreground text-sm"
            >
              <option value="">All Categories</option>
              {serviceCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {t(c.nameKey)} ({categoryCounts[c.id] || 0})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Category Cards Grid (only when no search/filter) */}
      {!searchQuery && !selectedCategory && !selectedState && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('categories')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {serviceCategories.map((cat) => (
              <div key={cat.id} onClick={() => handleCategoryChange(cat.id)} className="cursor-pointer">
                <CategoryCard {...cat} count={categoryCounts[cat.id] || 0} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedServices.length} of {displayedServices.length} services
          {selectedCategory && ` in ${selectedCategory.replace(/-/g, ' ')}`}
          {selectedState && ` for ${states.find(s => s.id === selectedState)?.name || selectedState}`}
        </p>
        {selectedCategory && (
          <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}>
            Clear filter
          </Button>
        )}
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Empty State */}
      {displayedServices.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-2">No services found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let page;
            if (totalPages <= 7) {
              page = i + 1;
            } else if (currentPage <= 4) {
              page = i + 1;
            } else if (currentPage >= totalPages - 3) {
              page = totalPages - 6 + i;
            } else {
              page = currentPage - 3 + i;
            }
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-9"
              >
                {page}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  </Layout>);
};

export default Services;
