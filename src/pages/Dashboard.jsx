import { Link, Navigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import CategoryCard from '@/components/CategoryCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore, useApplicationStore } from '@/lib/store';
import { useSchemeStore, serviceCategories } from '@/stores/schemeStore';
import { calculateMetrics, getMonthlyActivity, getStatusDistribution } from '@/lib/analytics';
import StatsCards from '@/components/Dashboard/StatsCards';
import AnalyticsCharts from '@/components/Dashboard/AnalyticsCharts';

const statusColors = {
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'in-review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  verification: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAuthChecking } = useAuthStore();
  const { getApplicationsByUser } = useApplicationStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { applications, analytics } = useMemo(() => {
    if (!user) return { applications: [], analytics: null };

    const userApps = getApplicationsByUser(user.id);

    // Sort by date (newest first)
    const sortedApps = [...userApps].sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));

    // Analytics
    const metrics = calculateMetrics(sortedApps);
    const monthlyData = getMonthlyActivity(sortedApps);
    const statusData = getStatusDistribution(sortedApps);

    return {
      applications: sortedApps,
      analytics: { metrics, monthlyData, statusData }
    };
  }, [user, getApplicationsByUser]);

  const { searchSchemes } = useSchemeStore();

  if (isAuthChecking) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const recentApplications = applications.slice(0, 5); // Show 5 recent
  const searchResults = searchQuery ? searchSchemes(searchQuery).slice(0, 5) : [];

  return (<Layout>
    <div className="container py-6 md:py-10 space-y-10">
      {/* Section 1: Welcome & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            {t('welcomeBack')}, {user.fullName.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your applications.
          </p>
        </div>

        {/* Compact Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${t('search')} services...`}
            className="pl-10 h-10"
          />
          {searchResults.length > 0 && (<div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-soft z-10">
            {searchResults.map((service) => (<Link key={service.id} to={`/service/${service.id}`} className="block px-4 py-3 hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg" onClick={() => setSearchQuery('')}>
              <p className="font-medium text-foreground">{service.name}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {service.description}
              </p>
            </Link>))}
          </div>)}
        </div>
      </div>

      {/* Section 2: Key Metrics */}
      {analytics && <StatsCards metrics={analytics.metrics} />}

      {/* Section 3: Analytics Graphs */}
      {analytics && <AnalyticsCharts monthlyData={analytics.monthlyData} statusData={analytics.statusData} />}

      {/* Section 4: Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">{t('recentApplications')} ({applications.length})</h2>
          <Link to="/applications" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentApplications.length > 0 ? (
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <Link key={app.id} to={`/applications/${app.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group border-l-4"
                  style={{ borderLeftColor: app.status === 'approved' ? '#22c55e' : app.status === 'rejected' ? '#ef4444' : app.status === 'in-review' ? '#eab308' : '#3b82f6' }}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">{app.serviceName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {app.id} • {new Date(app.dateApplied).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[app.status] || statusColors.submitted}`}>
                        {t(app.status === 'in-review' ? 'inReview' : app.status)}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform hidden sm:block" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">You haven't submitted any applications yet.</p>
            <Link to="/services">
              <Button variant="link">Explore Services</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Section 5: Categories */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Explore Categories</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {serviceCategories.map((category) => (<CategoryCard key={category.id} id={category.id} icon={category.icon} nameKey={category.nameKey} small />))}
        </div>
      </div>
    </div>
  </Layout>);
};
export default Dashboard;
