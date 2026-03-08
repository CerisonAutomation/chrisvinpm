import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/firebase';
import { ModalProvider } from '@/context/ModalContext';
import { CMSProvider } from '@/context/CMSContext';

// Layouts
import { MainLayout } from '@/components/layouts/MainLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { PropertiesPage } from '@/pages/PropertiesPage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ConfirmationPage } from '@/pages/ConfirmationPage';
import { PropertyOwnersPage } from '@/pages/PropertyOwnersPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { CMSEditorPage } from '@/pages/admin/CMSEditorPage';

function App() {
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  return (
    <CMSProvider>
      <ModalProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            {/* Admin Routes - No header/footer */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminPage />} />
              <Route path="cms" element={<CMSEditorPage />} />
              <Route path="cms/:pageSlug" element={<CMSEditorPage />} />
            </Route>

            {/* Public Routes - With header/footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/en" element={<LandingPage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/en/properties" element={<PropertiesPage />} />
              <Route path="/property/:id" element={<PropertyDetailPage />} />
              <Route path="/en/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/checkout/:quoteId" element={<CheckoutPage />} />
              <Route path="/en/checkout/:quoteId" element={<CheckoutPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/en/confirmation" element={<ConfirmationPage />} />
              <Route path="/property-owners" element={<PropertyOwnersPage />} />
              <Route path="/for-owners" element={<PropertyOwnersPage />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </ModalProvider>
    </CMSProvider>
  );
}

export default App;
