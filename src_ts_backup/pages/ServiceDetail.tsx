import { useState } from 'react';
import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore, useApplicationStore, useNotificationStore } from '@/lib/store';
import { getServiceById } from '@/lib/services';
import { toast } from 'sonner';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { addApplication } = useApplicationStore();
  const { addNotification } = useNotificationStore();
  
  const [step, setStep] = useState<'info' | 'form' | 'documents' | 'confirm' | 'success'>('info');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    aadhaar: '',
    address: '',
    additionalInfo: '',
  });
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [applicationId, setApplicationId] = useState('');

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const service = serviceId ? getServiceById(serviceId) : undefined;

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDocUpload = (docName: string) => {
    // Simulate document upload
    if (!uploadedDocs.includes(docName)) {
      setUploadedDocs((prev) => [...prev, docName]);
      toast.success(`${docName} uploaded successfully`);
    }
  };

  const handleSubmit = () => {
    const app = addApplication({
      userId: user.id,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      formData: { ...formData, documents: uploadedDocs },
    });
    
    setApplicationId(app.id);
    
    // Add notification
    addNotification({
      userId: user.id,
      title: 'Application Submitted',
      message: `Your application for ${service.name} has been submitted successfully. Application ID: ${app.id}`,
      type: 'status',
      read: false,
    });
    
    setStep('success');
  };

  return (
    <Layout>
      <div className="container py-6 md:py-10 max-w-3xl">
        {step === 'info' && (
          <>
            <Link to="/services">
              <Button variant="ghost" size="sm" className="gap-2 mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Services
              </Button>
            </Link>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Eligibility</h3>
                  <p className="text-muted-foreground">{service.eligibility}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Required Documents</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {service.documents.map((doc) => (
                      <li key={doc}>{doc}</li>
                    ))}
                  </ul>
                </div>

                <Button onClick={() => setStep('form')} className="w-full" size="lg">
                  {t('apply')}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {step === 'form' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setStep('info')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <CardTitle>Step 1: Personal Details</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{service.name}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t('fullName')} *
                </label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name as per Aadhaar"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t('mobileNumber')} *
                </label>
                <Input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  readOnly
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t('email')}
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Aadhaar Number *
                </label>
                <Input
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleInputChange}
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Address *
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Additional Information
                </label>
                <Input
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  placeholder="Any other relevant information"
                />
              </div>

              <Button onClick={() => setStep('documents')} className="w-full">
                {t('next')}: Upload Documents
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'documents' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setStep('form')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <CardTitle>Step 2: Upload Documents</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{service.name}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  📂 <strong>DigiLocker Integration:</strong> Select documents from your DigiLocker or upload manually.
                </p>
              </div>

              {service.documents.map((doc) => (
                <div
                  key={doc}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-foreground">{doc}</span>
                  </div>
                  {uploadedDocs.includes(doc) ? (
                    <div className="flex items-center gap-2 text-accent">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDocUpload(doc)}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                  )}
                </div>
              ))}

              <Button onClick={() => setStep('confirm')} className="w-full">
                {t('next')}: Review & Submit
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'confirm' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setStep('documents')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <CardTitle>Step 3: Review & Submit</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{service.name}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Personal Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="text-foreground">{formData.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aadhaar:</span>
                    <span className="text-foreground">XXXX-XXXX-{formData.aadhaar.slice(-4)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Documents Uploaded</h3>
                <div className="flex flex-wrap gap-2">
                  {uploadedDocs.map((doc) => (
                    <span key={doc} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
                      ✓ {doc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  By submitting this application, you confirm that all information provided is accurate and complete.
                </p>
              </div>

              <Button onClick={handleSubmit} className="w-full" variant="hero">
                {t('submit')} Application
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Application Submitted!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your application has been submitted successfully.
              </p>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">{t('applicationId')}</p>
                <p className="text-xl font-bold text-primary">{applicationId}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/applications">
                  <Button variant="outline">Track Application</Button>
                </Link>
                <Link to="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ServiceDetail;
