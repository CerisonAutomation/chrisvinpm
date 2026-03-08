import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@/context/ModalContext';
import { useSubmitOwnerInquiry } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Home, TrendingUp, Shield, Users, Clock, Award,
  CheckCircle, ArrowRight, Loader2, Phone
} from 'lucide-react';

function BenefitCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-amber-500" />
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export function PropertyOwnersPage() {
  const navigate = useNavigate();
  const { openContact } = useModal();
  const submitInquiry = useSubmitOwnerInquiry();
  
  const [formData, setFormData] = useState({
    propertyType: '',
    location: '',
    bedrooms: '',
    name: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitInquiry.mutateAsync(formData);
      toast.success('Thank you! We\'ll be in touch shortly.');
      setFormData({ propertyType: '', location: '', bedrooms: '', name: '', email: '', phone: '' });
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
            alt="Luxury home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/60" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-amber-400 text-sm font-medium tracking-widest uppercase mb-4">For Property Owners</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Maximize Your Property's Potential
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Join Malta's premier property management company. We handle everything from 
              marketing to guest services, so you can enjoy worry-free passive income.
            </p>
            <div className="flex gap-4">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium px-8 h-12">
                List Your Property
              </Button>
              <Button onClick={openContact} variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12">
                <Phone className="w-4 h-4 mr-2" />
                Talk to Us
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-500 text-sm font-medium tracking-widest uppercase mb-4">Why Partner With Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">The CVPM Advantage</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard
              icon={TrendingUp}
              title="Maximize Revenue"
              description="Our dynamic pricing strategy and marketing expertise ensure optimal occupancy and rates."
            />
            <BenefitCard
              icon={Shield}
              title="Property Protection"
              description="Comprehensive guest screening, security deposits, and property insurance coverage."
            />
            <BenefitCard
              icon={Users}
              title="Guest Management"
              description="24/7 guest support, check-in services, and professional cleaning after every stay."
            />
            <BenefitCard
              icon={Clock}
              title="Time Freedom"
              description="We handle all day-to-day operations. Enjoy passive income without the hassle."
            />
            <BenefitCard
              icon={Award}
              title="Premium Marketing"
              description="Professional photography, listing optimization, and multi-platform distribution."
            />
            <BenefitCard
              icon={Home}
              title="Property Care"
              description="Regular inspections, maintenance coordination, and property improvements."
            />
          </div>
        </div>
      </section>
      
      {/* Inquiry Form */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Get Started Today</h2>
            <p className="text-white/50">Fill out the form below and we'll get back to you within 24 hours</p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white/60 text-sm">Property Type</Label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  required
                  className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="" className="bg-[#1a1a1c]">Select type</option>
                  <option value="apartment" className="bg-[#1a1a1c]">Apartment</option>
                  <option value="house" className="bg-[#1a1a1c]">House</option>
                  <option value="villa" className="bg-[#1a1a1c]">Villa</option>
                  <option value="penthouse" className="bg-[#1a1a1c]">Penthouse</option>
                </select>
              </div>
              <div>
                <Label className="text-white/60 text-sm">Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Sliema, Valletta"
                  required
                  className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
                />
              </div>
              <div>
                <Label className="text-white/60 text-sm">Bedrooms</Label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="" className="bg-[#1a1a1c]">Select bedrooms</option>
                  {[1, 2, 3, 4, 5, '6+'].map(n => (
                    <option key={n} value={n} className="bg-[#1a1a1c]">{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-white/60 text-sm">Your Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
                />
              </div>
              <div>
                <Label className="text-white/60 text-sm">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
                />
              </div>
              <div>
                <Label className="text-white/60 text-sm">Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={submitting}
              className="w-full mt-8 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold h-12 rounded-xl"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Inquiry'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
