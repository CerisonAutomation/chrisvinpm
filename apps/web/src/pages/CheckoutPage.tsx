import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuote, useListing, useCreateCheckoutSession } from '@/hooks/useApi';
import { useBookingFlowStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate, calculateNights, getFirstImage, cn } from '@/lib/utils';
import { trackBeginCheckout } from '@/lib/firebase';
import {
  Loader2, ChevronLeft, Calendar, Users, MapPin, Shield, Clock,
  CreditCard, Lock, AlertCircle, CheckCircle, Info
} from 'lucide-react';

export function CheckoutPage() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const { guestInfo, setGuestInfo } = useBookingFlowStore();
  
  const [firstName, setFirstName] = useState(guestInfo?.firstName || '');
  const [lastName, setLastName] = useState(guestInfo?.lastName || '');
  const [email, setEmail] = useState(guestInfo?.email || '');
  const [phone, setPhone] = useState(guestInfo?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { data: quote, isLoading: quoteLoading, error: quoteError } = useQuote(quoteId!);
  const { data: listing } = useListing(quote?.listingId || '', quote?.checkInDateLocalized, quote?.checkOutDateLocalized);
  const checkoutMutation = useCreateCheckoutSession();
  
  // Extract pricing from quote
  const ratePlan = quote?.rates?.ratePlans?.[0];
  const money = ratePlan?.money || ratePlan?.ratePlan?.money || {};
  const total = money.hostPayout || money.subTotalPrice || 0;
  const currency = money.currency || 'EUR';
  const nights = quote ? calculateNights(quote.checkInDateLocalized, quote.checkOutDateLocalized) : 0;
  
  useEffect(() => {
    if (quote && listing) {
      trackBeginCheckout(quote._id, total, currency);
    }
  }, [quote, listing]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote || !quoteId) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      setGuestInfo({ firstName, lastName, email, phone });
      
      const result = await checkoutMutation.mutateAsync({
        quoteId,
        guest: { firstName, lastName, email, phone },
        origin_url: window.location.origin,
      });
      
      // Redirect to Stripe
      window.location.href = result.url;
    } catch (err: any) {
      setError(err.response?.data?.detail?.message || 'Failed to process booking. Please try again.');
      setSubmitting(false);
    }
  };
  
  if (quoteLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }
  
  if (quoteError || !quote) {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-24 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-white font-semibold text-xl mb-2">Quote Expired</h2>
          <p className="text-white/50 mb-6">This booking quote has expired. Please select dates again.</p>
          <Button onClick={() => navigate('/properties')} className="bg-amber-500 text-black">
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }
  
  const image = getFirstImage(listing?.pictures);
  
  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Complete your booking</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guest Details */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  Guest Details
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/60 text-sm">First Name</Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-white/60 text-sm">Last Name</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-white/60 text-sm">Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-white/60 text-sm">Phone</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
                    />
                  </div>
                </div>
              </div>
              
              {/* Payment Info */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  Payment
                </h2>
                <p className="text-white/50 text-sm mb-4">
                  You'll be redirected to our secure payment partner to complete your booking.
                </p>
                <div className="flex items-center gap-4 text-white/40 text-xs">
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> SSL Encrypted</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure Payments</span>
                </div>
              </div>
              
              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Booking Failed</p>
                    <p className="text-red-400/70 text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold h-12 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                ) : (
                  <>Continue to Payment • {formatCurrency(total, currency)}</>
                )}
              </Button>
              
              <p className="text-white/40 text-xs text-center">
                By clicking Continue, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
              {/* Property Image */}
              {image && (
                <div className="aspect-video">
                  <img src={image} alt={listing?.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-white font-semibold mb-1">{listing?.title}</h3>
                <p className="text-white/50 text-sm flex items-center gap-1 mb-4">
                  <MapPin className="w-3 h-3" />
                  {listing?.address?.city || 'Malta'}
                </p>
                
                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/10">
                  <div>
                    <p className="text-white/40 text-xs">CHECK IN</p>
                    <p className="text-white text-sm font-medium">
                      {formatDate(quote.checkInDateLocalized, 'EEE, MMM d')}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">CHECK OUT</p>
                    <p className="text-white text-sm font-medium">
                      {formatDate(quote.checkOutDateLocalized, 'EEE, MMM d')}
                    </p>
                  </div>
                </div>
                
                {/* Price Breakdown */}
                <div className="py-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">{nights} nights</span>
                    <span className="text-white">{formatCurrency(money.fareAccommodation || total, currency)}</span>
                  </div>
                  {money.fareCleaning > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Cleaning fee</span>
                      <span className="text-white">{formatCurrency(money.fareCleaning, currency)}</span>
                    </div>
                  )}
                  {money.totalFees > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Service fees</span>
                      <span className="text-white">{formatCurrency(money.totalFees, currency)}</span>
                    </div>
                  )}
                  {money.totalTaxes > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Taxes</span>
                      <span className="text-white">{formatCurrency(money.totalTaxes, currency)}</span>
                    </div>
                  )}
                </div>
                
                {/* Total */}
                <div className="pt-4 border-t border-white/10 flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white font-bold text-lg">{formatCurrency(total, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
