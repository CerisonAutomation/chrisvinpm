import { Link } from 'react-router-dom';
import { useModal } from '@/context/ModalContext';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';

export function Footer() {
  const { openContact, openOwner } = useModal();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0A0A0B] border-t border-white/5">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/[0.02] to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-black font-bold text-lg">CV</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Christiano Vincenti</p>
                <p className="text-white/40 text-xs tracking-wider uppercase">Property Management</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Luxury vacation rentals in Malta. Experience the Mediterranean at its finest.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium text-sm tracking-wide mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/properties" className="text-white/50 hover:text-amber-400 text-sm transition-colors">Properties</Link></li>
              <li><Link to="/property-owners" className="text-white/50 hover:text-amber-400 text-sm transition-colors">For Owners</Link></li>
              <li><button onClick={openContact} className="text-white/50 hover:text-amber-400 text-sm transition-colors">Contact Us</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium text-sm tracking-wide mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <Phone className="w-4 h-4 text-amber-500/70" />
                <span>+356 7979 0202</span>
              </li>
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <Mail className="w-4 h-4 text-amber-500/70" />
                <span>info@cvpm.mt</span>
              </li>
              <li className="flex items-start gap-2 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-amber-500/70 mt-0.5" />
                <span>Malta</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-medium text-sm tracking-wide mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-amber-500/10 flex items-center justify-center transition-colors group">
                <Instagram className="w-4 h-4 text-white/50 group-hover:text-amber-400 transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-amber-500/10 flex items-center justify-center transition-colors group">
                <Facebook className="w-4 h-4 text-white/50 group-hover:text-amber-400 transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-amber-500/10 flex items-center justify-center transition-colors group">
                <Linkedin className="w-4 h-4 text-white/50 group-hover:text-amber-400 transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {currentYear} Christiano Vincenti Property Management. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/30 hover:text-white/50 text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/30 hover:text-white/50 text-xs transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
