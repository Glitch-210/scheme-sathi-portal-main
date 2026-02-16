import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore, useApplicationStore, Application } from '@/lib/store';
import { toast } from 'sonner';

const statusColors: Record<Application['status'], string> = {
  submitted: 'bg-muted text-muted-foreground',
  'in-review': 'bg-primary/20 text-primary',
  approved: 'bg-accent/20 text-accent',
  rejected: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<Application['status'], string> = {
  submitted: 'submitted',
  'in-review': 'inReview',
  approved: 'approved',
  rejected: 'rejected',
};

const Applications = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { getApplicationsByUser, updateStatus } = useApplicationStore();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const applications = getApplicationsByUser(user.id);

  const handleStatusChange = (appId: string, newStatus: Application['status']) => {
    updateStatus(appId, newStatus);
    toast.success(`Status updated to ${newStatus}`);
    // Update selected app if viewing
    if (selectedApp?.id === appId) {
      setSelectedApp((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <Layout>
      <div className="container py-6 md:py-10">
        {!selectedApp ? (
          <>
            <div className="mb-8">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {t('myApplications')}
              </h1>
              <p className="text-muted-foreground mt-1">
                Track and manage your submitted applications
              </p>
            </div>

            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any applications yet.
                  </p>
                  <Link to="/services">
                    <Button>{t('exploreServices')}</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <Card
                    key={app.id}
                    className="cursor-pointer hover:shadow-soft transition-shadow"
                    onClick={() => setSelectedApp(app)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {app.serviceName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{app.id}</span>
                          <span>•</span>
                          <span>{new Date(app.dateApplied).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[app.status]}`}>
                          {t(statusLabels[app.status])}
                        </span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 mb-6"
              onClick={() => setSelectedApp(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Applications
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>{selectedApp.serviceName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedApp.id}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[selectedApp.status]}`}>
                    {t(statusLabels[selectedApp.status])}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('dateApplied')}</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedApp.dateApplied).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium text-foreground capitalize">
                      {selectedApp.category.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                {/* Application Details */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Application Details</h3>
                  <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-foreground">{selectedApp.formData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mobile:</span>
                      <span className="text-foreground">{selectedApp.formData.mobile}</span>
                    </div>
                    {selectedApp.formData.aadhaar && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aadhaar:</span>
                        <span className="text-foreground">
                          XXXX-XXXX-{selectedApp.formData.aadhaar.slice(-4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Demo: Status Simulator */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    Demo: Update Status
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Simulate status changes (for demo purposes only)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(['submitted', 'in-review', 'approved', 'rejected'] as Application['status'][]).map(
                      (status) => (
                        <Button
                          key={status}
                          variant={selectedApp.status === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleStatusChange(selectedApp.id, status)}
                        >
                          {t(statusLabels[status])}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Applications;
