import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { SectionRenderer } from '@/features/cms/SectionRenderer';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function LandingPage() {
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['cms-page', 'home'],
    queryFn: () => apiGet<any>('/cms/pages/home'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  // Pure CMS-driven layout (Omni-perfect pattern)
  return (
    <div className="bg-[#0F0F10] min-h-screen">
      <Header />
      <main>
        {pageData?.sections ? (
          <SectionRenderer sections={pageData.sections} />
        ) : (
          <div className="py-40 text-center">
            <h1 className="text-4xl font-playfair text-white">Welcome to CVPM</h1>
            <p className="text-muted-foreground mt-4">Page content is being prepared by our editors.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
