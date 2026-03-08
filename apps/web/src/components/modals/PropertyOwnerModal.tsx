import { useState } from 'react';
import { useModal } from '@/context/ModalContext';
import { useSubmitOwnerInquiry } from '@/hooks/useApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function PropertyOwnerModal() {
  const { ownerOpen, closeOwner } = useModal();
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
      toast.success('Thank you! We\'ll be in touch within 24 hours.');
      setFormData({ propertyType: '', location: '', bedrooms: '', name: '', email: '', phone: '' });
      closeOwner();
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={ownerOpen} onOpenChange={closeOwner}>
      <DialogContent className="bg-[#1a1a1c] border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">List Your Property</DialogTitle>
        </DialogHeader>
        
        <p className="text-white/50 text-sm mb-4">
          Tell us about your property and we'll get back to you within 24 hours.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60 text-sm">Property Type</Label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                required
                className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-sm"
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
                placeholder="e.g., Sliema"
                required
                className="mt-1.5 bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-white/60 text-sm">Bedrooms</Label>
            <select
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-sm"
            >
              <option value="" className="bg-[#1a1a1c]">Select bedrooms</option>
              {[1, 2, 3, 4, 5, '6+'].map(n => (
                <option key={n} value={n} className="bg-[#1a1a1c]">{n}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60 text-sm">Your Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1.5 bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white/60 text-sm">Phone</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="mt-1.5 bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-white/60 text-sm">Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1.5 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Inquiry'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
