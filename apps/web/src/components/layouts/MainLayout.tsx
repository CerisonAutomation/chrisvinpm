import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactModal } from '@/components/modals/ContactModal';
import { PropertyOwnerModal } from '@/components/modals/PropertyOwnerModal';

export function MainLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <ContactModal />
      <PropertyOwnerModal />
    </>
  );
}
