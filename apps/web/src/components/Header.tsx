import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useModal } from '@/context/ModalContext';
import { useCMS } from '@/context/CMSContext';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openContact } = useModal();
  const navigate = useNavigate();

  const [activeLocale, setActiveLocale] = useState('en');

  const navLinks = {
    en: [
      { label: 'Properties', href: '/properties' },
      { label: 'For Owners', href: '/property-owners' },
    ],
    mt: [
      { label: 'Propjetajiet', href: '/properties' },
      { label: 'Għas-Sidien', href: '/property-owners' },
    ]
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-sm" />
      
      <nav className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
                <span className="text-black font-bold text-lg">CV</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/20 to-transparent rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-semibold text-sm tracking-wide">Christiano Vincenti</p>
              <p className="text-white/50 text-xs tracking-widest uppercase">Property Management</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks[activeLocale as keyof typeof navLinks].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-amber-400 to-amber-600 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}

            {/* Locale Switcher */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-6 ml-2">
              <button
                onClick={() => setActiveLocale('en')}
                className={cn("text-[10px] font-bold tracking-tighter transition-colors", activeLocale === 'en' ? "text-amber-500" : "text-white/40 hover:text-white/60")}
              >
                EN
              </button>
              <span className="text-white/10 text-[10px]">/</span>
              <button
                onClick={() => setActiveLocale('mt')}
                className={cn("text-[10px] font-bold tracking-tighter transition-colors", activeLocale === 'mt' ? "text-amber-500" : "text-white/40 hover:text-white/60")}
              >
                MT
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={openContact}
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">+356 7979 0202</span>
            </button>
            <Button
              onClick={() => navigate('/properties')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-medium px-6 h-9 text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all"
            >
              Book Now
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/5 transition-all duration-300",
          mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}>
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-white/80 hover:text-white py-2 text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={() => { navigate('/properties'); setMobileOpen(false); }}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
