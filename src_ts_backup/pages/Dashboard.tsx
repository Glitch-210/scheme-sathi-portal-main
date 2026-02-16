import { Link, Navigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import CategoryCard from '@/components/CategoryCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore, useApplicationStore } from '@/lib/store';
import { serviceCategories, searchServices } from '@/lib/services';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { getApplicationsByUser } = useApplicationStore();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const applications = getApplicationsByUser(user.id);
  const recentApplications = applications.slice(0, 3);
  const searchResults = searchQuery ? searchServices(searchQuery).slice(0, 5) : [];

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t('welcomeBack')}, {user.fullName.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            What would you like to do today?
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${t('search')} services...`}
            className="pl-12 h-14 text-lg"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-soft z-10">
              {searchResults.map((service) => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  className="block px-4 py-3 hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => setSearchQuery('')}
                >
                  <p className="font-medium text-foreground">{service.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {service.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">{t('quickActions')}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/services">
              <Button variant="secondary" className="gap-2">
                🔍 Browse All Services
              </Button>
            </Link>
            <Link to="/applications">
              <Button variant="secondary" className="gap-2">
                📋 Track Applications
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="secondary" className="gap-2">
                👤 My Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Service Categories */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">{t('exploreServices')}</h2>
            <Link to="/services" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {serviceCategories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                icon={category.icon}
                nameKey={category.nameKey}
              />
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        {recentApplications.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">{t('recentApplications')}</h2>
              <Link to="/applications" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{app.serviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.id} • {new Date(app.dateApplied).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'approved' ? 'bg-accent/20 text-accent' :
                      app.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                      app.status === 'in-review' ? 'bg-primary/20 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {t(app.status === 'in-review' ? 'inReview' : app.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
