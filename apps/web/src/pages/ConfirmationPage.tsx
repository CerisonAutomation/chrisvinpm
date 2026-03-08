import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCheckoutStatus } from '@/hooks/useApi';
import { useBookingFlowStore } from '@/store';
import { Button } from '@/components/ui/button';
import { trackPurchase } from '@/lib/firebase';
import {
  CheckCircle, Loader2, XCircle, Calendar, MapPin, Users,
  Download, Mail, Phone, Home, ArrowRight
} from 'lucide-react';

export function ConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { reset } = useBookingFlowStore();
  const sessionId = searchParams.get('session_id');
  
  const { data: status, isLoading, error } = useCheckoutStatus(sessionId || '');
  const [tracked, setTracked] = useState(false);
  
  useEffect(() => {
    if (status?.payment_status === 'paid' && !tracked) {
      trackPurchase(status.reservation_id || sessionId || '', 0, 'EUR');
      setTracked(true);
      reset(); // Clear booking flow state
    }
  }, [status, tracked, sessionId, reset]);
  
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-24 flex items-center justify-center px-6">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Session</h1>
          <p className="text-white/50 mb-6">No booking session found.</p>
          <Button onClick={() => navigate('/properties')} className="bg-amber-500 text-black">
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-24 flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Confirming Your Booking</h1>
          <p className="text-white/50">Please wait while we process your reservation...</p>
        </div>
      </div>
    );
  }
  
  if (status?.payment_status === 'paid') {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-white/50">Your reservation has been successfully processed</p>
          </div>
          
          {/* Confirmation Details */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <p className="text-white/40 text-sm">CONFIRMATION NUMBER</p>
              <p className="text-2xl font-mono font-bold text-amber-400 mt-1">
                {status.reservation_id?.slice(0, 8).toUpperCase() || sessionId.slice(0, 8).toUpperCase()}
              </p>
            </div>
            
            <div className="border-t border-white/10 pt-6">
              <p className="text-white/50 text-sm text-center">
                A confirmation email has been sent to your email address with all the details of your booking.
              </p>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
            <h3 className="text-white font-semibold mb-4">What's Next?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/70 text-sm">
                <Mail className="w-4 h-4 text-amber-500 mt-0.5" />
                <span>Check your email for the full booking confirmation and property details</span>
              </li>
              <li className="flex items-start gap-3 text-white/70 text-sm">
                <Calendar className="w-4 h-4 text-amber-500 mt-0.5" />
                <span>Add your trip dates to your calendar</span>
              </li>
              <li className="flex items-start gap-3 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-amber-500 mt-0.5" />
                <span>Contact us if you have any questions: +356 7979 0202</span>
              </li>
            </ul>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/')}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium h-12"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
            <Button
              onClick={() => navigate('/properties')}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 h-12"
            >
              Browse More Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Payment failed or pending
  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Issue</h1>
        <p className="text-white/50 mb-6">
          There was an issue processing your payment. Please try again or contact support.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/properties')} className="bg-amber-500 text-black">
            Try Again
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
