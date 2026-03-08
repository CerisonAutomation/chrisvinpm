import { useState } from 'react';
import { useModal } from '@/context/ModalContext';
import { useSubmitContact } from '@/hooks/useApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Phone, Mail, MapPin } from 'lucide-react';

export function ContactModal() {
  const { contactOpen, closeContact } = useModal();
  const submitContact = useSubmitContact();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContact.mutateAsync(formData);
      toast.success('Message sent! We\'ll be in touch shortly.');
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      closeContact();
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={contactOpen} onOpenChange={closeContact}>
      <DialogContent className="bg-[#1a1a1c] border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Contact Us</DialogTitle>
        </DialogHeader>
        
        {/* Contact Info */}
        <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-4">
          <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-amber-500" /> +356 7979 0202</span>
          <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-amber-500" /> info@cvpm.mt</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60 text-sm">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1.5 bg-white/5 border-white/10 text-white"
              />
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
          </div>
          <div>
            <Label className="text-white/60 text-sm">Phone (optional)</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1.5 bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-white/60 text-sm">Subject</Label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-sm"
            >
              <option value="General Inquiry" className="bg-[#1a1a1c]">General Inquiry</option>
              <option value="Booking Question" className="bg-[#1a1a1c]">Booking Question</option>
              <option value="Property Management" className="bg-[#1a1a1c]">Property Management</option>
              <option value="Other" className="bg-[#1a1a1c]">Other</option>
            </select>
          </div>
          <div>
            <Label className="text-white/60 text-sm">Message</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={4}
              className="mt-1.5 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
